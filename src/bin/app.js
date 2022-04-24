import { Command } from 'commander'
import 'dotenv/config'
import process from 'node:process'
import { ConfigError, parseEnv } from '../config.js'
import { configureApp } from '../index.js'

const program = new Command()

program
  .command('start', { isDefault: true })
  .description('Starts the app server')
  .action(async () => {
    const config = parseEnv(process.env)
    const app = configureApp(config)
    const close = await app.start()
    function shutdown () {
      close()
        .then(() => process.exit())
        .catch(err => {
          console.error(err)
          process.exit(1)
        })
    }
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
    process.on('SIGUSR2', shutdown)
  })

program.parseAsync(process.argv).catch(error => {
  if (error instanceof ConfigError) {
    console.error(`\n${error.toFriendlyString()}\n`)
    process.exit(1)
  }
  console.error(error)
  process.exit(1)
})
