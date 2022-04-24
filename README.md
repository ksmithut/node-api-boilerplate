# boilerplate

# Prerequisites

- [Node.js](https://nodejs.org) >=16.0.0
- [Yarn](https://classic.yarnpkg.com) ^1.0.0

For local development

- [Docker](https://www.docker.com/) podman may also work for this, but has not been tested

For production

- [PostgreSQL](https://www.postgresql.org/)

# Setup

(First time) Copy `.env.example` file to `.env`

```sh
yarn copyenv
```

Install dependencies:

```sh
yarn
```

# Running

Run the database server:

```sh
yarn docker:up
```

(First time) Run database migrations:

```sh
yarn prisma migrate deploy
```

Start up server:

```sh
yarn start:dev
```

When you're done, you can shut the database down:

```sh
yarn docker:down
```

# Scripts

- `yarn format` - Formats the code. The code should be formatted in a pre-commit
  hook, so you shouldn't need to worry about this, but here's the command should
  you need it for other editor integrations.
- `yarn lint` - Lints the code and checks for formatting errors. Good to run for
  a lint check in Continuous Integration. This also runs the type checker to
  make sure types check out.
- `yarn prepare` - This is run after `yarn install` to install the pre-commit
  hooks to run linting. You shouldn't need to run this.
- `yarn copyenv` - Copies the `.env.example` over to `.env`. It will display an
  error if `.env` already exists to prevent losing valuable developer time to
  setting that back up.
- `yarn start` - Starts the application.
- `yarn start:dev` - Starts the application in auto-restart mode. The server
  will auto-restart when a file changes. This also has prettier logs than the
  normal start method.
- `yarn docker:up` - Starts the extra services required for this application
  such as PostgreSQL. This runs a `docker compose` command with some extra flags
  including one for running it in the background.
- `yarn docker:down` - Shuts down the extra services required for this
  application.

Prisma scripts

- `yarn prisma migrate deploy` - Runs the database migrations.
- `yarn prisma migrate dev` - Creates new migration files based on changes to
  the prisma schema. Used for development when making changes to the schema.
- `yarn prisma migrate reset` - Reset your database and apply all migrations.
  This should only ever be done locally and never in production after production
  data is in place.
- `yarn prisma studio` - Runs a web server that connects to your database. You
  can use this in place of a database client.
- `yarn prisma db push` - Pushes the state of your schema to your database. This
  should only be run in development when you want to test out changes to your
  schema before generating migrations.

<details>
<summary>To add a new service:</summary>

`src/services/example/example.model.js`

```js
/**
 * @typedef {ReturnType<configureExampleModel>} ExampleModel
 */

/**
 * @typedef {import('@prisma/client').Example} Example
 */

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export function configureExampleModel (prisma) {
  return {}
}
```

`src/services/example/example.service.js`

```js
/**
 * @typedef {ReturnType<configureExampleService>} ExampleService
 */

/**
 * @param {object} params
 * @param {import('./example.model').ExampleModel} params.exampleModel
 */
export function configureExampleService ({ exampleModel }) {
  return {}
}
```

`src/services/example/example.fastify.js`

```js
import { z } from 'zod'
import { typedHandler } from '../../lib/fastify-zod-validator.js'

/**
 * @type {import('fastify').FastifyPluginAsync<{}>}
 */
export async function exampleRoutes (app, options) {
  app.post(
    '/',
    typedHandler({
      schema: {
        body: z.object({ foo: z.string() }),
        response: z.object({ foo: z.string() })
      },
      async handler (request, reply) {
        return reply.send(request.body)
      }
    })
  )
}
```

</details>

<details>
<summary>To add server-side rendering (like pug):</summary>

```sh
yarn add point-of-view
```

`src/server.js`

```js
import pointOfView from 'point-of-view'
import pug from 'pug'
// ...
const VIEWS_ROOT = new URL('./views/', import.meta.url).pathname
// ...
app.register(pointOfView, {
  engine: { pug },
  options: { basedir: VIEWS_ROOT },
  root: VIEWS_ROOT
})
```

`src/views/layouts/default.pug`

```pug
html
  head
    title= title
    meta(name='viewport' content='width=device-width, initial-scale=1')
  body
    block content
```

`src/views/index.pug`

```pug
extends layouts/default.pug

block content
  h1 Hello World
```

```js
reply.view('index.pug', { title: 'Home' })
```

</details>

<details>
<summary>To add a React front-end:</summary>

```sh
yarn add fastify-static fastify-accepts
yarn add -D \
  vite @vitejs/plugin-react \
  react @types/react \
  react-dom @types/react-dom \
  npm-run-all
npm set-script 'build' 'vite build'
npm set-script 'client:dev' 'vite'
npm set-script 'dev' 'run-p --print-label start:dev client:dev'
```

`Dockerfile`

```dockerfile
FROM node:16-alpine AS build

# Needed for bcrypt
# RUN apk --no-cache add --virtual builds-deps build-base python2

# Create app directory
RUN mkdir -p /app && chown node:node /app
USER node
WORKDIR /app

# Install dependencies
COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node prisma prisma
RUN yarn --frozen-lockfile

# Bundle app source
COPY --chown=node:node src src
# Build client
COPY --chown=node:node vite.config.js ./
RUN yarn build

FROM node:16-alpine AS release

# Needed for bcrypt
# RUN apk --no-cache add --virtual builds-deps build-base python2

# Create app directory
RUN mkdir -p /app && chown node:node /app
USER node
WORKDIR /app

# Install dependencies
COPY --chown=node:node --from=build /app/package.json /app/yarn.lock ./
COPY --chown=node:node --from=build /app/prisma prisma
RUN yarn --frozen-lockfile --production

# Bundle app source
COPY --chown=node:node --from=build /app/src src

# Exports
EXPOSE 3000
CMD [ "node", "src/bin/app.js" ]
```

`vite.config.js`

```js
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const { DEV_PORT = '3001', API_PROXY = 'http://localhost:3000' } = process.env

const SOURCE = new URL('./src/client/', import.meta.url).pathname
const DESTINATION = new URL('./public/', import.meta.url).pathname

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: SOURCE,
  build: {
    outDir: DESTINATION,
    emptyOutDir: true
  },
  server: {
    port: Number.parseInt(DEV_PORT, 10),
    proxy: {
      '/api': `${API_PROXY}/api`
    }
  }
})
```

`src/server.js`

```js
import fastifyAccepts from 'fastify-accepts'
import fastifyStatic from 'fastify-static'
// ...
const PUBLIC_PATH = new URL('../public/', import.meta.url).pathname
// ...
app.register(fastifyStatic, { root: PUBLIC_PATH })
app.register(fastifyAccepts)
// ...
function notFoundHandler (request, reply) {
  const accept = request.accepts()
  // Check accepts headers or check request.url
  if (request.method === 'GET' && accept.type('html')) {
    return reply.sendFile('index.html')
  }
  // ...
}
```

`src/client/index.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./index.jsx"></script>
  </body>
</html>
```

`src/client/index.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'

ReactDOM.render(<App />, document.getElementById('root'))
```

`src/client/App.jsx`

```jsx
import React from 'react'

export default function App () {
  return <h1>Hello World</h1>
}
```

</details>

<details>
<summary>To add a JSON web token signing library:</summary>

```sh
yarn add jawt
npm set-script 'key:generate' 'node src/bin/app.js key:generate'
```

`src/config.js`

```js
const jsonWebKeySchema = z.object({
  alg: z.string().optional(),
  crv: z.string().optional(),
  d: z.string().optional(),
  dp: z.string().optional(),
  dq: z.string().optional(),
  e: z.string().optional(),
  ext: z.boolean().optional(),
  k: z.string().optional(),
  key_ops: z.array(z.string()).optional(),
  kty: z.string().optional(),
  n: z.string().optional(),
  oth: z
    .array(
      z.object({
        d: z.string().optional(),
        r: z.string().optional(),
        t: z.string().optional()
      })
    )
    .optional(),
  p: z.string().optional(),
  q: z.string().optional(),
  qi: z.string().optional(),
  use: z.string().optional(),
  x: z.string().optional(),
  y: z.string().optional()
})
const jsonWebKeySetSchema = z.object({
  keys: z.array(jsonWebKeySchema).min(1)
})
// ...
export const configSchema = z.object({
  // ...
  jwks: jsonWebKeySetSchema
})
// ...
const envSchema = z
  .object({
    // ...
    JWKS: z.string()
  })
  .transform(env =>
    configSchema.parse({
      // ...
      jwks: JSON.parse(env.JWKS)
    })
  )
```

`src/index.js`

```js
import { createKeyStoreFromJWKS } from 'jawt'
// ...
export function configureApp (config) {
  // ...
  const {
    // ...
    jwks
  } = configSchema.parse(config)
  // ...
  async function start () {
    const keyStore = await createKeyStoreFromJWKS(jwks)
    // ...
  }
}
```

`src/bin/app.js`

```js
import { Command, InvalidArgumentError } from 'commander'
import { generate } from 'jawt'
// ...
const KEY_ALGORITHMS = new Set([
  'HS256',
  'HS384',
  'HS512',
  'RS256',
  'RS384',
  'RS512',
  'PS256',
  'PS384',
  'PS512',
  'ES256',
  'ES384',
  'ES512'
])

program
  .command('key:generate')
  .argument('<alg>', 'The algorithm to use', value => {
    const parsedValue = value.toUpperCase()
    if (!KEY_ALGORITHMS.has(parsedValue)) {
      const algorithms = [...KEY_ALGORITHMS].join('\n')
      throw new InvalidArgumentError(
        `Pass in one of the following values:\n${algorithms}`
      )
    }
    return parsedValue
  })
  .description('Generate a new key for token signing')
  .option(
    '-m, --modulus-length <number>',
    'The modulus length to use for RSX and PSX algorithms',
    value => {
      const parsedValue = parseInt(value, 10)
      if (isNaN(parsedValue)) {
        throw new InvalidArgumentError('Must be a number.')
      }
      if (parsedValue < 2048) {
        throw new InvalidArgumentError('Must be at least 2048')
      }
      return parsedValue
    }
  )
  .action(async (alg, { modulusLength }) => {
    const key = await generate(alg, { modulusLength })
    process.stdout.write(JSON.stringify(key.jwk(true)))
    process.stderr.write('\n')
  })
```

`package.json`

```json
{
  "scripts": {
    "key:generate": "node src/bin/app.js key:generate"
  }
}
```

`.env.example`

```sh
# ...
JWKS={"keys":[]}
```

```sh
yarn key:generate ES256
# Copy __output__ to clipboard
```

`.env`

```sh
# ...
JWKS={"keys":[__output__]}
```

</details>

<details>
<summary>To add apollo-server:</summary>

```
yarn add \
  apollo-server-fastify \
  apollo-server-core \
  graphql \
  @graphql-tools/schema \
  dataloader
```

`src/lib/fastify-app-close-plugin.js`

```js
/**
 * @param {import('fastify').FastifyInstance} app
 * @returns {import('apollo-server-plugin-base').ApolloServerPlugin}
 */
export function fastifyAppClosePlugin (app) {
  return {
    async serverWillStart () {
      return {
        async drainServer () {
          await app.close()
        }
      }
    }
  }
}
```

`src/lib/graphql-id.js`

```js
/**
 * @param {string} __typename
 * @param {string} id
 */
export function encodeNodeId (id, __typename) {
  return Buffer.from(`${__typename}:${id}`).toString('base64url')
}

/**
 * @param {string} encodedId
 * @returns {[string, string]} [id, __typename]
 */
export function decodeNodeId (encodedId) {
  const parts = Buffer.from(encodedId.trim(), 'base64url')
    .toString()
    .split(':', 2)
  return [parts[1], parts[0] ?? '']
}
```

`src/lib/key-by.js`

```js
/**
 * @template TValue
 * @param {TValue[]} list
 * @param {keyof TValue} key
 */
export function keyBy (list, key) {
  return list.reduce(
    /**
     * @param {Record<string, TValue>} byId
     * @param {TValue} item
     */
    (byId, item) => {
      byId[String(item[key])] = item
      return byId
    },
    {}
  )
}
```

`src/utils/apollo-types.js`

```js
import { gql } from 'apollo-server-core'

export default gql`
  interface Node {
    id: ID!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type Query {
    node(id: ID!): Node
  }
`
```

`src/utils/apollo-schema.js`

```js
import { makeExecutableSchema } from '@graphql-tools/schema'
import { decodeNodeId } from '../lib/graphql-id.js'
import typeDefs from './apollo-types.js'

/**
 * @typedef {Map<string, (id: string, ctx: import('../server').ApolloContext) => any>} NodeTypeMap
 */

/**
 * @type {NodeTypeMap}
 */
const NODE_TYPES = new Map([])
const DEFAULT_NODE_TYPE_HANDLER = () => null

/**
 * @type {import('@graphql-tools/utils').IResolvers<any, import('../server').ApolloContext>}
 */
const resolvers = {
  Query: {
    async node (_, { id: nodeId }, ctx) {
      const [id, __typename] = decodeNodeId(nodeId)
      const handler = NODE_TYPES.get(__typename) ?? DEFAULT_NODE_TYPE_HANDLER
      const node = await handler(id, ctx)
      return node ? { __typename, ...node } : null
    }
  }
}

export default makeExecutableSchema({
  typeDefs,
  resolvers
})
```

`src/server.js`

```js
import { mergeSchemas } from '@graphql-tools/schema'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-fastify'
import { fastifyAppClosePlugin } from './lib/fastify-app-close-plugin.js'
// ...
import rootSchema from './utils/apollo-schema.js'
// ...after fastify configuration but before any app.register() calls
const apollo = new ApolloServer({
  schema: mergeSchemas({
    schemas: [rootSchema]
  }),
  context: configureApolloContext({}),
  plugins: [
    fastifyAppClosePlugin(app),
    ApolloServerPluginDrainHttpServer({ httpServer: app.server })
  ]
})
await apollo.start()
// ...
app.register(apollo.createHandler())
// ...
return async function closeServer () {
  // ...
  await apollo.stop()
}
// ...after startServer
/**
 * @typedef {ReturnType<ReturnType<configureApolloContext>>} ApolloContext
 */

/**
 * @param {object} params
 */
function configureApolloContext (params) {
  /**
   * @param {import('apollo-server-fastify').FastifyContext} params
   */
  return ({ request, reply }) => {
    return {
      log: request.log
    }
  }
}
```

</details>

<details>
<summary>To add a service to apollo-server:</summary>

`src/services/example/example.model.js`

```js
/**
 * @typedef {ReturnType<configureExampleModel>} ExampleModel
 */

/**
 * @typedef {import('@prisma/client').Example} Example
 */

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export function configureExampleModel (prisma) {
  return {
    /**
     * @param {readonly string[]} ids
     */
    async fetchManyById (ids) {
      return prisma.example.findMany({
        where: { id: { in: ids.slice() } }
      })
    },
    /**
     * @param {object} params
     * @param {number} params.take
     * @param {import('@prisma/client').Prisma.ExampleOrderByWithRelationInput} params.orderBy
     * @param {import('@prisma/client').Prisma.ExampleWhereUniqueInput} [params.cursor]
     */
    async fetchManyByCursor ({ take, orderBy, cursor }) {
      return prisma.example.findMany({
        take,
        orderBy,
        cursor,
        skip: cursor ? 1 : 0
      })
    }
  }
}
```

`src/services/example/example.service.js`

```js
import DataLoader from 'dataloader'
import { z } from 'zod'
import { keyBy } from '../../lib/key-by.js'

/**
 * @typedef {ReturnType<configureExampleService>} ExampleService
 */

/**
 * @param {object} params
 * @param {import('./example.model').ExampleModel} params.exampleModel
 */
export function configureExampleService ({ exampleModel }) {
  return {
    /**
     * @param {object} params
     * @param {number} [params.first]
     * @param {string} [params.after]
     * @param {number} [params.last]
     * @param {string} [params.before]
     */
    async examplesCursor ({ first, after, last, before }) {
      let take = (first ?? last ?? 10) + 1
      /** @type {OrderBy} */
      let orderBy = { id: 'asc' }
      /** @type {Cursor|undefined} */
      let cursor
      let forwards = true
      if (after) {
        ;[cursor, orderBy] = decodeCursor(after)
      } else if (before) {
        take *= -1
        forwards = false
        ;[cursor, orderBy] = decodeCursor(before)
      }
      const results = await exampleModel.fetchManyByCursor({
        take,
        orderBy,
        cursor
      })
      const expectedLength = Math.abs(take) - 1
      const slicedResults = forwards
        ? results.slice(0, expectedLength)
        : results.slice().reverse().slice(0, expectedLength).reverse()
      const edges = slicedResults.map(node => ({
        cursor: encodeCursor([{ id: node.id }, orderBy]),
        node
      }))
      const pageInfo = {
        hasPreviousPage: !forwards ? results.length > expectedLength : !!after,
        hasNextPage: forwards ? results.length > expectedLength : !!before,
        startCursor: edges.at(0)?.cursor ?? null,
        endCursor: edges.at(-1)?.cursor ?? null
      }
      return { edges, pageInfo }
    },
    createLoaders () {
      return {
        /** @type {import('dataloader')<string, import('./example.model').Example>} */
        byId: new DataLoader(async ids => {
          const results = await exampleModel.fetchManyById(ids)
          const resultsById = keyBy(results, 'id')
          return ids.map(id => resultsById[id])
        })
      }
    }
  }
}

/** @typedef {import('zod').infer<typeof orderBySchema>} OrderBy */
const orderBySchema = z.object({ id: z.enum(['asc', 'desc']) })
/** @typedef {import('zod').infer<typeof cursorSchema>} Cursor */
const cursorSchema = z.object({ id: z.string() })
const combinedSchema = z.tuple([cursorSchema, orderBySchema])

/**
 * @param {string} cursor
 */
function decodeCursor (cursor) {
  try {
    const rawString = Buffer.from(cursor, 'base64url').toString()
    const rawData = JSON.parse(rawString)
    return combinedSchema.parse(rawData)
  } catch {
    throw new Error('Malformed cursor')
  }
}

/**
 * @param {import('zod').infer<combinedSchema>} data
 */
function encodeCursor (data) {
  return Buffer.from(JSON.stringify(data)).toString('base64url')
}
```

`src/services/example/example.apollo.js`

```js
import { makeExecutableSchema } from '@graphql-tools/schema'
import { gql } from 'apollo-server-core'
import { decodeNodeId, encodeNodeId } from '../../lib/graphql-id.js'
import rootTypeDefs from '../../utils/apollo-types.js'

const typeDefs = gql`
  type Example implements Node {
    id: ID!
    name: String
  }

  type ExampleEdge {
    cursor: String!
    node: Example
  }

  type ExampleConnection {
    pageInfo: PageInfo!
    edges: [ExampleEdge]
  }

  type Query {
    example(id: ID!): Example
    examples(
      first: Int
      after: String
      last: Int
      before: String
    ): ExampleConnection
  }
`

const EXAMPLE_TYPE = 'Example'

/**
 * @type {import('../../utils/apollo-schema').NodeTypeMap}
 */
export const NODE_TYPES = new Map([
  [EXAMPLE_TYPE, (id, ctx) => ctx.exampleLoaders.byId.load(id)]
])

/**
 * @type {import('@graphql-tools/utils').IResolvers<any, import('../../server').ApolloContext>}
 */
const resolvers = {
  Example: {
    id (example) {
      return encodeNodeId(example.id, EXAMPLE_TYPE)
    }
  },
  Query: {
    async example (_, { id: nodeId }, ctx) {
      const [id, __typename] = decodeNodeId(nodeId)
      if (__typename !== EXAMPLE_TYPE) return null
      return ctx.exampleLoaders.byId.load(id)
    },
    async examples (_, { first, after, last, before }, ctx) {
      return ctx.exampleService.examplesCursor({
        first: first ? Number.parseInt(first, 10) : undefined,
        after,
        last: last ? Number.parseInt(last, 10) : undefined,
        before
      })
    }
  }
}

export default makeExecutableSchema({
  typeDefs: [typeDefs, rootTypeDefs],
  resolvers
})
```

`src/utils/apollo-schema.js`

```js
// ...
import { NODE_TYPES as EXAMPLE_NODE_TYPES } from '../services/example/example.apollo.js'
// ...
const NODE_TYPES = new Map([...EXAMPLE_NODE_TYPES])
```

`src/server.js`

```js
// ...
import exampleSchema from './services/example/example.apollo.js'
// ...in startServer params
/**
 * @param {object} params
 * @param {number} params.port
 * @param {string} [params.host]
 * @param {import('pino').P.BaseLogger} params.logger
 * @param {import('./services/example/example.service').ExampleService} params.exampleService
 */
export async function startServer ({
  port,
  host = '0.0.0.0',
  logger,
  exampleService
}) {
  // ...
  const apollo = new ApolloServer({
    schema: mergeSchemas({
      schemas: [rootSchema, exampleSchema]
    }),
    context: configureApolloContext({ exampleService })
    // ...
  })
  // ...
}
// ...

/**
 * @param {object} params
 * @param {import('./services/example/example.service').ExampleService} params.exampleService
 */
function configureApolloContext ({ exampleService }) {
  /**
   * @param {import('apollo-server-fastify').FastifyContext} params
   */
  return ({ request, reply }) => {
    return {
      // ...
      exampleService,
      exampleLoaders: exampleService.createLoaders()
    }
  }
}
```

`src/index.js`

```js
import { configureExampleModel } from './services/example/example.model.js'
import { configureExampleService } from './services/example/example.service.js'
// ...
const exampleModel = configureExampleModel(prisma)
const exampleService = configureExampleService({ exampleModel })
// ...
const closeServer = await startServer({ port, logger, exampleService })
```

Test connection query

```graphql
query Examples($first: Int, $after: String, $last: Int, $before: String) {
  examples(first: $first, after: $after, last: $last, before: $before) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    edges {
      cursor
      node {
        id
        name
      }
    }
  }
}
```

</details>
