# Parcial 2: TPI115 - Equipo Comuna TPI

¡Bienvenidos al repositorio del equipo! 🚀

El objetivo de este proyecto es centralizar el desarrollo de los sitios web personales ("Tema") y facilitar la sincronización de archivos para cumplir con todos los requisitos del Parcial 2. Esta guía es el manual definitivo para la configuración y despliegue.

## Fase 1: Configuración Inicial (Hacer esto primero)

Cada integrante debe configurar su entorno para conectarse a la infraestructura del equipo.

### 1. Instalar ZeroTier
Instala el cliente de ZeroTier para tu sistema operativo.
* **Descarga:** [https://www.zerotier.com/download/](https://www.zerotier.com/download/)

### 2. Unirse a la Red VPN
Usa la opción **"Join New Network"** en el cliente de ZeroTier e introduce el ID de red que te proporcionó el coordinador del equipo.

### 3. Configurar el Servidor DNS
Este paso es **crucial** para que puedas acceder a los sitios de tus compañeros usando nombres de dominio (`www1.comuna.tpi`, etc.).
1.  Busca la configuración del adaptador de red virtual de ZeroTier en tu sistema operativo.
2.  Configura manualmente el servidor DNS para que apunte a la dirección IP del servidor DNS del equipo en la VPN (proporcionada por el coordinador).

### 4. Verificar la Conexión
Abre una terminal o CMD y ejecuta un `ping` al servidor del coordinador y a su dominio para confirmar que tienes conectividad y que el DNS funciona. Si ambos responden, ¡estás listo!

## Fase 2: Estructura del Proyecto y Sincronización

### A. Estructura de Carpetas en el Servidor
Cada integrante debe crear esta estructura en su máquina. Esta será la raíz donde apuntará el servidor web.

* **Linux:** `/var/www/`
* **Windows:** `C:\www\`

```

/var/www/  (o C:\\www)
├── comuna.tpi/
│   ├── wwwn/             \# Raíz para wwwn.comuna.tpi
│   │   ├── 404.html
│   │   ├── tu\_carnet/
│   │   └── carnet\_compañeroX/
│   ├── personal/           \# Raíz para tus sitios personales
│   │   └── (código de tu sitio)
│   └── certs/              \# Para guardar tu certificado SSL
│       ├── server.crt
│       └── server.key
└── Parcial2-Comuna-TPI/      \# El repositorio clonado de GitHub

````

### B. Flujo de Trabajo con Git
Para mantener el código de todos actualizado:
1.  **Antes de trabajar, siempre haz `git pull`** para descargar los últimos cambios.
2.  **Trabaja únicamente en tu carpeta personal** dentro del repositorio.
3.  **Al terminar, sube tus cambios** con `git add`, `git commit` y `git push`.
4.  **Para actualizar los servidores,** puedes usar un script simple que haga `git pull` y copie los archivos a la estructura de `/var/www/`.

## Fase 3: Desarrollo y API con `json-server`

### A. Frontend (HTML, CSS, JS)
* Tu sitio debe tener una **página principal y al menos 4 secciones** más.
* Debe implementar todas las operaciones **CRUD** (Crear, Leer, Actualizar, Borrar).

### B. Backend con `json-server`
Cada integrante corre su propia API, que será consumida por las copias de su sitio en los servidores de los demás.

1.  **Configura tu `js/app.js`:** Las peticiones `fetch` deben apuntar a tu propio dominio a través de un proxy inverso. **Esta es la URL que debe estar en el código que subes a GitHub.**
    ```javascript
    // Ejemplo para el integrante gd21011
    const API_URL = '[https://gd21011.comuna.tpi/api](https://gd21011.comuna.tpi/api)';

    fetch(`${API_URL}/movies`).then(...);
    ```

2.  **Inicia `json-server` en la VPN:** En una terminal, navega a la carpeta de tu sitio (donde está tu `db.json`) y ejecuta:
    ```bash
    # El --host 0.0.0.0 es VITAL para que sea visible en la VPN
    json-server --host 0.0.0.0 --watch db.json
    ```

## Fase 4: Guía Definitiva de Despliegue en Servidor Web

Esta sección contiene las plantillas para Nginx y Apache. **La sintaxis es la misma en Windows y Linux, solo cambia la ubicación de los archivos.**

### A. Generación del Certificado SSL (HTTPS)
Haz esto una vez. En una terminal (o Git Bash en Windows), ejecuta:
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt
````

Mueve `server.key` y `server.crt` a tu carpeta de certificados (ej: `/var/www/comuna.tpi/certs/`).

### B. Plantilla de Configuración para NGINX

  * **Ubicación:**
      * **Linux:** Crea `/etc/nginx/sites-available/comuna.tpi` y actívalo con `sudo ln -s /etc/nginx/sites-available/comuna.tpi /etc/nginx/sites-enabled/`.
      * **Windows:** Agrega los bloques `server` dentro del bloque `http` en `C:\nginx\conf\nginx.conf`.

<!-- end list -->

```nginx
# =============================================================
# PLANTILLA NGINX PARA EL PARCIAL 2 - TPI
# Reemplaza los valores en MAYÚSCULAS
# =============================================================

# --- SERVIDOR PRINCIPAL: wwwn.comuna.tpi ---
server {
    listen TU_IP_VPN:443 ssl;
    server_name wwwN.comuna.tpi; # ej: www1.comuna.tpi

    ssl_certificate /var/www/comuna.tpi/certs/server.crt;
    ssl_certificate_key /var/www/comuna.tpi/certs/server.key;

    root /var/www/comuna.tpi/wwwn;
    index index.html;

    error_page 404 /404.html;
    location = /404.html { internal; }

    location / {
        allow 172.27.0.0/16; # Rango de la VPN
        deny all;
        try_files $uri $uri/ =404;
    }

    rewrite ^/parcial/([a-zA-Z0-9]+)/?$ /$1/ last;
}

# --- SERVIDORES PERSONALES: carnet.comuna.tpi y tema.comuna.tpi (agrupados) ---
server {
    listen TU_IP_VPN:443 ssl;
    server_name TU_CARNET.comuna.tpi TU_TEMA.comuna.tpi;

    ssl_certificate /var/www/comuna.tpi/certs/server.crt;
    ssl_certificate_key /var/www/comuna.tpi/certs/server.key;

    root /var/www/comuna.tpi/personal;
    index index.html;

    # Proxy Inverso para TU json-server
    location /api/ {
        allow 172.27.0.0/16;
        deny all;
        proxy_pass http://localhost:3000/;
    }

    location / {
        allow 172.27.0.0/16;
        deny all;
        try_files $uri $uri/ =404;
    }
}

# --- REDIRECCIÓN DE HTTP a HTTPS ---
server {
    listen TU_IP_VPN:80;
    server_name wwwN.comuna.tpi TU_CARNET.comuna.tpi TU_TEMA.comuna.tpi;
    return 301 https://$host$request_uri;
}

# --- REDIRECCIÓN ESPECÍFICA (n -> n+1) ---
server {
    listen TU_IP_VPN:443 ssl;
    server_name CARNET_COMPAÑERO.wwwN.comuna.tpi; # ej: gd21011.www1.comuna.tpi
    
    ssl_certificate /var/www/comuna.tpi/certs/server.crt;
    ssl_certificate_key /var/www/comuna.tpi/certs/server.key;

    return 301 https://CARNET_COMPAÑERO.comuna.tpi$request_uri;
}
```

### C. Plantilla de Configuración para APACHE

  * **Ubicación:**
      * **Linux:** Habilita `ssl`, `rewrite`, `proxy`, `proxy_http`. Crea y activa `/etc/apache2/sites-available/comuna.tpi.conf`.
      * **Windows:** En `httpd.conf`, descomenta los módulos y la línea `Include conf/extra/httpd-vhosts.conf`. Edita `conf/extra/httpd-vhosts.conf`.

<!-- end list -->

```apache
# =============================================================
# PLANTILLA APACHE PARA EL PARCIAL 2 - TPI
# Reemplaza los valores en MAYÚSCULAS
# =============================================================

# --- REDIRECCIÓN DE HTTP a HTTPS ---
<VirtualHost TU_IP_VPN:80>
    ServerName wwwN.comuna.tpi
    ServerAlias TU_CARNET.comuna.tpi TU_TEMA.comuna.tpi
    Redirect permanent / [https://wwwN.comuna.tpi/](https://wwwN.comuna.tpi/)
</VirtualHost>

# --- SERVIDOR PRINCIPAL: wwwn.comuna.tpi ---
<VirtualHost TU_IP_VPN:443>
    ServerName wwwN.comuna.tpi
    DocumentRoot "/var/www/comuna.tpi/wwwn"

    SSLEngine on
    SSLCertificateFile "/var/www/comuna.tpi/certs/server.crt"
    SSLCertificateKeyFile "/var/www/comuna.tpi/certs/server.key"

    RewriteEngine On
    RewriteRule ^/parcial/([a-zA-Z0-9]+)/?$ /$1/ [L]
    ErrorDocument 404 /404.html

    <Directory "/var/www/comuna.tpi/wwwn">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all denied
        Require ip 172.27.0.0/16
    </Directory>
</VirtualHost>

# --- SERVIDORES PERSONALES: carnet.comuna.tpi y tema.comuna.tpi ---
<VirtualHost TU_IP_VPN:443>
    ServerName TU_CARNET.comuna.tpi
    ServerAlias TU_TEMA.comuna.tpi
    DocumentRoot "/var/www/comuna.tpi/personal"

    SSLEngine on
    SSLCertificateFile "/var/www/comuna.tpi/certs/server.crt"
    SSLCertificateKeyFile "/var/www/comuna.tpi/certs/server.key"
    
    ProxyPass /api/ http://localhost:3000/
    ProxyPassReverse /api/ http://localhost:3000/

    <Directory "/var/www/comuna.tpi/personal">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all denied
        Require ip 172.27.0.0/16
    </Directory>
</VirtualHost>

# --- REDIRECCIÓN ESPECÍFICA (n -> n+1) ---
<VirtualHost TU_IP_VPN:443>
    ServerName CARNET_COMPAÑERO.wwwN.comuna.tpi
    
    SSLEngine on
    SSLCertificateFile "/var/www/comuna.tpi/certs/server.crt"
    SSLCertificateKeyFile "/var/www/comuna.tpi/certs/server.key"

    Redirect permanent / https://CARNET_COMPAÑERO.comuna.tpi/
</VirtualHost>
```

### D. Puesta en Marcha y Verificación

1.  Inicia tu `json-server`.
2.  Aplica la configuración y reinicia tu servidor web (Nginx o Apache).
3.  Pide a un compañero que pruebe todas las URLs desde su máquina en la VPN para verificar que todo funcione.

## Fase 5: Recordatorio - Sitio Familiar

No olvides configurar la **página familiar** en tu red local de casa. Esta es una tarea separada con sus propios requisitos:

  * Debe usar tu IP residencial.
  * **No lleva HTTPS.**
  * El acceso debe estar restringido **únicamente a tu red LAN residencial**.
