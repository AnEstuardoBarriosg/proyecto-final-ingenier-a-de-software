# Raíces Market

Raíces Market es una plataforma web de e-commerce para artesanías o productos locales con pago simulado. El sistema permite que los clientes exploren productos, los agreguen al carrito, realicen compras, consulten el estado de sus pedidos y reciban notificaciones. Además, incluye funcionalidades para vendedores y administradores.

## Integrantes
- Angel Estuardo Barrios Gómez
- Ximena

## Objetivo del proyecto
Desarrollar una versión funcional del sistema definido en la Fase I, manteniendo coherencia con los requerimientos, la arquitectura, el modelo de datos y la propuesta visual ya aprobada.

## Stack tecnológico

### Frontend
- React
- Vite

### Backend
- Node.js
- Express

### Base de datos
- PostgreSQL

### Autenticación
- JWT

### Gestión de paquetes
- pnpm

### Contenerización
- Docker
- Docker Compose

### Infraestructura / Hosting
- Vercel para frontend
- Render para backend y base de datos

---

## Estructura del proyecto

/frontend   -> aplicación web  
/backend    -> API y lógica del sistema  
/database   -> scripts SQL y datos semilla  
/docs       -> documentación, evidencias y pruebas  
/docker-compose.yml -> configuración de servicios para Docker  

---

## Funcionalidades principales

### Cliente
- Registro de usuario
- Inicio de sesión
- Recuperación de contraseña
- Catálogo de productos
- Búsqueda y filtrado
- Detalle del producto
- Carrito de compras
- Checkout
- Pago simulado
- Historial de pedidos
- Notificaciones de compra
- Reseñas de productos

### Vendedor
- Registro de productos
- Actualización de productos
- Actualización de inventario
- Consulta de pedidos relacionados con sus productos

### Administrador
- Gestión de pedidos
- Gestión de vendedores
- Gestión de usuarios
- Gestión de productos

---

## Estado actual del proyecto
- Repositorio creado: sí
- Azure DevOps configurado: sí
- Fase I aprobada: sí
- Base de datos PostgreSQL creada: sí
- `schema.sql` creado: sí
- `seeds.sql` creado: sí
- Backend base iniciado: sí
- Conexión a base de datos: funcional
- Registro de usuarios: funcional
- Inicio de sesión: funcional
- Recuperación de contraseña: funcional
- JWT y rutas protegidas: funcional
- Módulo de productos: funcional
- Módulo de categorías: funcional
- Módulo de carrito: funcional
- Módulo de pedidos: funcional
- Pago simulado: funcional
- Notificaciones: funcional
- Reseñas: funcional
- Módulo de vendedor: funcional
- Módulo de administrador: funcional
- Docker para backend y base de datos: funcional
- Frontend en React: en desarrollo / integración parcial funcional
- Despliegue: pendiente

---

## Revisión de endpoints finales

El backend quedó organizado en módulos funcionales ya probados. La revisión final de endpoints queda así:

### Utilitarios
- `GET /health`
- `GET /db-test`

### Autenticación
- `GET /auth/test`
- `POST /auth/register`
- `POST /auth/login`

### Recuperación de contraseña
- `POST /password/forgot-password`
- `POST /password/reset-password`

### Usuario
- `GET /user/profile`
- `GET /user/cliente-only`

### Categorías
- `GET /categories`
- `GET /categories/:id`

### Productos
- `GET /products`
- `GET /products/:id`

### Carrito
- `GET /cart`
- `POST /cart/items`
- `PUT /cart/items/:id`
- `DELETE /cart/items/:id`

### Pedidos
- `POST /orders`
- `GET /orders/my-orders`
- `GET /orders/:id`

### Pagos
- `POST /payments/simulate`

### Notificaciones
- `GET /notifications`
- `PATCH /notifications/:id/read`

### Reseñas
- `POST /reviews`
- `GET /reviews/product/:id`

### Vendedor - productos
- `GET /seller/products`
- `POST /seller/products`
- `PUT /seller/products/:id`
- `PATCH /seller/products/:id/stock`

### Vendedor - pedidos
- `GET /seller/orders`
- `GET /seller/orders/:id`

### Administrador - pedidos
- `GET /admin/orders`
- `GET /admin/orders/:id`
- `PATCH /admin/orders/:id/status`

### Administrador - vendedores
- `GET /admin/sellers`
- `GET /admin/sellers/:id`
- `PATCH /admin/sellers/:id/status`

### Administrador - usuarios
- `GET /admin/users`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id/status`

### Administrador - productos
- `GET /admin/products`
- `GET /admin/products/:id`
- `PATCH /admin/products/:id/status`

---

## Requisitos previos
Antes de ejecutar el proyecto, es necesario tener instalado:

- Node.js
- pnpm
- Docker
- Docker Compose
- Git

---

## Configuración del entorno

### Backend
1. Entrar a la carpeta `backend`
2. Crear un archivo `.env` a partir de `.env.example` si se trabajará fuera de Docker
3. Configurar las variables necesarias

### Frontend
1. Entrar a la carpeta `frontend`
2. Crear un archivo `.env` a partir de `.env.example`
3. Configurar la URL de la API

---

## Instalación y ejecución

### Opción 1: ejecución con Docker
Desde la raíz del proyecto:

```bash
### Alternativa para no ejecutar docker compose up --build cada que se agrega un modulo nuevo

docker compose build backend
docker compose up

```bash
docker compose up --build

```bash
### Pruebas rápidas
http://localhost:3000/health
http://localhost:3000/db-test
http://localhost:3000/products

```bash
### Reiniciar completamente la base en Docker
docker compose down -v
docker compose up --build