import exampleConfig from '../../../../ysws.config.example.json';

export interface YswsPublicConfig {
	program: { name: string; shortName: string; tagline: string; description: string };
	currency: { nameSingular: string; namePlural: string; symbol: string };
	theme: { accentColor: string; logoAsset?: string; faviconAsset?: string };
	event: { startDate?: string; endDate?: string; location?: string; timezone?: string };
	/** Only the public contact email is exposed here — NOT admin.superAdminSlackIds. */
	admin: { contactEmail: string };
}

// Vite's import.meta.glob is resolved at BUILD time, so — unlike a runtime
// fs.readFileSync(path) — it's visible to every adapter's bundler (Vercel's
// included) whether or not the file happens to exist. Returns an empty
// object if ysws.config.json isn't present (the common case: it's
// gitignored in this shared template, real per-deployment values are meant
// to be committed in each program's own fork — see SETUP.md).
const realConfigModules = import.meta.glob('../../../../ysws.config.json', {
	eager: true,
	import: 'default'
});
const realConfig = Object.values(realConfigModules)[0] as Record<string, unknown> | undefined;

let cached: YswsPublicConfig | undefined;

/**
 * Returns the subset of ysws.config.json (or, absent that, the committed
 * ysws.config.example.json) that's safe to send to the browser. Mirrors the
 * backend's YswsConfigService — kept separate since this one only exposes
 * public fields and lives in frontend/, not backend/.
 */
export function getPublicYswsConfig(): YswsPublicConfig {
	if (cached) return cached;

	const full = (realConfig ?? exampleConfig) as any;
	cached = {
		program: full.program,
		currency: full.currency,
		theme: full.theme,
		event: full.event ?? {},
		admin: { contactEmail: full.admin?.contactEmail }
	};
	return cached;
}
