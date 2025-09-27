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

---

## Fase 2: Estructura y Sincronización (Método Profesional)

### A. Ubicación de Archivos y Estructura del Servidor
Para una máxima flexibilidad, mantendremos el código fuente del proyecto separado del directorio que lee el servidor web.

1.  **Repositorio Clonado (Tu área de trabajo):**
    * Clona este repositorio en cualquier lugar que te sea cómodo para desarrollar.
    * Ejemplo en Linux: `/home/tu_usuario/proyectos/Parcial2-Comuna-TPI/`
    * Ejemplo en Windows: `C:\Users\TuUsuario\Documents\GitHub\Parcial2-Comuna-TPI\`

2.  **Raíz del Servidor Web (Lo que ve el público):**
    * Esta es la carpeta que tu servidor web (Apache/Nginx) utiliza. La estructura interna se creará con enlaces simbólicos.
    * Linux: `/var/www/`
    * Windows: `C:\www\`

    **Estructura final que verá el servidor:**
    ```
    /var/www/comuna.tpi/
    ├── wwwn/
    │   ├── 404.html                <-- Archivo real
    │   ├── tu_carnet/              <-- Enlace Simbólico
    │   └── carnet_compañeroX/      <-- Enlace Simbólico
    ├── personal/                   <-- Enlace Simbólico
    └── certs/                      <-- Archivo real
    ```

**Nota sobre la página 404:** El archivo `404.html` ubicado en `/wwwn/` debe ser una página genérica creada por el administrador de cada servidor.
*Ejemplo Práctico:*
-   Cuando alguien visita `https://www1.comuna.tpi/pagina-inventada`, el servidor del **Integrante 1** servirá el archivo `/var/www/comuna.tpi/wwwn/404.html` que el **Integrante 1** diseñó.
-   Cuando alguien visita `https://www2.comuna.tpi/otra-pagina-inventada`, el servidor del **Integrante 2** servirá el archivo `/var/www/comuna.tpi/wwwn/404.html` que el **Integrante 2** diseñó.

### B. Flujo de Trabajo con Enlaces Simbólicos (La Conexión Mágica)
Ahora conectaremos ambas ubicaciones. Los enlaces simbólicos harán que el servidor web lea los archivos directamente desde tu repositorio.

**1. Preparación (Solo se hace una vez):**
* Asegúrate de que tu servidor web tiene permisos para seguir enlaces simbólicos.
    * **Apache:** La directiva `<Directory>` debe incluir `Options +FollowSymLinks`.
    * **Nginx:** Funciona por defecto.

**2. Creación de Enlaces Simbólicos:**
Ejecuta los siguientes comandos en tu servidor. **Recuerda usar la ruta completa a tu repositorio clonado.**

* **En Linux (usa `ln -s`):**
    ```bash
    # Enlace para tus sitios personales (carnet.comuna.tpi y tema.comuna.tpi)
    sudo ln -s /ruta/completa/a/tu/repo/Parcial2-Comuna-TPI/tu_carnet /var/www/comuna.tpi/personal

    # Enlaces para las copias de los sitios de compañeros en wwwn
    # (Repetir para cada integrante, incluyéndote a ti)
    sudo ln -s /ruta/completa/a/tu/repo/Parcial2-Comuna-TPI/carnet_compañero1 /var/www/comuna.tpi/wwwn/carnet_compañero1
    ```

* **En Windows (usa `mklink /D` en un CMD como Administrador):**
    ```batch
    :: Enlace para tus sitios personales
    mklink /D "C:\www\comuna.tpi\personal" "C:\ruta\completa\a\tu\repo\Parcial2-Comuna-TPI\tu_carnet"

    :: Enlaces para las copias de los sitios de compañeros en wwwn
    :: (Repetir para cada integrante, incluyéndote a ti)
    mklink /D "C:\www\comuna.tpi\wwwn\carnet_compañero1" "C:\ruta\completa\a\tu\repo\Parcial2-Comuna-TPI\carnet_compañero1"
    ```

### C. El Nuevo Flujo de Trabajo (¡Más Fácil!)
1.  **Haz tus cambios** en tu carpeta del repositorio y súbelos a GitHub (`git push`).
2.  Para actualizar el contenido en el servidor, simplemente navega a la carpeta de tu repositorio y ejecuta:
    ```bash
    git pull
    ```
**¡Eso es todo!** El sitio web se actualizará automáticamente. No necesitas copiar ningún archivo.

---

## Fase 3: Desarrollo y Configuración de la API

### A. Frontend y CRUD
* Tu sitio debe tener una **página principal y al menos 4 secciones** más.
* Debe implementar todas las operaciones **CRUD** (Crear, Leer, Actualizar, Borrar) usando `fetch` en JavaScript.

### B. Configuración de la API para Desarrollo y Despliegue
Para que tu código funcione tanto en tu PC de desarrollo como en los servidores de tus compañeros, es **fundamental** configurar correctamente la URL de la API en tu JavaScript.

**1. Código para `js/app.js` (¡Todos deben usar esta lógica!):**
Este código detecta automáticamente el entorno y elige la URL correcta.

**Nota**: Esta configuracion depende que como tengan organizado su sitio, lo importante es que en todos los lugares que llamen a la API la sustituyan por la que se describe a continuación:

```javascript
// --- INICIO DE LA CONFIGURACIÓN DE API ---
// Pega este bloque al inicio de tu archivo JS principal

// Reemplaza 'gd21011' con TU PROPIO CARNET
const MI_CARNET = 'gd21011'; 

// Detecta si estamos en un entorno de desarrollo local
const esDesarrolloLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Elige la URL de la API según el entorno
const API_URL = esDesarrolloLocal 
    ? 'http://localhost:3000'                      // URL para desarrollo en tu PC
    : `https://${MI_CARNET}.comuna.tpi/api`;     // URL para el servidor final en la VPN

// --- FIN DE LA CONFIGURACIÓN ---


// Ahora, todas tus llamadas fetch usarán la variable API_URL, por ejemplo:
// fetch(`${API_URL}/movies`).then(...);
````

**Importante:** Cada integrante debe poner su propio carnet en la variable `MI_CARNET`. Este código asegura que, cuando el sitio de un compañero se cargue desde tu servidor, las llamadas a la API se dirijan correctamente al servidor original de ese compañero.

**2. Inicia `json-server` en la VPN:**
En la terminal de tu servidor, navega a la carpeta de tu sitio (donde está tu `db.json`) y ejecuta:

```bash
# El --host 0.0.0.0 es VITAL para que tu API sea visible en la VPN
json-server --host 0.0.0.0 --watch api/database.json
```

-----

## Fase 4: Guía de Despliegue en Servidor Web

### A. Certificado SSL (HTTPS) y la Advertencia "No es seguro"

1.  **Genera tu certificado autofirmado** una vez. En una terminal (o Git Bash en Windows), ejecuta:
    ```bash
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt
    ```
    Cuando te pregunte por el "Common Name", escribe tu dominio principal (ej: `www1.comuna.tpi`).
2.  Mueve `server.key` y `server.crt` a tu carpeta de certificados (ej: `/var/www/comuna.tpi/certs/`).
3.  **Advertencia del Navegador:** Es **normal y esperado** que el navegador muestre una advertencia de "La conexión no es privada". Esto ocurre porque el certificado no fue emitido por una autoridad de confianza pública.
4.  **Solución:** Haz clic en **"Configuración Avanzada"** y luego en **"Proceder a [sitio] (sitio no seguro)"**. La conexión estará cifrada y podrás continuar. Debes estar preparado para explicar esto en la defensa.

### B. Plantillas de Configuración (Nginx y Apache)

A continuación se encuentran las plantillas completas. **La sintaxis es la misma para Windows y Linux**, solo cambia la ubicación de los archivos de configuración. Utiliza la plantilla que corresponda a tu servidor web asignado y **reemplaza los valores en MAYÚSCULAS**.

#### Plantilla NGINX

  * **Ubicación:**
      * **Linux:** Crea `/etc/nginx/sites-available/comuna.tpi` y actívalo con `sudo ln -s /etc/nginx/sites-available/comuna.tpi /etc/nginx/sites-enabled/`.
      * **Windows:** Agrega los bloques `server` dentro del bloque `http` en `C:\nginx\conf\nginx.conf`.

```nginx
# =============================================================
# PLANTILLA NGINX PARA EL PARCIAL 2 - TPI
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
        # Redirección de la raíz a tu sitio personal
        rewrite ^/$ /TU_CARNET/ permanent;
        try_files $uri $uri/ =404;
    }

    rewrite ^/parcial/([a-zA-Z0-9]+)(/.*)?$ /$1$2 last;
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
    server_name CARNET_COMPAÑERO.wwwN.comuna.tpi; # ej: gr19079.www1.comuna.tpi
    
    ssl_certificate /var/www/comuna.tpi/certs/server.crt;
    ssl_certificate_key /var/www/comuna.tpi/certs/server.key;

    return 301 https://CARNET_COMPAÑERO.comuna.tpi$request_uri;
}
```

#### Plantilla APACHE

  * **Ubicación Linux:** Habilita `ssl`, `rewrite`, `proxy`, `proxy_http`. Crea y activa `/etc/apache2/sites-available/comuna.tpi.conf`.
  * **Ubicación Windows:** En `httpd.conf`, descomenta los módulos y `Include conf/extra/httpd-vhosts.conf`. Edita `conf/extra/httpd-vhosts.conf`.

<!-- end list -->

```apache
# =============================================================
# PLANTILLA APACHE PARA EL PARCIAL 2 - TPI
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
    # Redirección de la raíz a tu sitio personal
    RewriteRule ^/$ /TU_CARNET/ [R=301,L]
    RewriteRule ^/parcial/([a-zA-Z0-9]+)(/.*)?$ /$1$2 [L]
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

### C. Puesta en Marcha y Verificación

1.  Inicia tu `json-server`.
2.  Aplica la configuración y reinicia tu servidor web.
3.  Pide a un compañero que pruebe todas las URLs desde su máquina en la VPN para verificar que todo funcione.

-----

## Fase 5: Recordatorio - Sitio Familiar

No olvides configurar la **página familiar** en tu red local de casa. Esta es una tarea separada con sus propios requisitos:

  * Debe usar tu IP residencial.
  * **No lleva HTTPS.**
  * El acceso debe estar restringido **únicamente a tu red LAN residencial**.
