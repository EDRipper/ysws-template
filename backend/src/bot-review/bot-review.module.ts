import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../entities/project.entity';
import { Submission } from '../entities/submission.entity';
import { ProjectReview } from '../entities/project-review.entity';
import { BotReviewDraft } from '../entities/bot-review-draft.entity';
import { DevlogsModule } from '../devlogs/devlogs.module';
import { LookoutModule } from '../lookout/lookout.module';
import { BotReviewPollerService } from './bot-review-poller.service';
import { BotReviewInternalController } from './bot-review-internal.controller';
import { BotServiceKeyGuard } from '../admin/bot-service-key.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Submission, ProjectReview, BotReviewDraft]),
    DevlogsModule,
    LookoutModule,
  ],
  controllers: [BotReviewInternalController],
  providers: [BotReviewPollerService, BotServiceKeyGuard],
  exports: [BotReviewPollerService],
})
export class BotReviewModule {}
