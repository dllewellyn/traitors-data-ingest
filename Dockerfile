# Stage 1: Development
FROM node:lts-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Builder
FROM development AS builder
RUN npm run build

# Stage 3: Production
FROM node:lts-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]
