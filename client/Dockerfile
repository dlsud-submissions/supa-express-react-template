# --- Dev stage ---
FROM node:20-alpine AS dev

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5173

VOLUME /app/node_modules

CMD ["npm", "run", "dev", "--", "--host"]

# --- Build stage ---
FROM dev AS build

RUN npm run build

# --- Prod stage ---
FROM nginx:alpine AS prod

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
