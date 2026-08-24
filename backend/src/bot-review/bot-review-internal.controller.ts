import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotServiceKeyGuard } from '../admin/bot-service-key.guard';
import { Project } from '../entities/project.entity';
import { ProjectReview } from '../entities/project-review.entity';
import { BotReviewDraft } from '../entities/bot-review-draft.entity';
import { DevlogsService } from '../devlogs/devlogs.service';
import { LookoutService } from '../lookout/lookout.service';

const VALID_VERDICTS = ['approved_full', 'approved_deflated', 'needs_changes', 'rejected'] as const;

interface WriteBackReviewDto {
  projectId: string;
  verdict: (typeof VALID_VERDICTS)[number];
  hoursEstimate?: number | null;
  justification: string;
  signalsFired?: string[];
}

/**
 * Internal, shared-key-gated routes the external review bot calls to fetch a
 * project's full context and write its draft verdict back. Mirrors
 * AuditInternalController's shape (opaque-ish trust boundary via a static
 * shared key, not a JWT) but for the bot-review integration instead of the
 * private audit service.
 */
@Controller('api/internal/bot')
export class BotReviewInternalController {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectReview) private readonly reviewRepo: Repository<ProjectReview>,
    @InjectRepository(BotReviewDraft) private readonly draftRepo: Repository<BotReviewDraft>,
    private readonly devlogsService: DevlogsService,
    private readonly lookoutService: LookoutService,
  ) {}

  /**
   * Full context for a project the bot has been dispatched (see
   * BotReviewPollerService) — devlogs, Lookout evidence, and prior human
   * review history, so the bot's rubric doesn't have to guess review state
   * from the dispatch payload alone.
   */
  @UseGuards(BotServiceKeyGuard)
  @Get('project/:projectId/context')
  async getProjectContext(@Param('projectId', ParseUUIDPipe) projectId: string) {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('project not found');

    const [devlogs, lookout, priorReviews] = await Promise.all([
      this.devlogsService.findByProject(projectId, true),
      this.lookoutService.listForProjectReview(projectId),
      this.reviewRepo.find({ where: { projectId }, order: { createdAt: 'DESC' } }),
    ]);

    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        projectType: project.projectType,
        codeUrl: project.codeUrl,
        readmeUrl: project.readmeUrl,
        demoUrl: project.demoUrl,
        screenshot1Url: project.screenshot1Url,
        screenshot2Url: project.screenshot2Url,
        hackatimeProjectName: project.hackatimeProjectName ?? [],
        aiUse: project.aiUse,
        otherHcProgram: project.otherHcProgram,
        isUpdate: project.isUpdate,
      },
      devlogs,
      lookout,
      totalLapseSeconds: lookout.totalTrackedSeconds,
      priorReviews: priorReviews.map((r) => ({
        status: r.status,
        feedback: r.feedback,
        internalNote: r.internalNote,
        overrideJustification: r.overrideJustification,
        createdAt: r.createdAt,
      })),
    };
  }

  /**
   * Write-back for a dispatched draft. Only ever touches BotReviewDraft — never
   * Project or ProjectReview, so a compromised or buggy bot call cannot forge a
   * real approval/rejection. A human reviewer is the only path that writes
   * ProjectReview (see AdminService.reviewProject).
   */
  @UseGuards(BotServiceKeyGuard)
  @Post('review')
  async writeBackReview(@Body() body: WriteBackReviewDto) {
    if (!body?.projectId) throw new BadRequestException('projectId is required');
    if (!VALID_VERDICTS.includes(body.verdict)) {
      throw new BadRequestException(`verdict must be one of: ${VALID_VERDICTS.join(', ')}`);
    }
    if (!body.justification || typeof body.justification !== 'string') {
      throw new BadRequestException('justification is required');
    }

    const draft = await this.draftRepo.findOne({ where: { projectId: body.projectId } });
    if (!draft) throw new NotFoundException('no bot review draft found for this project');
    if (draft.status !== 'sent') {
      // Not currently awaiting a response — e.g. superseded by a resubmission
      // since dispatch, or already answered. Reject rather than silently
      // overwrite a fresher draft with a stale response.
      throw new BadRequestException(
        `draft for ${body.projectId} is '${draft.status}', not awaiting a response`,
      );
    }

    draft.verdict = body.verdict;
    draft.hoursEstimate = body.hoursEstimate ?? null;
    draft.justification = body.justification.slice(0, 8000);
    draft.signalsFired = Array.isArray(body.signalsFired) ? body.signalsFired.slice(0, 50) : [];
    draft.status = 'complete';
    draft.respondedAt = new Date();
    await this.draftRepo.save(draft);

    return { ok: true };
  }
}
