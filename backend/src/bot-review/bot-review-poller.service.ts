import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Submission } from '../entities/submission.entity';
import { BotReviewDraft } from '../entities/bot-review-draft.entity';
import { fetchWithTimeout } from '../fetch.util';

// Short interval on purpose — the whole point of this integration over the
// existing Slack-relay review flow is near-zero latency between a submission
// landing and a draft existing. 5 minutes (the fraud-review poll's interval)
// would defeat that; 30s costs nothing since `poll()` is a cheap no-op when
// there's nothing pending.
const POLL_INTERVAL_MS = 30 * 1000;

interface BotReviewSubmitterPayload {
  name: string | null;
  email: string | null;
  slackId: string | null;
  hackatimeUserId: string | null;
}

interface BotReviewDispatchPayload {
  projectId: string;
  submissionId: string | null;
  name: string;
  description: string;
  projectType: string;
  codeUrl: string | null;
  demoUrl: string | null;
  screenshot1Url: string | null;
  screenshot2Url: string | null;
  hackatimeProjectName: string[];
  aiUse: string | null;
  changeDescription: string | null;
  isUpdate: boolean;
  submitter: BotReviewSubmitterPayload;
}

@Injectable()
export class BotReviewPollerService {
  private readonly logger = new Logger(BotReviewPollerService.name);
  private readonly apiUrl: string | undefined;
  private readonly apiKey: string | undefined;
  private readonly configured: boolean;

  private polling = false;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Submission) private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(BotReviewDraft) private readonly draftRepo: Repository<BotReviewDraft>,
  ) {
    this.apiUrl = this.config.get('BOT_REVIEW_API_URL');
    this.apiKey = this.config.get('BOT_REVIEW_API_KEY');
    this.configured = !!(this.apiUrl && this.apiKey);
    if (!this.configured) {
      this.logger.warn(
        'BOT_REVIEW_API_URL/BOT_REVIEW_API_KEY not set — bot review integration disabled',
      );
    }
  }

  @Interval(POLL_INTERVAL_MS)
  async poll(): Promise<void> {
    if (!this.configured) return;
    if (this.polling) return; // skip overlapping cycles
    this.polling = true;
    try {
      await this.queueNewSubmissions();
      await this.dispatchPending();
    } finally {
      this.polling = false;
    }
  }

  // ── Queue ────────────────────────────────────────────────────────────────

  /**
   * Finds unreviewed projects whose latest submission has no current draft (or
   * whose draft is stale — a resubmission landed after the last dispatch) and
   * resets/creates a 'pending' BotReviewDraft row for them. Idempotent: safe to
   * call every tick.
   */
  private async queueNewSubmissions(): Promise<void> {
    const candidates = await this.projectRepo.find({ where: { status: 'unreviewed' } });
    for (const project of candidates) {
      const latestSubmission = await this.submissionRepo.findOne({
        where: { projectId: project.id },
        order: { createdAt: 'DESC' },
      });
      const latestSubmissionId = latestSubmission?.id ?? null;

      const existing = await this.draftRepo.findOne({ where: { projectId: project.id } });
      if (existing && existing.submissionId === latestSubmissionId) {
        continue; // already dispatched (or queued) for this exact submission
      }

      if (existing) {
        existing.submissionId = latestSubmissionId;
        existing.status = 'pending';
        existing.verdict = null;
        existing.hoursEstimate = null;
        existing.justification = null;
        existing.signalsFired = [];
        existing.dispatchedAt = null;
        existing.respondedAt = null;
        existing.dismissedAt = null;
        await this.draftRepo.save(existing);
      } else {
        await this.draftRepo.save(
          this.draftRepo.create({
            projectId: project.id,
            submissionId: latestSubmissionId,
            status: 'pending',
          }),
        );
      }
    }
  }

  // ── Dispatch ─────────────────────────────────────────────────────────────

  private async dispatchPending(): Promise<void> {
    const pending = await this.draftRepo.find({ where: { status: 'pending' } });
    for (const draft of pending) {
      try {
        await this.dispatchOne(draft);
      } catch (err) {
        this.logger.error(`Bot review dispatch failed for project ${draft.projectId}: ${err}`);
      }
    }
  }

  private async dispatchOne(draft: BotReviewDraft): Promise<void> {
    const project = await this.projectRepo.findOne({
      where: { id: draft.projectId },
      relations: ['user'],
    });
    if (!project || !project.user) {
      this.logger.warn(`Cannot dispatch bot review for ${draft.projectId} — project or user missing`);
      return;
    }

    const submission = draft.submissionId
      ? await this.submissionRepo.findOne({ where: { id: draft.submissionId } })
      : null;

    const payload: BotReviewDispatchPayload = {
      projectId: project.id,
      submissionId: draft.submissionId,
      name: project.name,
      description: project.description,
      projectType: project.projectType,
      codeUrl: project.codeUrl,
      demoUrl: project.demoUrl,
      screenshot1Url: project.screenshot1Url,
      screenshot2Url: project.screenshot2Url,
      hackatimeProjectName: project.hackatimeProjectName ?? [],
      aiUse: project.aiUse,
      changeDescription: submission?.changeDescription ?? null,
      isUpdate: project.isUpdate,
      submitter: {
        name: project.user.name ?? null,
        email: project.user.email ?? null,
        slackId: project.user.slackId ?? null,
        hackatimeUserId: project.user.hackatimeUserId ?? null,
      },
    };

    const res = await fetchWithTimeout(`${this.apiUrl}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      this.logger.error(`Bot review webhook failed (${res.status}) for ${project.id}: ${text}`);
      return; // stays 'pending' — retried next poll
    }

    draft.status = 'sent';
    draft.dispatchedAt = new Date();
    await this.draftRepo.save(draft);
    this.logger.log(`Dispatched project ${project.id} to review bot`);
  }
}
