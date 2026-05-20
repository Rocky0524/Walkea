# Walkea 📍🚶‍♂️

**Walkea** es una aplicación web colaborativa y social de mapeo en tiempo real. Permite a los ciudadanos reportar incidencias locales (peligros, obras, zonas seguras u otros eventos de interés) asociadas a su ubicación geográfica en vivo, ayudando a otros peatones a planificar rutas más seguras.

---

## 🚀 Características Principales

* **Mapa Interactivo en Tiempo Real:** Integración con **Leaflet** y OpenStreetMap para ubicar incidencias de forma visual con emojis dinámicos según el tipo de reporte.
* **Geolocalización Automática:** Uso de la API de Geolocalización nativa de HTML5 para situar al usuario y capturar las coordenadas de los nuevos reportes al instante.
* **Fórmula de Haversine Integrada:** Filtro en base de datos para mostrar y ordenar únicamente las alertas cercanas en un radio de 5 km a la redonda.
* **Sistema Colaborativo de Vida (HP) y Votos:** 
  * Los reportes nacen con puntos de vida (HP).
  * Los usuarios pueden votar si la incidencia sigue ahí ("Sigue ahí", aumenta HP) o si ya se resolvió ("Ya no está", reduce HP).
  * Si la vida llega a `0`, la incidencia pasa automáticamente a estado **agotado** y se archiva.
* **Reputación y Niveles de Usuario:** El peso del voto varía dinámicamente según la antigüedad del usuario en la plataforma (Novato, Medio, Veterano y Administrador).
* **Caducidad Automatizada:** Servicio de segundo plano que marca como **caducados** los reportes sin votos tras 24 horas de inactividad.
* **Persistencia de Modo Oscuro:** Interfaz moderna con soporte completo para modo oscuro, guardado en las preferencias locales (`localStorage`) y transición fluida.
* **Seguridad y Control de Acceso:** 
  * Autenticación basada en **JWT (JSON Web Tokens)**.
  * Control de acceso en frontend mediante **Guards funcionales** modernos de Angular.
  * Protección de endpoints en backend mediante middleware de autenticación.
  * Soporte para "Modo Invitado" (solo lectura).

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:**
  * **Angular** (Componentes Standalone, Enrutamiento Reactivo, HTTP Interceptors)
  * **Leaflet** (Mapas interactivos y capas de coordenadas)
  * **CSS Custom Properties** (Variables CSS para el sistema de temas y modo oscuro)
* **Backend:**
  * **Laravel** (RESTful API, Eloquent ORM, Transacciones de BD y Bloqueos de Concurrencia)
  * **Tymon JWTAuth** (Manejo seguro de sesiones sin estado)
  * **MySQL** (Base de datos relacional con índices optimizados para coordenadas y estados)
* **Infraestructura:**
  * **Docker** & **Docker Compose** (Contenedores aislados y reproducibles)

---

## ⚙️ Instrucciones de Despliegue (Docker)

El proyecto está completamente dockerizado para facilitar su inicio inmediato. Sigue estos pasos para arrancar el entorno en local:

### 1. Levantar los contenedores
Ejecuta el siguiente comando en la raíz del proyecto para construir y levantar los contenedores de MySQL, Backend y Frontend en segundo plano:
```bash
docker-compose up -d --build
```

### 2. Instalar dependencias del Backend (Composer)
Genera el directorio de librerías de PHP dentro del contenedor del backend:
```bash
docker-compose run --rm backend composer install
```

### 3. Ejecutar Migraciones y Poblado de Datos (Seeders)
Crea la estructura de tablas y carga los datos iniciales de prueba (usuarios, tipos de marcadores e incidencias de ejemplo):
```bash
docker-compose exec backend php artisan migrate --seed
```

---

## 🌐 URLs de Acceso Local

* **Frontend (Angular):** [http://localhost:4200](http://localhost:4200)
* **Backend API (Laravel):** [http://localhost:8000](http://localhost:8000)
* **MySQL Database:** Localhost en puerto `3307` (Puerto interno contenedor: `3306`)
