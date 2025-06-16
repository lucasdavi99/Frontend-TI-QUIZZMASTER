FROM nginx:1.25-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Remove arquivos padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copie os arquivos da aplicação
COPY . /usr/share/nginx/html

# Configure permissões adequadas
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expõe a porta padrão HTTP
EXPOSE 80

# Health check simples
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]