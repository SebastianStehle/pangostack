#
# BACKEND
#
FROM node:22-alpine AS backend

# Create app directory
WORKDIR /src/backend

# Copy the package json to use caching.
COPY package*.json ./

# Optimized installation for build servers.
RUN npm ci

COPY . . 

# Run the build command which creates the production bundle
RUN npm run build

# Only keep production dependencies.
RUN NODE_ENV=production & npm ci --only=production && npm cache clean --force

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

# Copy the bundled code from the build stages to the production image
COPY --from=backend /src/backend/node_modules ./node_modules
COPY --from=backend /src/backend/dist ./dist

RUN apk update && apk add bash

EXPOSE 3000

# Start the server using the production build
CMD [ "node", "dist/main.js" ]