/**
 * @type {import('fastify/types/schema').FastifySchemaCompiler<import('zod').ZodType<any>>}
 */
export function fastifyZodValidator ({ schema, httpPart }) {
  return data => {
    const result = schema.safeParse(data, { path: httpPart ? [httpPart] : [] })
    return result.success ? { value: result.data } : { error: result.error }
  }
}

/**
 * @description This function is just a passthrough to get types to work in the
 * resolver
 * @template {import('zod').ZodType<any>} TBody=import('zod').ZodUnknown
 * @template {import('zod').ZodType<any>} TQuerystring=import('zod').ZodUnknown
 * @template {import('zod').ZodType<any>} TParams=import('zod').ZodUnknown
 * @template {import('zod').ZodType<any>} THeaders=import('zod').ZodUnknown
 * @template {import('zod').ZodType<any>} TReply=import('zod').ZodUnknown
 * @param {object} params
 * @param {object} params.schema
 * @param {TBody} [params.schema.body]
 * @param {TQuerystring} [params.schema.querystring]
 * @param {TParams} [params.schema.params]
 * @param {THeaders} [params.schema.headers]
 * @param {TReply} [params.schema.response]
 * @param {import('fastify').RouteHandlerMethod<
 *   import('node:http').Server,
 *   import('node:http').IncomingMessage,
 *   import('node:http').ServerResponse,
 *   {
 *     Body: import('zod').infer<TBody>,
 *     Querystring: import('zod').infer<TQuerystring>,
 *     Params: import('zod').infer<TParams>,
 *     Headers: import('zod').infer<THeaders>,
 *     Reply: import('zod').infer<TReply>
 *   }
 * >} params.handler
 */
export function typedHandler ({ schema, handler }) {
  return { schema, handler }
}
