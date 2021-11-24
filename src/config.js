import { z } from 'zod'
import { logLevelSchema } from './utils/pino.js'

/**
 * @typedef {import('zod').infer<typeof configSchema>} AppConfig
 */

export const configSchema = z.object({
  port: z.number().int().min(1).max(65535),
  logName: z.string(),
  logLevel: logLevelSchema,
  postgresURL: z.string().url()
})

const envSchema = z
  .object({
    PORT: z.string(),
    LOG_NAME: z.string(),
    LOG_LEVEL: logLevelSchema,
    DATABASE_URL: z.string().url()
  })
  .transform(env =>
    configSchema.parse({
      port: Number.parseInt(env.PORT),
      logName: env.LOG_NAME,
      logLevel: env.LOG_LEVEL,
      postgresURL: env.DATABASE_URL
    })
  )

/**
 * @param {NodeJS.ProcessEnv} env
 */
export function parseEnv (env) {
  const result = envSchema.safeParse(env)
  if (result.success) return result.data
  throw new ConfigError(result.error)
}

export class ConfigError extends Error {
  /**
   * @param {import('zod').ZodError} orig
   */
  constructor (orig) {
    super('Invalid configuration')
    Error.captureStackTrace(this, this.constructor)
    this.code = 'CONFIG_ERROR'
    this.cause = orig
  }

  toFriendlyString () {
    return [
      'Invalid configuration',
      ...this.cause.issues.map(issue => {
        return `- "${issue.path.join('.')}" ${issue.message}`
      })
    ].join('\n')
  }
}
