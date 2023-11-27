import * as dotenv from 'dotenv';
dotenv.config();

import logger from './config/logger';
import corsOptions from './config/cors-options';
import fastifyMultipart from '@fastify/multipart';

import { join } from 'path';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { PrismaService } from './config';
import { UserAuthGuard } from './common/hooks/guards/login-auth.guard';
import { keyCloakConnection } from './config/keycloak.config';

import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';

import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({ logger })
    );

    app.setGlobalPrefix('v1');

    const domainName = process.env.FRONTEND_DOMAIN;
    app.enableCors(corsOptions(domainName));

    const uploadFileSize = Number(process.env.FILE_SIZE);
    app.register(fastifyMultipart, {
      attachFieldsToBody: true,
      limits: { fileSize: uploadFileSize }
    });

    app.useStaticAssets({
      root: join(__dirname, '..', '/src/assets'),
      prefix: '/assets/'
    });

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
      );

      const prismaService = app.get(PrismaService);

    const reflector = new Reflector();
    app.useGlobalGuards(new UserAuthGuard(reflector, prismaService));

    // const { httpAdapter } = app.get(HttpAdapterHost);
    // app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));


    await keyCloakConnection();
    await app.listen(process.env.PORT, '0.0.0.0');

  } catch (error) {
    logger.error({ err: error });
    process.exit();
  }
}

bootstrap();
