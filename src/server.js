import fastify from 'fastify'
import fastifyHelmet from 'fastify-helmet'
import { ulid } from './lib/id.js'
import timeout from './lib/timeout.js'
import { fastifyZodValidator } from './lib/fastify-zod-validator.js'
import { notFoundHandler, errorHandler } from './utils/fastify.js'

/**
 * @param {object} params
 * @param {number} params.port
 * @param {string} [params.host]
 * @param {import('pino').Logger} params.logger
 */
export async function startServer ({ port, host = '0.0.0.0', logger }) {
  const app = fastify({
    genReqId: () => ulid(),
    logger
  })
  app.setValidatorCompiler(fastifyZodValidator)
  app.setErrorHandler(errorHandler)
  app.setNotFoundHandler(notFoundHandler)

  app.register(fastifyHelmet, {})

  await app.listen({ port, host })
  return async function closeServer () {
    await timeout(app.close(), 2000)
  }
}
