# Estágio de Build
FROM node:20-alpine as build

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install

# Copiar codigo fonte
COPY . .

# Buildar o projeto (gera pasta dist)
RUN npm run build

# Estágio de Produção (Nginx)
FROM nginx:alpine

# Copiar arquivos buildados para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuracao do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
