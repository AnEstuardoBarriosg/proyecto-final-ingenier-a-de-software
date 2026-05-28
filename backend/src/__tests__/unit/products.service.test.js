jest.mock("../../db/pool", () => ({ query: jest.fn() }));

const pool = require("../../db/pool");
const { getAllProducts, getProductById } = require("../../services/products.service");

const productRow = {
  id_producto: 1,
  nombre: "Tejido Maya",
  descripcion: "Tejido artesanal",
  precio: "150.00",
  stock: 10,
  estado: "activo",
  categoria: "Artesanías",
  nombre_tienda: "Tienda Artesanal",
  url_imagen: "http://img.test/1.jpg",
  total_resenas: 3,
  promedio_calificacion: "4.50",
};

describe("products.service - getAllProducts", () => {
  beforeEach(() => jest.clearAllMocks());

  test("retorna todos los productos sin filtros", async () => {
    pool.query.mockResolvedValueOnce({ rows: [productRow] });

    const result = await getAllProducts({});

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("nombre", "Tejido Maya");
  });

  test("agrega cláusula de búsqueda cuando se pasa search", async () => {
    pool.query.mockResolvedValueOnce({ rows: [productRow] });

    await getAllProducts({ search: "tejido" });

    const [query, values] = pool.query.mock.calls[0];
    expect(query).toContain("LIKE");
    expect(values).toContain("%tejido%");
  });

  test("filtra por categoría cuando se pasa category", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await getAllProducts({ category: 3 });

    const [query, values] = pool.query.mock.calls[0];
    expect(query).toContain("id_categoria");
    expect(values).toContain(3);
  });

  test("filtra por precio mínimo y máximo", async () => {
    pool.query.mockResolvedValueOnce({ rows: [productRow] });

    await getAllProducts({ minPrice: 50, maxPrice: 200 });

    const [query, values] = pool.query.mock.calls[0];
    expect(query).toContain("precio >=");
    expect(query).toContain("precio <=");
    expect(values).toContain(50);
    expect(values).toContain(200);
  });

  test("retorna arreglo vacío si no hay productos", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await getAllProducts({});

    expect(result).toEqual([]);
  });
});

describe("products.service - getProductById", () => {
  beforeEach(() => jest.clearAllMocks());

  test("retorna null si el producto no existe", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await getProductById(999);

    expect(result).toBeNull();
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test("retorna el producto con imágenes y resumen de reseñas", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ ...productRow, id_categoria: 1, id_vendedor: 2, descripcion_vendedor: "desc" }] })
      .mockResolvedValueOnce({ rows: [{ id_imagen: 1, url_imagen: "http://img.test/1.jpg", es_principal: true }] })
      .mockResolvedValueOnce({ rows: [{ total_resenas: 3, promedio_calificacion: "4.50" }] });

    const result = await getProductById(1);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("id_producto", 1);
    expect(result).toHaveProperty("imagenes");
    expect(result.imagenes).toHaveLength(1);
    expect(result).toHaveProperty("resumen_resenas");
    expect(result.resumen_resenas).toHaveProperty("total_resenas", 3);
    expect(pool.query).toHaveBeenCalledTimes(3);
  });
});
