# Frontend — Raíces Market

Instrucciones rápidas para levantar el frontend y conectarlo al backend local.

Requisitos:
- Node.js 18+ (o LTS compatible)
- `pnpm` instalado globalmente o disponible vía Corepack

Comandos:

1. Instalar dependencias (usando `pnpm`)

```bash
cd frontend
pnpm install
```

2. Configurar variables de entorno

Crear un archivo `.env` en la carpeta `frontend` con la variable:

```
VITE_API_URL=http://localhost:3000
```

3. Levantar el frontend

```bash
pnpm dev
```

4. Backend (usar `pnpm`)

Desde la carpeta `backend`:

```bash
cd ../backend
pnpm install
# Crear .env con DATABASE_URL, por ejemplo: postgres://user:pass@localhost:5432/raices
pnpm dev
```

## Si `pnpm` no está disponible

Si el sistema responde que `pnpm` no se reconoce, instala/activa `pnpm` con uno de estos comandos:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

O bien:

```bash
npm install -g pnpm
```

Después de esto, vuelve a ejecutar:

```bash
cd frontend
pnpm install
pnpm dev
```

Notas:
- La página de catálogo intenta obtener `/products?estado=activo` desde `VITE_API_URL`. Si no existe ese endpoint, la app mostrará datos de ejemplo.
- Para integración de pago, se recomienda usar Stripe: el backend debe implementar un endpoint que cree `PaymentIntent`.
