import { z, ZodPreprocess, ZodType } from "zod";

export const envSchema = z.object({
  APP_NAME: cleanEmptyString(
    z.string().optional().default("NestJS Application")
  ),
  APP_VERSION: cleanEmptyString(z.string().optional().default("1.0.0")),
  APP_DESCRIPTION: cleanEmptyString(
    z.string().optional().default("NestJS Application Description")
  ),
  APP_PORT: cleanEmptyString(
    z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 3000))
  ),
  APP_HOST: cleanEmptyString(z.string().optional().default("localhost")),
  APP_PREFIX: cleanEmptyString(z.string().optional().default("api")),
  APP_ENV: cleanEmptyString(
    z
      .enum(["development", "production", "test"])
      .optional()
      .default("development")
  ),
});

export const readableConfigSchema = envSchema.transform((env) => ({
  appName: env.APP_NAME,
  appVersion: env.APP_VERSION,
  appDescription: env.APP_DESCRIPTION,
  port: env.APP_PORT,
  host: env.APP_HOST,
  globalPrefix: env.APP_PREFIX,
  env: env.APP_ENV,
}));

export type ReadableEnvVariables = z.infer<typeof readableConfigSchema>;

function cleanEmptyString<T extends ZodType>(schema: T): ZodPreprocess<T> {
  return z.preprocess((value) => {
    if (value === "" || value == null) {
      return undefined;
    }
    return value;
  }, schema);
}
