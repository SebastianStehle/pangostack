#
# VULTR CLIENT (same as scripts/generate-client.mjs, keep the version in sync with openapitools.json)
#
FROM openapitools/openapi-generator-cli:v7.14.0 AS vultr-client

COPY worker/src/lib/vultr/openapi-filtered.json /spec/openapi.json
RUN docker-entrypoint.sh generate -g typescript-fetch --additional-properties=useSingleRequestParameter=false,ensureUniqueParams=false -i /spec/openapi.json -o /client --skip-validate-spec --schema-mappings=float=number

#
# BUILD (the context is the repository root, because the build needs the shared scripts)
#
FROM node:22-alpine AS build

# Create app directory
WORKDIR /src/worker

# Copy the package json to use caching.
COPY worker/package*.json ./

# Optimized installation for build servers.
RUN npm ci

COPY worker .
COPY scripts ../scripts
COPY --from=vultr-client /client ./src/lib/vultr/generated
RUN node ../scripts/add-ts-ignore.js ./src/lib/vultr/generated

# Run linter
RUN npm run lint

# Run the build command which creates the production bundle
RUN npm run build

# Fail the image build when tests fail.
RUN npm test

# Only keep production dependencies.
RUN npm ci --omit=dev && npm cache clean --force

#
# RUNTIME
#
FROM node:22-alpine AS production

ENV NODE_ENV=production

# Install requirements
RUN apk update \
 && apk add --no-cache bash openssh openssl curl ca-certificates tar gzip

# Install Kubernetes
RUN curl -LO "https://dl.k8s.io/release/v1.33.0/bin/linux/amd64/kubectl" \
 && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && rm kubectl

# Verify Kubernetes
RUN kubectl

# Install Helm
RUN curl "https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3" | bash

# Verify Helm
RUN helm version

WORKDIR /app

# Copy the bundled code from the build stages to the production image
COPY --from=build /src/worker/node_modules ./node_modules
COPY --from=build /src/worker/dist ./dist

EXPOSE 3100

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
