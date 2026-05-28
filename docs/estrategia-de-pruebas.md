# Estrategia de Pruebas — Raíces Market

**Proyecto:** Raíces Market – Plataforma de comercio artesanal guatemalteco  
**Fecha:** Mayo 2026  
**Equipo:** Proyecto de Ingeniería de Software – Fase I

---

## 1. Alcance y Objetivos

El plan de pruebas cubre el **backend** (Node.js + Express + PostgreSQL) de Raíces Market. Los objetivos son:

- Garantizar que la lógica de negocio funcione correctamente de forma aislada (pruebas unitarias).
- Verificar que los componentes se comuniquen entre sí como se espera (pruebas de integración).
- Asegurar cobertura mínima del 60% en los módulos principales.
- Ejecutar las pruebas automáticamente en cada push/PR mediante GitHub Actions.

---

## 2. Tipos de Prueba Aplicados

### 2.1 Pruebas Unitarias

**Alcance:** Módulos individuales probados en aislamiento; las dependencias externas (base de datos, librerías de terceros) se sustituyen por mocks de Jest.

**Módulos cubiertos:**

| Módulo | Archivo de prueba | Descripción |
|---|---|---|
| `auth.service.js` | `unit/auth.service.test.js` | Registro y login de usuarios |
| `products.service.js` | `unit/products.service.test.js` | Catálogo y detalle de productos |
| `cart.service.js` | `unit/cart.service.test.js` | Agregar, actualizar y eliminar ítems del carrito |
| `orders.service.js` | `unit/orders.service.test.js` | Creación y consulta de pedidos |
| `auth.middleware.js` | `unit/middlewares.test.js` | Verificación de JWT |
| `role.middleware.js` | `unit/middlewares.test.js` | Control de acceso por rol |

**Casos de prueba destacados — auth.service:**

| ID | Precondición | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| U-AUTH-01 | — | `registerUser` sin `nombre_completo` | Error 400 "campos obligatorios" | Error 400 ✓ |
| U-AUTH-02 | — | `registerUser` con password < 8 chars | Error 400 "mínimo 8 caracteres" | Error 400 ✓ |
| U-AUTH-03 | Email ya en BD | `registerUser` con correo duplicado | Error 400 "correo ya está registrado" | Error 400 ✓ |
| U-AUTH-04 | Rol vendedor | `registerUser` sin `nombre_tienda` | Error 400 "nombre de tienda obligatorio" | Error 400 ✓ |
| U-AUTH-05 | Email disponible | `registerUser` con datos válidos | Usuario creado, sin contraseña en respuesta | Usuario id=50 ✓ |
| U-AUTH-06 | — | `loginUser` con correo inexistente | Error 401 "Credenciales inválidas" | Error 401 ✓ |
| U-AUTH-07 | Cuenta inactiva | `loginUser` con cuenta suspendida | Error 401 "La cuenta no está activa" | Error 401 ✓ |
| U-AUTH-08 | Contraseña incorrecta | `loginUser` con password erróneo | Error 401 "Credenciales inválidas" | Error 401 ✓ |
| U-AUTH-09 | Credenciales correctas | `loginUser` con datos válidos | Token JWT + datos del usuario | Token string ✓ |

**Casos de prueba destacados — middlewares:**

| ID | Precondición | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| U-MW-01 | — | Request sin cabecera Authorization | 401 "Token no proporcionado" | 401 ✓ |
| U-MW-02 | — | Token malformado (no "Bearer X") | 401 "Formato inválido" | 401 ✓ |
| U-MW-03 | — | JWT inválido/expirado | 401 "Token inválido o expirado" | 401 ✓ |
| U-MW-04 | JWT válido | Token firmado con secret correcto | `next()` llamado, `req.user` asignado | next() ✓ |
| U-MW-05 | req.user undefined | `authorizeRoles("admin")` | 401 "Usuario no autenticado" | 401 ✓ |
| U-MW-06 | rol: "cliente" | `authorizeRoles("admin")` | 403 "No tienes permisos" | 403 ✓ |
| U-MW-07 | rol: "admin" | `authorizeRoles("admin","vendedor")` | `next()` llamado | next() ✓ |

---

### 2.2 Pruebas de Integración

**Alcance:** Pruebas de extremo a extremo dentro del backend. Se envían peticiones HTTP reales al servidor Express (con supertest) y se mockea únicamente la capa de base de datos. Esto valida la comunicación entre:

- **API (rutas + middlewares)** ↔ **Controladores** ↔ **Servicios** ↔ **Base de datos (mock)**

**Archivo:** `integration/api.integration.test.js`

#### Escenario 1 — Health check del servidor

| Campo | Detalle |
|---|---|
| **Precondición** | Servidor Express inicializado |
| **Pasos** | `GET /health` |
| **Resultado esperado** | HTTP 200, `{ ok: true, message: "..." }` |
| **Resultado obtenido** | HTTP 200 ✓ |
| **Componentes validados** | Express app, registro de rutas |

#### Escenario 2 — Registro de usuario

| Campo | Detalle |
|---|---|
| **Precondición** | Correo no registrado previamente (BD mock retorna vacío) |
| **Pasos** | `POST /auth/register` con nombre, correo y contraseña válidos |
| **Resultado esperado** | HTTP 201, `{ ok: true, data: { id_usuario, correo } }` |
| **Resultado obtenido** | HTTP 201, id_usuario: 50 ✓ |
| **Componentes validados** | auth.routes → auth.controller → auth.service → pool.query |

*Sub-escenario 2b:* Registro con datos incompletos → HTTP 400 ✓  
*Sub-escenario 2c:* Correo duplicado → HTTP 400, mensaje correcto ✓

#### Escenario 3 — Catálogo de productos (acceso público)

| Campo | Detalle |
|---|---|
| **Precondición** | Productos activos en BD (2 registros mock) |
| **Pasos** | `GET /products` sin token de autenticación |
| **Resultado esperado** | HTTP 200, array con 2 productos |
| **Resultado obtenido** | HTTP 200, data.length === 2 ✓ |
| **Componentes validados** | products.routes → products.controller → products.service → pool.query |

*Sub-escenario 3b:* `GET /products?search=tejido` → HTTP 200, filtrado ✓

#### Escenario 4 — Carrito de compras (ruta protegida)

| Campo | Detalle |
|---|---|
| **Precondición** | Ruta requiere token de cliente |
| **Pasos 4a** | `GET /cart` sin token → 401 ✓ |
| **Pasos 4b** | `GET /cart` con token de admin → 403 (rol incorrecto) ✓ |
| **Pasos 4c** | `GET /cart` con token de cliente → 200, datos del carrito ✓ |
| **Resultado esperado** | Acceso controlado por rol, carrito retornado correctamente |
| **Componentes validados** | auth.middleware + role.middleware → cart.controller → cart.service |

#### Escenario 5 — Pedidos del usuario

| Campo | Detalle |
|---|---|
| **Precondición** | Token de cliente válido, 2 pedidos en BD mock |
| **Pasos** | `GET /orders/my-orders` con token Bearer |
| **Resultado esperado** | HTTP 200, array con 2 pedidos |
| **Resultado obtenido** | HTTP 200, data.length === 2 ✓ |
| **Componentes validados** | orders.routes → authenticateToken → authorizeRoles → orders.controller → orders.service → pool.query |

---

## 3. Herramientas Utilizadas

| Herramienta | Versión | Propósito |
|---|---|---|
| **Jest** | ^29.7.0 | Framework de pruebas (runner, assertions, mocks) |
| **Supertest** | ^7.0.0 | Pruebas de integración HTTP sobre Express |
| **Istanbul (nyc)** | integrado en Jest | Reporte de cobertura de código |
| **GitHub Actions** | — | CI/CD: ejecución automática en push/PR |

**Cobertura generada:** HTML + LCOV (carpeta `backend/coverage/`)  
**Umbral mínimo configurado:** 60% en statements, branches, functions y lines.

---

## 4. Criterios de Entrada y Salida

### Pruebas Unitarias

| Criterio | Detalle |
|---|---|
| **Entrada** | Módulo implementado, dependencias instaladas (`jest`, `supertest`) |
| **Salida** | Todas las pruebas pasan (`PASS`), cobertura ≥ 60% en módulo |

### Pruebas de Integración

| Criterio | Detalle |
|---|---|
| **Entrada** | App Express montada, mocks de BD configurados, `JWT_SECRET` definido |
| **Salida** | Los 5 escenarios pasan, respuestas HTTP con el código y formato correcto |

---

## 5. Pipeline CI/CD (GitHub Actions)

**Archivo:** `.github/workflows/ci.yml`  
**Trigger:** push o pull_request a las ramas `main` y `develop`.

**Pasos del pipeline:**
1. Checkout del repositorio
2. Configurar Node.js 20
3. Instalar pnpm (via action oficial `pnpm/action-setup@v4`)
4. `pnpm install` — instala Jest y Supertest desde `pnpm-lock.yaml`
5. `pnpm test` — ejecuta todas las pruebas y genera reporte de cobertura
6. Upload del artefacto `coverage-report` (HTML + LCOV)

---

## 6. Defectos Encontrados y Resolución

Durante el desarrollo de las pruebas se identificaron los siguientes puntos de mejora:

| ID | Descripción | Módulo | Estado |
|---|---|---|---|
| DEF-001 | `createOrder` no valida stock negativo explícitamente (depende de constraint de BD) | `orders.service.js` | Aceptado — la BD tiene CHECK constraint |
| DEF-002 | `addItem` al carrito no verifica que la suma de cantidades supere el stock cuando el item ya existe | `cart.service.js` | Cubierto en prueba U-CART-08 (validación presente en código) |
| DEF-003 | El endpoint `GET /products` no tiene paginación, puede retornar grandes volúmenes | `products.service.js` | Registrado como mejora futura |

---

## 7. Historias de Usuario Validadas

| Historia | Criterio de Aceptación | Prueba que lo valida |
|---|---|---|
| Como cliente quiero registrarme | Registro rechazado con contraseña < 8 chars | U-AUTH-02 |
| Como cliente quiero iniciar sesión | Token JWT retornado con datos del usuario | U-AUTH-09, INT-ESC2 |
| Como cliente quiero ver el catálogo | Productos retornados sin autenticación | INT-ESC3 |
| Como cliente quiero agregar al carrito | Solo clientes con token pueden agregar | U-CART-07, INT-ESC4 |
| Como cliente quiero ver mis pedidos | Lista de pedidos retornada con token | INT-ESC5 |

