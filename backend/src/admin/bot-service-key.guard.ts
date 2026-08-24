import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

/**
 * Authenticates the server-to-server call from the external review bot when it
 * fetches project context or writes a draft review back. The bot sends the
 * static shared secret as `X-Bot-Key`; we constant-time compare it against
 * BOT_SVC_SHARED_KEY. This is NOT a user route — there is no JWT here, only the
 * shared secret, so the endpoints it guards must never return anything (or
 * accept any write) a caller without the key could use to touch real review
 * state — see BotReviewDraft, which this key can only ever write to.
 */
@Injectable()
export class BotServiceKeyGuard implements CanActivate {
  private readonly logger = new Logger(BotServiceKeyGuard.name);

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('BOT_SVC_SHARED_KEY');
    if (!expected) {
      this.logger.error('BOT_SVC_SHARED_KEY not set — refusing bot service calls');
      throw new UnauthorizedException();
    }
    const req = context.switchToHttp().getRequest();
    const provided = req.headers['x-bot-key'];
    if (typeof provided !== 'string' || !this.constantTimeEqual(provided, expected)) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private constantTimeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) {
      timingSafeEqual(bb, bb);
      return false;
    }
    return timingSafeEqual(ab, bb);
  }
}
