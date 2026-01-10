# Estágio 1: Build
FROM node:20-alpine as build

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código e fazer o build
COPY . .

# Argumentos de build para as variáveis do Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# Estágio 2: Serve
FROM nginx:stable-alpine

# Copiar os arquivos gerados no build
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração customizada do Nginx para SPAs (React Router)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
