import { Injectable } from "@nestjs/common";

import { NextFunction, Request, Response } from "express";

import { AppConfigService } from "@config/app-config.service.js";
import { doubleCsrf } from "csrf-csrf";

@Injectable()
export class CsrfService {
  private csrfProtection;

  constructor(private readonly config: AppConfigService) {
    const env = this.config.get("env");

    // Política de seguridad estricta sin excepciones
    // Producción → SIEMPRE secure=true (requiere HTTPS)
    // Desarrollo → SIEMPRE secure=false
    const useSecureCookies = env === "production";

    this.csrfProtection = doubleCsrf({
      getSecret: () => this.config.get("csrfSecret"),
      getSessionIdentifier: (req: Request) => req.sessionID,
      cookieName: this.config.get("csrfCookieName"),
      cookieOptions: {
        httpOnly: true,
        secure: useSecureCookies,
        sameSite: "strict",
        maxAge: 3600 * 1000, // 1 hour
      },
      ignoredMethods: ["GET", "HEAD", "OPTIONS"],
      // El token debe venir del header
      getCsrfTokenFromRequest: (req: Request) =>
        req.headers["x-csrf-token"] as string | undefined,
      errorConfig: {
        message: "invalid_csrf_token",
        statusCode: 403,
      },
    });
  }

  generateToken(req: Request, res: Response) {
    // Marca la sesión como modificada para forzar a express-session a persistirla
    // y enviar su cookie; si no, con saveUninitialized=false cada request obtiene
    // un sessionID efímero distinto y el hmac del CSRF (atado al sessionID) nunca coincide.
    req.session.csrfIssued = true;
    return this.csrfProtection.generateCsrfToken(req, res);
  }

  validateRequest(request: Request) {
    return this.csrfProtection.validateRequest(request);
  }

  /**
   * Middleware personalizado que maneja correctamente los errores de CSRF
   * Retorna error 403 con el mensaje correcto cuando falla la validación
   */
  getDoubleCsrfToken() {
    const csrfMiddleware = this.csrfProtection.doubleCsrfProtection;

    return (req: Request, res: Response, next: NextFunction) => {
      csrfMiddleware(req, res, (error?: unknown) => {
        if (error) {
          // Si hay error de CSRF, retornar respuesta 403 con formato JSON
          return res.status(403).json({
            statusCode: 403,
            timestamp: new Date().toISOString(),
            path: req.url,
            validationErrors: null,
            message: "invalid_csrf_token",
            errorToken: "INVALID_CSRF_TOKEN",
          });
        }
        next();
      });
    };
  }
}
