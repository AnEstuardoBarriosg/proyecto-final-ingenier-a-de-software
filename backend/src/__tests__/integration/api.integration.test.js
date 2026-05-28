/**
 * Pruebas de Integración — Raíces Market API
 *
 * Validan la comunicación entre: HTTP request → Router → Controller → Service → DB (mock)
 * Se documentan 5 escenarios de integración requeridos por el enunciado.
 */

jest.mock("../../db/pool", () => ({ query: jest.fn(), connect: jest.fn() }));
jest.mock("express-rate-limit", () => () => (req, res, next) => next());

process.env.JWT_SECRET = "test-jwt-secret-integration";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const pool = require("../../db/pool");
const app = require("../../app");

const clientToken = jwt.sign(
  { id_usuario: 1, correo: "cliente@test.com", rol: "cliente" },
  "test-jwt-secret-integration"
);

const adminToken = jwt.sign(
  { id_usuario: 99, correo: "admin@test.com", rol: "admin" },
  "test-jwt-secret-integration"
);

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// ESCENARIO 1: Health check — el servidor responde correctamente
// ─────────────────────────────────────────────────────────────────────────────
describe("ESCENARIO 1 — Health check del servidor", () => {
  /**
   * Precondición: El servidor Express está corriendo.
   * Pasos: GET /health
   * Resultado esperado: 200 OK con ok: true
   */
  test("GET /health retorna 200 y ok: true", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
    expect(res.body).toHaveProperty("message");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ESCENARIO 2: Registro de usuario — validación y creación exitosa
// ─────────────────────────────────────────────────────────────────────────────
describe("ESCENARIO 2 — Registro de usuario (POST /auth/register)", () => {
  /**
   * Precondición: Correo no registrado previamente.
   * Pasos: POST /auth/register con datos válidos.
   * Resultado esperado: 201 con el nuevo usuario.
   */
  test("registra un cliente nuevo y retorna 201", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })                            // email check
      .mockResolvedValueOnce({ rows: [{ id_rol: 2 }] })              // role lookup
      .mockResolvedValueOnce({
        rows: [{
          id_usuario: 50,
          nombre_completo: "Nuevo Cliente",
          correo: "nuevo@test.com",
          telefono: null,
          estado: "activo",
        }],
      });                                                              // insert

    const res = await request(app).post("/auth/register").send({
      nombre_completo: "Nuevo Cliente",
      correo: "nuevo@test.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("ok", true);
    expect(res.body.data).toHaveProperty("id_usuario", 50);
    expect(res.body.data).toHaveProperty("correo", "nuevo@test.com");
  });

  /**
   * Precondición: —
   * Pasos: POST /auth/register con datos incompletos (sin password).
   * Resultado esperado: 400 con mensaje de error.
   */
  test("retorna 400 si faltan campos obligatorios", async () => {
    const res = await request(app).post("/auth/register").send({
      nombre_completo: "Test",
      correo: "test@test.com",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("ok", false);
    expect(res.body).toHaveProperty("message");
  });

  /**
   * Precondición: Correo ya registrado en la base de datos.
   * Pasos: POST /auth/register con correo duplicado.
   * Resultado esperado: 400 indicando que el correo existe.
   */
  test("retorna 400 si el correo ya está registrado", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id_usuario: 1 }] });

    const res = await request(app).post("/auth/register").send({
      nombre_completo: "Test",
      correo: "existente@test.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("correo ya está registrado");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ESCENARIO 3: Catálogo de productos — acceso público
// ─────────────────────────────────────────────────────────────────────────────
describe("ESCENARIO 3 — Catálogo de productos (GET /products)", () => {
  /**
   * Precondición: Productos activos en la base de datos.
   * Pasos: GET /products sin autenticación.
   * Resultado esperado: 200 con lista de productos.
   */
  test("retorna 200 con la lista de productos sin autenticación", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { id_producto: 1, nombre: "Tejido Maya", precio: "150.00", stock: 10, categoria: "Artesanías" },
        { id_producto: 2, nombre: "Cerámica", precio: "80.00", stock: 5, categoria: "Artesanías" },
      ],
    });

    const res = await request(app).get("/products");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]).toHaveProperty("nombre", "Tejido Maya");
  });

  /**
   * Precondición: —
   * Pasos: GET /products?search=tejido
   * Resultado esperado: 200 con productos filtrados.
   */
  test("retorna productos filtrados por búsqueda", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id_producto: 1, nombre: "Tejido Maya", precio: "150.00", stock: 10, categoria: "Artesanías" }],
    });

    const res = await request(app).get("/products?search=tejido");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].nombre).toContain("Tejido");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ESCENARIO 4: Carrito — acceso autenticado y protección de roles
// ─────────────────────────────────────────────────────────────────────────────
describe("ESCENARIO 4 — Carrito de compras (GET /cart)", () => {
  /**
   * Precondición: —
   * Pasos: GET /cart sin token de autenticación.
   * Resultado esperado: 401 Unauthorized.
   */
  test("retorna 401 si no hay token (ruta protegida)", async () => {
    const res = await request(app).get("/cart");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("ok", false);
  });

  /**
   * Precondición: Token de administrador (rol incorrecto para esta ruta).
   * Pasos: GET /cart con token de admin.
   * Resultado esperado: 403 Forbidden.
   */
  test("retorna 403 si el rol no es cliente (solo clientes pueden ver el carrito)", async () => {
    const res = await request(app)
      .get("/cart")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("ok", false);
  });

  /**
   * Precondición: Token válido de cliente, carrito activo en la BD.
   * Pasos: GET /cart con token de cliente.
   * Resultado esperado: 200 con datos del carrito.
   */
  test("retorna 200 con el carrito del cliente autenticado", async () => {
    const cartRow = { id_carrito: 1, id_usuario: 1, estado: "activo", fecha_creacion: new Date() };
    pool.query
      .mockResolvedValueOnce({ rows: [cartRow] })   // getOrCreateActiveCart
      .mockResolvedValueOnce({ rows: [cartRow] })   // buildCartResponse: carrito
      .mockResolvedValueOnce({ rows: [] });           // buildCartResponse: items

    const res = await request(app)
      .get("/cart")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
    expect(res.body.data).toHaveProperty("id_carrito", 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ESCENARIO 5: Pedidos del usuario — comunicación API ↔ Base de datos
// ─────────────────────────────────────────────────────────────────────────────
describe("ESCENARIO 5 — Pedidos del usuario (GET /orders/my-orders)", () => {
  /**
   * Precondición: —
   * Pasos: GET /orders/my-orders sin token.
   * Resultado esperado: 401 Unauthorized.
   */
  test("retorna 401 sin token de autenticación", async () => {
    const res = await request(app).get("/orders/my-orders");

    expect(res.status).toBe(401);
  });

  /**
   * Precondición: Token válido de cliente, pedidos en la BD.
   * Pasos: GET /orders/my-orders con token de cliente.
   * Resultado esperado: 200 con lista de pedidos.
   */
  test("retorna 200 con los pedidos del cliente", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { id_pedido: 1, total: "250.00", estado: "entregado", fecha_pedido: new Date() },
        { id_pedido: 2, total: "80.00", estado: "pendiente_pago", fecha_pedido: new Date() },
      ],
    });

    const res = await request(app)
      .get("/orders/my-orders")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]).toHaveProperty("id_pedido", 1);
  });
});
