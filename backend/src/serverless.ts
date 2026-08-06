import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { json } from 'express';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

/**
 * Vercel keeps warm function instances alive across invocations, so we cache
 * the initialized Express app on the module scope instead of rebuilding the
 * whole Nest dependency graph (TypeORM connections included) on every request.
 */
let cachedApp: Express | undefined;

export async function getServerlessApp(): Promise<Express> {
  if (cachedApp) return cachedApp;

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  app.use(json({ limit: '50mb' }));
  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}
