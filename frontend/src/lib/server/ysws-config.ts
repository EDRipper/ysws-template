import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface YswsPublicConfig {
	program: { name: string; shortName: string; tagline: string; description: string };
	currency: { nameSingular: string; namePlural: string; symbol: string };
	theme: { accentColor: string; logoAsset?: string; faviconAsset?: string };
	event: { startDate?: string; endDate?: string; location?: string; timezone?: string };
	/** Only the public contact email is exposed here — NOT admin.superAdminSlackIds. */
	admin: { contactEmail: string };
}

let cached: YswsPublicConfig | undefined;

/**
 * Reads ysws.config.json from the repo root (falling back to the committed
 * ysws.config.example.json so a fresh checkout still boots) and returns only
 * the subset that's safe to send to the browser. Mirrors the backend's
 * YswsConfigService — kept separate since this one only exposes public
 * fields and lives in frontend/, not backend/.
 */
export function getPublicYswsConfig(): YswsPublicConfig {
	if (cached) return cached;

	const candidates = [
		join(process.cwd(), 'ysws.config.json'),
		join(process.cwd(), '..', 'ysws.config.json'),
		join(process.cwd(), 'ysws.config.example.json'),
		join(process.cwd(), '..', 'ysws.config.example.json')
	];
	const path = candidates.find((p) => existsSync(p));
	if (!path) {
		throw new Error('No ysws.config.json or ysws.config.example.json found. See SETUP.md.');
	}

	const full = JSON.parse(readFileSync(path, 'utf-8'));
	cached = {
		program: full.program,
		currency: full.currency,
		theme: full.theme,
		event: full.event ?? {},
		admin: { contactEmail: full.admin?.contactEmail }
	};
	return cached;
}
