# --- Dev stage ---
  FROM node:20-alpine AS dev

  WORKDIR /app

  COPY package*.json ./

  RUN npm ci

  COPY . .

  EXPOSE 3000

  VOLUME /app/node_modules

  CMD ["npm", "run", "dev"]

  # --- Prod stage ---
  FROM node:20-alpine AS prod

  WORKDIR /app

  COPY package*.json ./

  RUN npm ci --omit=dev

  COPY . .

  EXPOSE 3000

  CMD ["npm", "run", "start"]
