import { Global, Injectable } from "@nestjs/common";

import { SessionOptions } from "express-session";

import { AppConfigService } from "@config/app-config.service.js";
import { KeyvSessionStore } from "./store/keyv-session-store.js";

@Global()
@Injectable()
export class SessionService {
  constructor(private readonly config: AppConfigService) {}

  getConfig(): SessionOptions {
    const env = this.config.get("env");

    // Política de seguridad estricta sin excepciones
    // Producción → SIEMPRE secure=true (requiere HTTPS)
    // Desarrollo → SIEMPRE secure=false
    const useSecureCookies = env === "production";

    return {
      secret: this.config.get("sessionSecret"),
      name: this.config.get("sessionCookieName"),
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: "/",
        httpOnly: true,
        secure: useSecureCookies,
        maxAge: this.config.get("sessionExpiration") * 1000,
        sameSite: "strict",
      },
      proxy: useSecureCookies,
      store: new KeyvSessionStore(
        `redis://${this.config.get("redisHost")}:${this.config.get(
          "redisPort"
        )}`,
        this.config.get("redisPassword") as string
      ),
    };
  }
}
