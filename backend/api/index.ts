import 'reflect-metadata';
import type { IncomingMessage, ServerResponse } from 'http';
import { getServerlessApp } from '../src/serverless';

/**
 * Single Vercel serverless function fronting the whole Nest app (see
 * ../../SETUP.md#vercel). vercel.json rewrites every /api/* request here so
 * Nest's own routing/guards/pipes run exactly as they do outside Vercel —
 * this deliberately avoids re-modeling routes as individual functions.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getServerlessApp();
  app(req, res);
}
