// Hack Club's CDN occasionally emits `Access-Control-Allow-Origin` twice on
// the same response, which browsers reject as an invalid header value. This
// route refetches the asset server-side and re-emits a single clean CORS
// header so the client-side sticker field (three.js TextureLoader) can load
// it cross-origin. Mirrors the reference peel-demo's api/proxy.py.
//
// This is a public endpoint reachable by anyone, so the allowlist below is
// load-bearing: only the two Hack Club asset hosts are ever proxied, nothing
// else. Do not widen it without re-checking it can't become an open proxy.
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const ALLOWED_HOSTS = new Set(['cdn.hackclub.com', 'user-cdn.hackclub-assets.com']);

const UA = 'Mozilla/5.0 (compatible; StickerFieldProxy/1.0)';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const target = url.searchParams.get('url');
	if (!target) {
		error(400, 'missing ?url=');
	}

	let parsed: URL;
	try {
		parsed = new URL(target);
	} catch {
		error(400, 'invalid url');
	}

	if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname)) {
		error(403, 'refusing to proxy non-hackclub host');
	}

	let upstream: Response;
	try {
		upstream = await fetch(parsed.toString(), {
			headers: { 'User-Agent': UA },
			signal: AbortSignal.timeout(20000)
		});
	} catch (err) {
		error(502, `upstream error: ${err instanceof Error ? err.message : String(err)}`);
	}

	if (!upstream.ok) {
		error(502, `upstream error: ${upstream.status}`);
	}

	const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
	const body = await upstream.arrayBuffer();

	return new Response(body, {
		status: 200,
		headers: {
			'Content-Type': contentType,
			'Access-Control-Allow-Origin': '*',
			'Cache-Control': 'public, max-age=86400, immutable',
			'Content-Length': String(body.byteLength)
		}
	});
};
