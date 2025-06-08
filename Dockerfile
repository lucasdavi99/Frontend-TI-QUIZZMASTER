# Use uma versão específica para maior estabilidade
FROM nginx:1.25-alpine

# Remova arquivos padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copie os arquivos da aplicação
COPY . /usr/share/nginx/html

# Copie configuração customizada do nginx (se existir)
# COPY nginx.conf /etc/nginx/nginx.conf

# Configure permissões adequadas
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# NÃO usar USER nginx - o nginx precisa rodar como root
# USER nginx

# Expõe a porta padrão HTTP
EXPOSE 80

# Comando de saúde para verificar se o container está funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
