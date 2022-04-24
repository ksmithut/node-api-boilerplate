import prismaClient from '@prisma/client'
import { configSchema } from './config.js'
import { once } from './lib/once.js'
import { startServer } from './server.js'
import { configureLogger } from './utils/pino.js'

/**
 * @param {import('./config').AppConfig} config
 */
export function configureApp (config) {
  const { port, logName, logLevel, postgresURL } = configSchema.parse(config)
  const logger = configureLogger({ name: logName, level: logLevel })

  async function start () {
    const prisma = new prismaClient.PrismaClient({
      datasources: { db: { url: postgresURL } }
    })

    await prisma.$connect()
    const closeServer = await startServer({ port, logger })

    return once(async () => {
      await closeServer()
      await prisma.$disconnect()
    })
  }

  return { start }
}
