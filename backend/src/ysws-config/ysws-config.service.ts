import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface YswsConfig {
  program: {
    name: string;
    shortName: string;
    tagline: string;
    description: string;
    url: string;
    organizer?: string;
    organizerUrl?: string;
  };
  currency: {
    nameSingular: string;
    namePlural: string;
    symbol: string;
    iconAsset?: string;
  };
  event: {
    startDate?: string;
    endDate?: string;
    location?: string;
    timezone?: string;
  };
  admin: {
    contactEmail: string;
    superAdminSlackIds?: string[];
  };
  integrations: {
    slackWorkspaceId?: string;
    hackatimeEnabled?: boolean;
    hcbEnabled?: boolean;
    attendEventSlug?: string;
  };
  theme: {
    accentColor: string;
    logoAsset?: string;
    faviconAsset?: string;
  };
  shop?: { categories?: string[] };
  social?: Record<string, string>;
}

/**
 * Loads ysws.config.json from the repo root once at boot and exposes it
 * read-only. Falls back to ysws.config.example.json (with a loud warning)
 * so a fresh checkout doesn't crash before an operator has configured it.
 * YSWS_CONFIG_PATH overrides the lookup path (used by the Vercel function
 * entrypoint, whose cwd differs from local dev).
 */
@Injectable()
export class YswsConfigService {
  private readonly logger = new Logger(YswsConfigService.name);
  private config: YswsConfig;

  constructor() {
    this.config = this.load();
  }

  private load(): YswsConfig {
    const explicit = process.env.YSWS_CONFIG_PATH;
    const candidates = explicit
      ? [explicit]
      : [
          join(process.cwd(), 'ysws.config.json'),
          join(process.cwd(), '..', 'ysws.config.json'),
        ];

    for (const path of candidates) {
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf-8'));
      }
    }

    const fallback = explicit
      ? null
      : [
          join(process.cwd(), 'ysws.config.example.json'),
          join(process.cwd(), '..', 'ysws.config.example.json'),
        ].find((p) => existsSync(p));

    if (fallback) {
      this.logger.warn(
        `ysws.config.json not found — falling back to ysws.config.example.json (${fallback}). Copy it to ysws.config.json and fill in your program's values before deploying.`,
      );
      return JSON.parse(readFileSync(fallback, 'utf-8'));
    }

    throw new Error(
      'No ysws.config.json or ysws.config.example.json found. See SETUP.md.',
    );
  }

  get(): YswsConfig {
    return this.config;
  }

  get program() {
    return this.config.program;
  }

  get currency() {
    return this.config.currency;
  }

  get event() {
    return this.config.event;
  }

  get admin() {
    return this.config.admin;
  }

  get integrations() {
    return this.config.integrations;
  }

  get theme() {
    return this.config.theme;
  }

  /** e.g. "5 pipes" / "1 credit" — pluralization-aware currency amount */
  formatCurrency(amount: number): string {
    const unit = amount === 1 ? this.currency.nameSingular : this.currency.namePlural;
    return `${amount} ${unit}`;
  }

  /** shortName used as JWT issuer/audience, event slugs, etc — defaults integrations.attendEventSlug to it */
  get attendEventSlug(): string {
    return this.integrations.attendEventSlug || this.program.shortName;
  }

  /**
   * Loops (email/CRM) custom field name for a lifecycle event, e.g.
   * loopsField('ApprovedProject') -> "Loops - example-yswsApprovedProject".
   * Each deployment's Loops account needs its own fields provisioned under
   * this program's shortName prefix — see SETUP.md.
   */
  loopsField(suffix: string): string {
    return `Loops - ${this.program.shortName}${suffix}`;
  }
}
