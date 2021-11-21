import { ZodError } from 'zod'

/**
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export function notFoundHandler (request, reply) {
  return reply.status(404).send({
    code: 'ROUTE_NOT_HANDLED',
    message: `Route ${request.method}:${request.url} not found`,
    error: 'Not Found'
  })
}

/**
 * @param {import('fastify').FastifyError} error
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function errorHandler (error, request, reply) {
  if (error instanceof ZodError) {
    return reply.status(422).send({
      code: 'VALIDATION_ERROR',
      details: error.issues,
      statusCode: 422
    })
  }
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      code: error.code,
      message: error.message,
      statusCode: error.statusCode
    })
  }
  request.log.error({ err: error })
  reply.status(500)
  return reply.send({ code: 'INTERNAL_SERVER_ERROR', statusCode: 500 })
}
