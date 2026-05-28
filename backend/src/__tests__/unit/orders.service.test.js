jest.mock("../../db/pool", () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));
jest.mock("../../services/notifications.service", () => ({
  createNotification: jest.fn().mockResolvedValue({}),
}));

const pool = require("../../db/pool");
const { createOrder, getOrdersByUser, getOrderDetail } = require("../../services/orders.service");

const buildMockClient = (...queryResults) => {
  const query = jest.fn();
  queryResults.forEach((r) => query.mockResolvedValueOnce(r));
  return { query, release: jest.fn() };
};

describe("orders.service - createOrder", () => {
  beforeEach(() => jest.clearAllMocks());

  test("lanza error si no se proporciona id_direccion", async () => {
    await expect(createOrder(1, {})).rejects.toThrow("La dirección es obligatoria");
  });

  test("lanza error si la dirección no pertenece al usuario", async () => {
    const client = buildMockClient(
      {},                  // BEGIN
      { rows: [] },        // address check → not found
      {}                   // ROLLBACK
    );
    pool.connect.mockResolvedValue(client);

    await expect(createOrder(1, { id_direccion: 99 })).rejects.toThrow(
      "La dirección no existe o no pertenece al usuario"
    );
    expect(client.release).toHaveBeenCalled();
  });

  test("lanza error si no hay carrito activo", async () => {
    const client = buildMockClient(
      {},                                                  // BEGIN
      { rows: [{ id_direccion: 1, id_usuario: 1 }] },    // address check → ok
      { rows: [] },                                        // cart check → not found
      {}                                                   // ROLLBACK
    );
    pool.connect.mockResolvedValue(client);

    await expect(createOrder(1, { id_direccion: 1 })).rejects.toThrow(
      "No existe un carrito activo"
    );
    expect(client.release).toHaveBeenCalled();
  });

  test("lanza error si el carrito está vacío", async () => {
    const client = buildMockClient(
      {},
      { rows: [{ id_direccion: 1, id_usuario: 1 }] },
      { rows: [{ id_carrito: 5 }] },    // cart found
      { rows: [] },                       // items → vacío
      {}                                  // ROLLBACK
    );
    pool.connect.mockResolvedValue(client);

    await expect(createOrder(1, { id_direccion: 1 })).rejects.toThrow("El carrito está vacío");
  });

  test("crea el pedido correctamente y cierra el carrito", async () => {
    const orderRow = {
      id_pedido: 10,
      id_usuario: 1,
      id_direccion: 1,
      total: 150,
      estado: "pendiente_pago",
      fecha_pedido: new Date(),
    };

    const client = buildMockClient(
      {},                                                   // BEGIN
      { rows: [{ id_direccion: 1, id_usuario: 1 }] },     // address check
      { rows: [{ id_carrito: 5 }] },                       // cart check
      { rows: [{ id_producto: 1, cantidad: 3, precio_unitario: "50.00", subtotal: "150.00" }] }, // items
      { rows: [orderRow] },                                 // insert pedido
      { rows: [] },                                         // insert pedido_detalle
      { rows: [] },                                         // update stock
      { rows: [] },                                         // update carrito estado
      {}                                                    // COMMIT
    );
    pool.connect.mockResolvedValue(client);

    const result = await createOrder(1, { id_direccion: 1 });

    expect(result).toHaveProperty("id_pedido", 10);
    expect(result).toHaveProperty("estado", "pendiente_pago");
    expect(result.total).toBe(150);
    expect(client.release).toHaveBeenCalled();
  });
});

describe("orders.service - getOrdersByUser", () => {
  beforeEach(() => jest.clearAllMocks());

  test("retorna los pedidos del usuario", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { id_pedido: 1, total: 100, estado: "entregado", fecha_pedido: new Date() },
        { id_pedido: 2, total: 250, estado: "pendiente_pago", fecha_pedido: new Date() },
      ],
    });

    const result = await getOrdersByUser(5);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("id_pedido", 1);
  });

  test("retorna arreglo vacío si el usuario no tiene pedidos", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await getOrdersByUser(99);

    expect(result).toEqual([]);
  });
});

describe("orders.service - getOrderDetail", () => {
  beforeEach(() => jest.clearAllMocks());

  test("retorna null si el pedido no pertenece al usuario", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await getOrderDetail(1, 999);

    expect(result).toBeNull();
  });

  test("retorna el detalle del pedido con sus items", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{
          id_pedido: 1, id_usuario: 5, id_direccion: 2, total: "100.00",
          estado: "entregado", fecha_pedido: new Date(),
          direccion_linea: "Calle 1", ciudad: "Guatemala",
          referencia: "Frente al parque", codigo_postal: "01001",
        }],
      })
      .mockResolvedValueOnce({
        rows: [{ id_detalle_pedido: 1, id_producto: 10, nombre: "Tejido", cantidad: 2, precio_unitario: "50.00", subtotal: "100.00" }],
      });

    const result = await getOrderDetail(5, 1);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("id_pedido", 1);
    expect(result).toHaveProperty("detalles");
    expect(result.detalles).toHaveLength(1);
    expect(result.detalles[0]).toHaveProperty("nombre", "Tejido");
  });
});
