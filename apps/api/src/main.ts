import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { useContainer } from "class-validator";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import session from "express-session";

import { AppConfigService } from "@config/app-config.service.js";
import { validationPipe } from "@core/exceptions/pipes/validation.pipe.js";
import { ResponseInterceptor } from "@core/responses/interceptors/response.interceptor.js";
import { SessionService } from "@core/session/session.service.js";
import { AppModule } from "./app.module.js";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  // Enable CORS
  app.enableCors({
    origin: [...config.get("allowedOrigins")],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  // Session Middleware
  const sessionService = app.get(SessionService);
  app.use(
    session({
      ...sessionService.getConfig(),
    })
  );

  // Cookies Middleware
  app.use(cookieParser(config.get("cookieSecret")));

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor(config));

  // pipes
  app.useGlobalPipes(validationPipe);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // global api prefix
  const globalPrefix = config.get("globalPrefix");
  app.setGlobalPrefix(globalPrefix);

  // Enable Versioning
  app.enableVersioning({
    defaultVersion: "1",
    type: VersioningType.URI,
  });

  // Start the app
  const port = config.get("port");
  const host = config.get("host");
  await app.listen(port, host);
}
await bootstrap();
