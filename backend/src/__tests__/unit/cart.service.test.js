jest.mock("../../db/pool", () => ({ query: jest.fn() }));

const pool = require("../../db/pool");
const { addItem, updateItem, deleteItem } = require("../../services/cart.service");

const activeCart = { id_carrito: 1, id_usuario: 5, estado: "activo", fecha_creacion: new Date() };
const cartDetail = { id_detalle_carrito: 1, id_producto: 10, nombre: "Producto", cantidad: 2, precio_unitario: "50.00", subtotal: "100.00" };
const cartResponse = { ...activeCart, items: [cartDetail], total: 100 };

const mockBuildCartResponse = () => {
  pool.query
    .mockResolvedValueOnce({ rows: [activeCart] })
    .mockResolvedValueOnce({ rows: [cartDetail] });
};

describe("cart.service - addItem", () => {
  beforeEach(() => jest.clearAllMocks());

  test("lanza error si falta id_producto", async () => {
    await expect(addItem(5, { cantidad: 2 })).rejects.toThrow("id_producto y cantidad son obligatorios");
  });

  test("lanza error si falta cantidad", async () => {
    await expect(addItem(5, { id_producto: 10 })).rejects.toThrow("id_producto y cantidad son obligatorios");
  });

  test("lanza error si la cantidad es 0 (falsy → obligatoria)", async () => {
    await expect(addItem(5, { id_producto: 10, cantidad: 0 })).rejects.toThrow("id_producto y cantidad son obligatorios");
  });

  test("lanza error si la cantidad es negativa", async () => {
    await expect(addItem(5, { id_producto: 10, cantidad: -1 })).rejects.toThrow("La cantidad debe ser mayor que cero");
  });

  test("lanza error si el producto no existe", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await expect(addItem(5, { id_producto: 999, cantidad: 1 })).rejects.toThrow("El producto no existe");
  });

  test("lanza error si el producto no está activo", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id_producto: 10, nombre: "Test", precio: "50.00", stock: 20, estado: "inactivo" }],
    });
    await expect(addItem(5, { id_producto: 10, cantidad: 1 })).rejects.toThrow("El producto no está disponible");
  });

  test("lanza error si no hay stock suficiente", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id_producto: 10, nombre: "Test", precio: "50.00", stock: 3, estado: "activo" }],
    });
    await expect(addItem(5, { id_producto: 10, cantidad: 10 })).rejects.toThrow("No hay stock suficiente");
  });

  test("agrega un producto nuevo al carrito exitosamente", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id_producto: 10, nombre: "Tejido", precio: "50.00", stock: 20, estado: "activo" }] })
      .mockResolvedValueOnce({ rows: [activeCart] })       // getOrCreateActiveCart → existing
      .mockResolvedValueOnce({ rows: [] })                  // existing item check → none
      .mockResolvedValueOnce({ rows: [] })                  // insert carrito_detalle
      .mockResolvedValueOnce({ rows: [activeCart] })        // buildCartResponse: carrito
      .mockResolvedValueOnce({ rows: [cartDetail] });       // buildCartResponse: items

    const result = await addItem(5, { id_producto: 10, cantidad: 2 });

    expect(result).toHaveProperty("id_carrito", 1);
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
  });

  test("actualiza cantidad si el producto ya existe en el carrito", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id_producto: 10, nombre: "Tejido", precio: "50.00", stock: 20, estado: "activo" }] })
      .mockResolvedValueOnce({ rows: [activeCart] })
      .mockResolvedValueOnce({ rows: [{ id_detalle_carrito: 1, cantidad: 3 }] }) // existing item found
      .mockResolvedValueOnce({ rows: [] })                                          // UPDATE
      .mockResolvedValueOnce({ rows: [activeCart] })
      .mockResolvedValueOnce({ rows: [cartDetail] });

    const result = await addItem(5, { id_producto: 10, cantidad: 2 });

    expect(result).toHaveProperty("id_carrito", 1);
  });
});

describe("cart.service - updateItem", () => {
  beforeEach(() => jest.clearAllMocks());

  test("lanza error si la cantidad es negativa", async () => {
    await expect(updateItem(5, 1, { cantidad: -1 })).rejects.toThrow("La cantidad debe ser mayor que cero");
  });

  test("lanza error si el item no existe en el carrito", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [activeCart] })  // getOrCreateActiveCart
      .mockResolvedValueOnce({ rows: [] });             // item check → not found

    await expect(updateItem(5, 999, { cantidad: 1 })).rejects.toThrow("El producto no existe en el carrito");
  });
});

describe("cart.service - deleteItem", () => {
  beforeEach(() => jest.clearAllMocks());

  test("lanza error si el item no existe en el carrito", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [activeCart] })
      .mockResolvedValueOnce({ rows: [] });             // delete → nothing deleted

    await expect(deleteItem(5, 999)).rejects.toThrow("El producto no existe en el carrito");
  });

  test("elimina el item y retorna el carrito actualizado", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [activeCart] })
      .mockResolvedValueOnce({ rows: [{ id_detalle_carrito: 1 }] })  // delete → ok
      .mockResolvedValueOnce({ rows: [activeCart] })                   // buildCartResponse: carrito
      .mockResolvedValueOnce({ rows: [] });                             // buildCartResponse: items (vacío)

    const result = await deleteItem(5, 1);

    expect(result).toHaveProperty("id_carrito", 1);
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
