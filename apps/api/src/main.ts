import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { useContainer } from "class-validator";
import * as dotenv from "dotenv";

import { AppConfigService } from "@config/app-config.service.js";
import { AppModule } from "./app.module.js";
import { validationPipe } from "./core/exceptions/pipes/validation.pipe.js";

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
