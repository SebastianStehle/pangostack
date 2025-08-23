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

# Run linter
RUN npm run lint

# Run the build command which creates the production bundle
RUN npm run build

# Only keep production dependencies.
RUN NODE_ENV=production & npm ci --only=production && npm cache clean --force

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

# Run linter
RUN npm run lint

# Run the build command which creates the production bundle
RUN npm run build

#
# RUNTIME
#
FROM node:22-bullseye AS production

ENV NODE_ENV=production

# Copy the bundled code from the build stages to the production image
COPY --from=backend /src/backend/node_modules ./node_modules
COPY --from=backend /src/backend/dist ./dist
COPY --from=frontend /src/frontend/dist ./assets

RUN apk update && apk add bash

EXPOSE 3000

# Start the server using the production build
CMD [ "node", "dist/main.js" ]