#
# API CLIENTS (same as scripts/generate-client.mjs, keep the versions in sync with openapitools.json)
#
FROM openapitools/openapi-generator-cli:v7.4.0 AS worker-client

COPY worker/openapi.yaml /spec/openapi.yaml
RUN docker-entrypoint.sh generate -g typescript-fetch --additional-properties=useSingleRequestParameter=false,ensureUniqueParams=false -i /spec/openapi.yaml -o /client

FROM openapitools/openapi-generator-cli:v7.3.0 AS backend-client

COPY backend/openapi.yaml /spec/openapi.yaml
RUN docker-entrypoint.sh generate -g typescript-fetch --additional-properties=useSingleRequestParameter=false,ensureUniqueParams=false -i /spec/openapi.yaml -o /client

#
# BACKEND
#
FROM node:22-bullseye AS backend

# Create app directory
WORKDIR /src/backend

# Copy the package json to use caching.
COPY backend/package*.json ./

# Optimized installation for build servers.
RUN npm ci

COPY backend .

COPY scripts ../scripts
COPY --from=worker-client /client ./src/domain/workers/generated
RUN node ../scripts/add-ts-ignore.js ./src/domain/workers/generated

# Run linter
RUN npm run lint

# Run the build command which creates the production bundle
RUN npm run build

# Fail the image build when tests fail.
RUN npm test

# Only keep production dependencies.
RUN npm ci --omit=dev && npm cache clean --force

#
# FRONTEND
#
FROM node:22-bullseye AS frontend

# Create app directory
WORKDIR /src/frontend

# Copy the package json to use caching.
COPY frontend/package*.json ./

# Optimized installation for build servers.
RUN npm ci

COPY frontend .

COPY scripts ../scripts
COPY --from=backend-client /client ./src/api/generated
RUN node ../scripts/add-ts-ignore.js ./src/api/generated && node gen-helper.mjs

# Run linter
RUN npm run lint

# Run the build command which creates the production bundle
RUN npm run build

#
# RUNTIME
#
FROM node:22-bullseye AS production

ENV NODE_ENV=production

WORKDIR /app

# Copy the bundled code from the build stages to the production image
COPY --from=backend /src/backend/node_modules ./node_modules
COPY --from=backend /src/backend/dist ./dist
COPY --from=frontend /src/frontend/dist ./assets

EXPOSE 3000

# Start the server using the production build
CMD [ "node", "dist/main.js" ]