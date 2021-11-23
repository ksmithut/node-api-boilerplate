FROM node:16-alpine

# Needed for bcrypt
# RUN apk --no-cache add --virtual builds-deps build-base python2

# Create app directory
RUN mkdir -p /app && chown node:node /app
USER node
WORKDIR /app

# Install dependencies
COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node prisma prisma
RUN yarn --frozen-lockfile --production

# Bundle app source
COPY --chown=node:node src src

# Exports
EXPOSE 3000
CMD [ "node", "src/bin/app.js" ]
