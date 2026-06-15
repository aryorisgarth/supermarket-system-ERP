# Usamos directamente la imagen final de Nginx
FROM nginx:1.27-alpine

# Copiamos tu archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos la carpeta dist pre-compilada localmente hacia el contenedor
COPY dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1