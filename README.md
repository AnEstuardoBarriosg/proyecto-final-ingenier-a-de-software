# Raíces Market

Raíces Market es una plataforma web de e-commerce para artesanías o productos locales con pago simulado. El sistema permite que los clientes exploren productos, los agreguen al carrito, realicen compras y consulten el estado de sus pedidos. Además, incluye funcionalidades para vendedores y administradores.

## Integrantes
- Angel Estuardo Barrios Gómez
- Ximena

## Objetivo del proyecto
Desarrollar una versión funcional del sistema definido en la Fase I, manteniendo coherencia con los requerimientos, la arquitectura, el modelo de datos y la propuesta visual ya aprobada.

## Stack tecnológico
### Frontend
- React

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

## Estructura del proyecto

/frontend   -> aplicación web  
/backend    -> API y lógica del sistema  
/database   -> scripts SQL y datos semilla  
/docs       -> documentación, evidencias y pruebas  
/docker-compose.yml -> configuración de servicios para Docker  

## Funcionalidades principales
- Registro e inicio de sesión
- Catálogo de productos
- Búsqueda y filtrado
- Detalle del producto
- Carrito de compras
- Checkout
- Pago simulado
- Historial de pedidos
- Panel del vendedor
- Panel administrativo

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
- JWT y rutas protegidas: funcional
- Módulo de productos: funcional
- Módulo de carrito: funcional
- Módulo de pedidos: funcional
- Pago simulado: funcional
- Docker para backend y base de datos: funcional
- Frontend en React: en desarrollo
- Despliegue: pendiente

## Endpoints disponibles actualmente

### Utilitarios
- `GET /health`
- `GET /db-test`

### Autenticación
- `GET /auth/test`
- `POST /auth/register`
- `POST /auth/login`

### Usuario
- `GET /user/profile`
- `GET /user/cliente-only`

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

## Requisitos previos
Antes de ejecutar el proyecto, es necesario tener instalado:

- Node.js
- pnpm
- Docker
- Docker Compose
- Git

## Configuración del entorno

### Backend
1. Entrar a la carpeta `backend`
2. Crear un archivo `.env` a partir de `.env.example` si se trabajará fuera de Docker
3. Configurar las variables necesarias

### Frontend
1. Entrar a la carpeta `frontend`
2. Crear un archivo `.env` a partir de `.env.example`
3. Configurar la URL de la API

## Instalación y ejecución

### Opción 1: ejecución con Docker
Desde la raíz del proyecto:

```bash
docker compose up --build


### Pruebas rápidas
# Después de levantar Docker, verificar estas rutas en el navegador o Postman:

- `http://localhost:3000/health`
- `http://localhost:3000/db-test`
- `http://localhost:3000/products`

### Opción 2: ejecución local
Desde la raíz del proyecto:

```bash
cd backend
pnpm install
pnpm run dev