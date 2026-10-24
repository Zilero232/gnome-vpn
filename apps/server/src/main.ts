import 'reflect-metadata';

// eslint-disable-next-line perfectionist/sort-imports -- reflect-metadata must be evaluated before any module that declares or reads decorator metadata
import type { NestExpressApplication } from '@nestjs/platform-express';

import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import helmet from 'helmet';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppModule } from './app.module';
import { allowedOrigins, env } from './config';
import { appLogger } from './core';

const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false, logger: appLogger });

app.set('trust proxy', 1);
app.set('etag', false);

app.use(helmet({ contentSecurityPolicy: false }));

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  exposedHeaders: ['set-auth-token', 'content-disposition']
});

app.use(json());
app.useGlobalPipes(new ZodValidationPipe());
app.enableShutdownHooks();

await app.listen(env.PORT);
