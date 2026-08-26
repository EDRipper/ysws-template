import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

/**
 * A review-bot's draft verdict for a project, dispatched by BotReviewPollerService
 * and written back by the external bot via api/internal/bot/review. One row per
 * project (unique on project_id) — a resubmission resets it to 'pending' rather
 * than creating a second row, so there's always exactly one current draft.
 *
 * This is a SUGGESTION only. It is never read by admin.service's approve/reject
 * path and never mutates Project/ProjectReview — a human reviewer decides
 * whether to use it, same as the existing fraud_pending gate never lets an
 * external verdict auto-finalize without a human having approved first.
 */
@Entity('bot_review_drafts')
export class BotReviewDraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', unique: true })
  projectId: string;

  @OneToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  // Which submission this draft covers — lets a resubmission's stale draft be
  // told apart from a fresh one without deleting history.
  @Column({ type: 'uuid', name: 'submission_id', nullable: true })
  submissionId: string | null;

  // 'pending' (queued, not yet dispatched) | 'sent' (dispatched, awaiting the
  // bot's write-back) | 'complete' (bot responded) | 'error' (dispatch call
  // itself failed after retries — poller stops retrying and surfaces this so
  // it doesn't retry forever against a permanently broken payload).
  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  verdict: 'approved_full' | 'approved_deflated' | 'needs_changes' | 'rejected' | null;

  @Column({ type: 'real', name: 'hours_estimate', nullable: true })
  hoursEstimate: number | null;

  @Column({ type: 'text', nullable: true })
  justification: string | null;

  @Column({ type: 'text', name: 'signals_fired', nullable: true, transformer: {
    to: (value: string[] | null) => value && value.length > 0 ? JSON.stringify(value) : null,
    from: (value: string | null) => {
      if (!value) return [];
      try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; }
      catch { return []; }
    },
  }})
  signalsFired: string[];

  // Sanitized, submitter-safe checklist — only objective completeness items
  // (demo link loads, screenshot present, README matches, etc). Must never
  // carry fraud/heartbeat/AI-detection/duplicate-check content — those stay in
  // `justification` above, which is admin-only. Shown on the builder's own
  // project page so they can fix something basic before a human ever looks.
  @Column({ type: 'text', name: 'public_checklist', nullable: true, transformer: {
    to: (value: { label: string; pass: boolean }[] | null) =>
      value && value.length > 0 ? JSON.stringify(value) : null,
    from: (value: string | null) => {
      if (!value) return [];
      try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; }
      catch { return []; }
    },
  }})
  publicChecklist: { label: string; pass: boolean }[];

  // Short plain-language paragraph pairing with publicChecklist, same
  // no-sensitive-content rule.
  @Column({ type: 'text', name: 'public_summary', nullable: true })
  publicSummary: string | null;

  @Column({ type: 'timestamptz', name: 'dispatched_at', nullable: true })
  dispatchedAt: Date | null;

  @Column({ type: 'timestamptz', name: 'responded_at', nullable: true })
  respondedAt: Date | null;

  // Set when a reviewer dismisses the suggestion (not necessarily disagreeing —
  // just "seen, don't keep showing this"). Never cleared automatically.
  @Column({ type: 'timestamptz', name: 'dismissed_at', nullable: true })
  dismissedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
