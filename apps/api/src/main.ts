import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppConfigService } from "@config/app-config.service.js";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

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
