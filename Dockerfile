# Use uma versão específica para maior estabilidade
FROM nginx:1.25-alpine

# Install curl for health checks (wget não está disponível por padrão)
RUN apk add --no-cache curl

# Remove arquivos padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copie os arquivos da aplicação
COPY . /usr/share/nginx/html

# Copie configuração customizada do nginx
COPY ../nginx/nginx.conf /etc/nginx/nginx.conf
COPY ../nginx/cors-headers.conf /etc/nginx/cors-headers.conf
COPY ../nginx/cors-preflight.conf /etc/nginx/cors-preflight.conf
COPY ../nginx/proxy-headers.conf /etc/nginx/proxy-headers.conf

# Configure permissões adequadas
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Crie diretórios de log se necessário
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx

# Teste a configuração do nginx
RUN nginx -t

# Expõe a porta padrão HTTP
EXPOSE 80

# Health check otimizado - verifica tanto o frontend quanto a API
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost/ && curl -f http://localhost/health || exit 1

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
