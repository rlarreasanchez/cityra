import { Inject, Injectable } from "@nestjs/common";

import { AppConfigService } from "@config/app-config.service.js";
import type { ILogger } from "./types/logger.js";
import { LOGGER_REPOSITORY_TOKEN } from "./types/tokens.js";
import {
  sanitizeErrorMessage,
  sanitizeForLog,
} from "./utils/sanitize-for-log.util.js";

@Injectable()
export class LoggerService implements ILogger {
  private logLevel: string[];
  private isProduction: boolean;

  constructor(
    @Inject(LOGGER_REPOSITORY_TOKEN) private readonly logger: ILogger,
    private readonly config: AppConfigService
  ) {
    this.logLevel = this.config.get("logLevel");
    this.isProduction = this.config.get("env") === "production";
  }

  /**
   * Sanitiza el mensaje si estamos en producción
   */
  private sanitizeMessage(message: string): string {
    if (!this.isProduction) {
      return message;
    }
    return sanitizeErrorMessage(message);
  }

  /**
   * Sanitiza el trace si estamos en producción
   */
  private sanitizeTrace(trace?: string): string | undefined {
    if (!trace || !this.isProduction) {
      return trace;
    }
    return sanitizeErrorMessage(trace);
  }

  debug(context: string, message: string) {
    if (this.logLevel.includes("debug") || this.logLevel.includes("all")) {
      const sanitizedMessage = this.sanitizeMessage(message);
      this.logger.debug(context, sanitizedMessage);
    }
  }

  log(context: string, message: string) {
    if (this.logLevel.includes("log") || this.logLevel.includes("all")) {
      const sanitizedMessage = this.sanitizeMessage(message);
      this.logger.log(context, sanitizedMessage);
    }
  }

  error(context: string, message: string, trace?: string) {
    if (this.logLevel.includes("error") || this.logLevel.includes("all")) {
      const sanitizedMessage = this.sanitizeMessage(message);
      const sanitizedTrace = this.sanitizeTrace(trace);
      this.logger.error(context, sanitizedMessage, sanitizedTrace);
    }
  }

  warn(context: string, message: string) {
    if (this.logLevel.includes("warn") || this.logLevel.includes("all")) {
      const sanitizedMessage = this.sanitizeMessage(message);
      this.logger.warn(context, sanitizedMessage);
    }
  }

  verbose(context: string, message: string) {
    if (this.logLevel.includes("verbose") || this.logLevel.includes("all")) {
      const sanitizedMessage = this.sanitizeMessage(message);
      this.logger.verbose(context, sanitizedMessage);
    }
  }

  /**
   * Método auxiliar para loguear objetos complejos de forma segura
   * Sanitiza automáticamente en producción
   * @param context - Contexto del log
   * @param message - Mensaje descriptivo
   * @param data - Objeto a loguear
   */
  logObject(context: string, message: string, data: unknown) {
    try {
      const sanitizedData = this.isProduction ? sanitizeForLog(data) : data;
      const logMessage = `${message} - ${JSON.stringify(sanitizedData)}`;
      this.log(context, logMessage);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.error(
        context,
        `Error al loguear objeto: ${errorMessage}`,
        errorStack
      );
    }
  }

  /**
   * Método auxiliar para loguear errores de forma segura
   * Sanitiza automáticamente en producción
   * @param context - Contexto del error
   * @param message - Mensaje descriptivo
   * @param error - Error capturado
   */
  logError(context: string, message: string, error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : String(error);
    const sanitizedError = this.isProduction
      ? sanitizeErrorMessage(errorMessage)
      : errorMessage;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.error(context, `${message}: ${sanitizedError}`, errorStack);
  }
}
