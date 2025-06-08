FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

# Copia seus arquivos estáticos para o diretório web do Nginx
COPY . /usr/share/nginx/html

# Expõe a porta padrão HTTP
EXPOSE 80
