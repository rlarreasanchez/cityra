import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppConfigService } from "../src/core/config/app-config.service.js";
import { DatabaseService } from "../src/core/database/database.service.js";
import { AppModule } from "./../src/app.module.js";

describe("AppController (e2e)", () => {
  let app: INestApplication | undefined;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppConfigService)
      .useValue({ get: () => undefined })
      .overrideProvider(DatabaseService)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/health (GET)", () => {
    return request(app!.getHttpServer())
      .get("/health")
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe("ok");
        expect(res.body.service).toBe("cityra-api");
        expect(new Date(res.body.timestamp).toString()).not.toBe(
          "Invalid Date"
        );
      });
  });

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });
});
