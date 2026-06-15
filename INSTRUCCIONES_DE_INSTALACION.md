# Instrucciones de Instalación y Ejecución

**Proyecto de Examen de Grado**
**Autor:** Adolfo Floreano Garth

Este documento describe los pasos necesarios para desplegar y probar el Sistema ERP de Supermercado. El proyecto está dividido en dos partes principales: un Backend (Java Spring Boot) y un Frontend (React Vite), además de los servicios de infraestructura (MySQL y Keycloak).

---

## Requisitos Previos

Para ejecutar el proyecto, el equipo evaluador necesitará tener instalados los siguientes programas:
1. **Docker y Docker Compose:** (Recomendado) Para levantar la infraestructura fácilmente.
2. **Java JDK 17:** Para compilar y ejecutar el Backend (si se corre fuera de Docker).
3. **Node.js (v20+):** Para compilar y ejecutar el Frontend (si se corre fuera de Docker).

---

## Opción 1: Ejecución Completa con Docker (Recomendada y Más Fácil)

La forma más rápida de evaluar el sistema es utilizando Docker Compose, el cual levantará la Base de Datos, Keycloak, el Backend y el Frontend automáticamente.

1. Abre una terminal y navega hasta la carpeta raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`).
2. Ejecuta el siguiente comando para construir e iniciar todos los servicios:
   ```bash
   docker-compose up --build -d
   ```
3. Espera un par de minutos a que los contenedores inicien y se configuren.
   - *Nota:* El backend utiliza Flyway para crear la base de datos automáticamente e inyectar datos de prueba (Seeders) en la primera ejecución.
4. Una vez que los contenedores estén estables, accede al sistema en tu navegador:
   - **Frontend:** http://localhost:80
   - **Backend API:** http://localhost:8081/swagger-ui.html (Documentación Swagger)

---

## Opción 2: Ejecución en Entorno de Desarrollo (Manual)

Si el jurado prefiere ejecutar y auditar el código fuente en tiempo real, sigan estos pasos:

### 1. Levantar Infraestructura (Base de Datos y Auth)
Ejecuta solo los servicios base con Docker:
```bash
docker-compose up -d mysql keycloak
```

### 2. Base de Datos (Opcional)
Se incluye un archivo llamado `Base_De_Datos_Supermarket.sql` en la raíz de este proyecto.
- Si lo desean, pueden importar este archivo en MySQL Workbench (conectándose a `localhost` en el puerto `3307`, usuario `root`, contraseña `mysql`).
- *Nota:* Esto es opcional, ya que el sistema tiene migraciones (Flyway) que construyen la base de datos de forma automática.

### 3. Ejecutar el Backend (Spring Boot)
1. Navega a la carpeta del backend:
   ```bash
   cd 02-BACKEND/supermarket-system-api
   ```
2. Ejecuta el proyecto con Maven Wrapper:
   ```bash
   # En Windows:
   .\mvnw.cmd spring-boot:run
   
   # En Mac/Linux:
   ./mvnw spring-boot:run
   ```
3. El backend estará disponible en `http://localhost:8081`.

### 4. Ejecutar el Frontend (React)
1. Abre otra terminal y navega a la carpeta del frontend:
   ```bash
   cd 03-FRONTEND
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Accede al sistema en: `http://localhost:5173`

---

## Credenciales de Acceso (Datos de Prueba)

El sistema genera automáticamente usuarios de prueba al iniciar por primera vez. Puedes utilizar las siguientes credenciales para evaluar el sistema:

| Rol | Correo / Usuario | Contraseña |
|---|---|---|
| **Administrador** | admin@supermarket.local | admin123 |
| **Cajero** | cajero@supermarket.local | cajero123 |
| **Bodeguero** | bodega@supermarket.local | bodega123 |
| **Supervisor** | supervisor@supermarket.local | supervisor123 |

¡Gracias por su evaluación!
