# Parcial 2: TPI115

¡Bienvenidos al repositorio del equipo! 🚀

El objetivo de este proyecto es centralizar el desarrollo de los sitios web personales ("Tema") y facilitar la sincronización de archivos para cumplir con todos los requisitos del Parcial 2.

## Fase 1: Configuración Inicial (Hacer esto primero)

Antes de poder empezar a desarrollar, cada integrante debe configurar su entorno para conectarse a la infraestructura del equipo.

### 1. Instalar ZeroTier
Instala el cliente de ZeroTier para tu sistema operativo.
* **Descarga:** [https://www.zerotier.com/download/](https://www.zerotier.com/download/)

### 2. Unirse a la Red VPN
Usa la opción **"Join New Network"** en el cliente de ZeroTier e introduce el siguiente ID de red:
```
[NETWORK_ID_PROPORCIONADO_POR_EL_LÍDER]
```
*(Nota: El coordinador del grupo te proporcionará este ID)*.

### 3. Configurar el Servidor DNS
Este paso es **crucial** para que puedas acceder a los sitios de tus compañeros usando nombres de dominio (`www1.comuna.tpi`, etc.).
1.  Busca la configuración del adaptador de red virtual de ZeroTier en tu sistema operativo.
2.  Configura manualmente el servidor DNS para que apunte a la siguiente dirección IP (la IP del servidor DNS del equipo en la VPN):
    ```
    [IP_DEL_SERVIDOR_DNS_EN_LA_VPN]
    ```
    *(Nota: El coordinador del grupo te proporcionará esta IP)*.

### 4. Verificar la Conexión
Abre una terminal o CMD y ejecuta un `ping` al servidor del coordinador para confirmar que tienes conectividad y que el DNS funciona correctamente.
```bash
# Reemplaza la IP y el carnet con los del coordinador
ping 172.27.151.97
ping gd21011.comuna.tpi
```
Si ambos `ping` responden, ¡estás listo para la siguiente fase!

## Fase 2: Desarrollo del Sitio Personal ("Tema")

Cada integrante debe desarrollar su propio sitio web. Este sitio se compone de un backend falso (API) y un frontend.

### Backend con `json-server` 💻
Tu aplicación necesita una API RESTful para funcionar. La crearás de forma automatizada.
1.  **Instala NodeJS:** [https://nodejs.org/](https://nodejs.org/)
2.  **Instala `json-server`** globalmente:
    ```bash
    npm install -g json-server
    ```
3.  **Crea tu "Base de Datos":** Crea un archivo llamado `db.json` en la carpeta de tu proyecto. Este archivo debe contener al menos dos tipos de "tablas" (entidades). Ejemplo para una tienda de videojuegos:
    ```json
    {
      "juegos": [
        { "id": 1, "titulo": "Cyberpunk 2077", "generoId": 1 },
        { "id": 2, "titulo": "The Witcher 3", "generoId": 1 }
      ],
      "generos": [
        { "id": 1, "nombre": "RPG" },
        { "id": 2, "nombre": "Estrategia" }
      ]
    }
    ```
4.  **Inicia tu API:** Desde la terminal, en la carpeta de tu proyecto, ejecuta:
    ```bash
    json-server --watch db.json
    ```
    Tu API estará disponible en `http://localhost:3000`.

### Frontend (HTML, CSS, JS) 🌐
Esta es la parte visible de tu sitio.
* Debe tener una **página principal y al menos 4 secciones** más.
* Usa la función `fetch` de JavaScript para comunicarte con tu API local.
* **Requisito indispensable:** Tu sitio debe implementar todas las operaciones **CRUD** (Crear, Leer, Actualizar y Borrar) sobre los datos de tu API.

## Fase 3: Estructura del Repositorio y Flujo de Trabajo

Para mantener el orden y facilitar la sincronización, seguiremos esta estructura y flujo de trabajo.

### Estructura de Carpetas
Cada integrante debe crear una carpeta con su número de carnet en la raíz del repositorio y trabajar **únicamente** dentro de ella.

```
/
├── gd21011/  <-- Carpeta del Líder (ejemplo)
│   ├── index.html
│   └── ... (todos los archivos de su sitio "Tema")
├── aa00002/  <-- Carpeta del Integrante 2
│   └── ...
└── README.md
```

### Flujo de Trabajo con Git
1.  **Antes de empezar a trabajar:** Sincroniza siempre tu copia local con el repositorio.
    ```bash
    git pull
    ```
2.  **Trabaja:** Realiza todos los cambios necesarios **dentro de tu carpeta personal**.
3.  **Sube tus cambios:** Cuando termines una tarea o al final del día, sube tu progreso al repositorio.
    ```bash
    # 1. Agrega tus cambios
    git add .
    # 2. Crea un commit descriptivo
    git commit -m "Avance: Implementada la función de borrar productos"
    # 3. Sube los cambios
    git push
    ```

## Fase 4: Checklist de Publicación en tu Servidor Web ✅

Una vez que tu sitio esté listo, debes desplegarlo en tu servidor web asignado (Apache, Nginx o IIS) y configurar todo lo siguiente. Usa esta lista para verificar tu progreso.

- [ ] **Configurar Virtual Hosts:** Crear los 3 hosts virtuales (`wwwn.comuna.tpi`, `carnet.comuna.tpi`, `tema.comuna.tpi`) apuntando a tu sitio y escuchando en la IP de la VPN.
- [ ] **Implementar HTTPS:** Generar un certificado autofirmado y configurar la redirección automática de HTTP a HTTPS.
- [ ] **Restringir Acceso:** Asegurarse de que los sitios de la VPN solo sean accesibles desde el rango de IPs de la VPN.
- [ ] **Publicar Copias de Compañeros:** Clonar o hacer `pull` de este repositorio en el `DocumentRoot` de tu sitio `wwwn.comuna.tpi` para que las carpetas de tus compañeros sean accesibles.
- [ ] **Configurar Reescritura de URL:** Implementar la regla para que `/parcial/carnet` sea manejado internamente como `/carnet`.
- [ ] **Configurar Redirección 301:** Implementar la regla de redirección `n -> n+1` que te corresponde.
- [ ] **Configurar Página 404:** Crear y configurar tu página de error 404 personalizada.
- [ ] **Configurar Sitio Familiar:** Crear el Virtual Host para el sitio familiar, restringido únicamente a tu red local (LAN).
