import pino from 'pino'
import { z } from 'zod'

export const logLevelSchema = z.enum([
  'silent',
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal'
])

/**
 * @param {object} options
 * @param {string} options.name
 * @param {string} options.level
 * @param {boolean} [options.pretty=false]
 */
export function configureLogger ({ name, level, pretty = false }) {
  return pino({
    name,
    level: logLevelSchema.parse(level),
    prettyPrint: pretty,
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]'
      ]
    }
  })
}
