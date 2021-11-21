import prismaClient from '@prisma/client'
import { once } from './lib/once.js'
import { configureLogger } from './utils/pino.js'
import { configSchema } from './config.js'
import { startServer } from './server.js'

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
