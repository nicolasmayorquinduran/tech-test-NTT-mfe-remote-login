FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Build shared libs first
WORKDIR /libs
COPY libs/package.json libs/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY libs/ ./
RUN pnpm build

# Build login app
WORKDIR /app
COPY login/package.json login/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY login/ ./
RUN pnpm build

FROM nginx:alpine

# Copy custom nginx config
COPY login/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist/login /usr/share/nginx/html

EXPOSE 4201

CMD ["nginx", "-g", "daemon off;"]
