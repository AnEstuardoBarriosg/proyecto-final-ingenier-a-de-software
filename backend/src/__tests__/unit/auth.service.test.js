jest.mock("../../db/pool", () => ({ query: jest.fn() }));
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("$2b$10$hashedpassword"),
  compare: jest.fn(),
}));

const pool = require("../../db/pool");
const bcrypt = require("bcrypt");
const { registerUser, loginUser } = require("../../services/auth.service");

process.env.JWT_SECRET = "test-jwt-secret";

describe("auth.service - registerUser", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    bcrypt.hash.mockResolvedValue("$2b$10$hashedpassword");
  });

  test("lanza 400 si falta nombre_completo", async () => {
    await expect(
      registerUser({ correo: "a@b.com", password: "12345678" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("lanza 400 si falta correo", async () => {
    await expect(
      registerUser({ nombre_completo: "Test", password: "12345678" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("lanza 400 si falta password", async () => {
    await expect(
      registerUser({ nombre_completo: "Test", correo: "a@b.com" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("lanza 400 si la contraseña es menor a 8 caracteres", async () => {
    await expect(
      registerUser({ nombre_completo: "Test", correo: "a@b.com", password: "1234" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("lanza 400 si vendedor no proporciona nombre_tienda", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // email check
    await expect(
      registerUser({ nombre_completo: "Test", correo: "v@b.com", password: "12345678", rol: "vendedor" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("lanza 400 si el correo ya está registrado", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id_usuario: 1 }] });
    await expect(
      registerUser({ nombre_completo: "Test", correo: "existe@b.com", password: "12345678" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("lanza error si el rol no existe en la base de datos", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })          // email check
      .mockResolvedValueOnce({ rows: [] });           // role check → vacío
    await expect(
      registerUser({ nombre_completo: "Test", correo: "nuevo@b.com", password: "12345678" })
    ).rejects.toThrow("No existe el rol");
  });

  test("registra exitosamente un cliente", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })                           // email check
      .mockResolvedValueOnce({ rows: [{ id_rol: 2 }] })             // role check
      .mockResolvedValueOnce({                                        // insert usuario
        rows: [{
          id_usuario: 10,
          nombre_completo: "Ana García",
          correo: "ana@test.com",
          telefono: null,
          estado: "activo",
        }],
      });

    const result = await registerUser({
      nombre_completo: "Ana García",
      correo: "ana@test.com",
      password: "securepass123",
    });

    expect(result).toHaveProperty("id_usuario", 10);
    expect(result).toHaveProperty("correo", "ana@test.com");
    expect(result).toHaveProperty("estado", "activo");
    expect(bcrypt.hash).toHaveBeenCalledWith("securepass123", 10);
  });

  test("registra exitosamente un vendedor y crea su tienda", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })                           // email check
      .mockResolvedValueOnce({ rows: [{ id_rol: 3 }] })             // role check
      .mockResolvedValueOnce({                                        // insert usuario
        rows: [{
          id_usuario: 20,
          nombre_completo: "Pedro Vendedor",
          correo: "pedro@tienda.com",
          telefono: "55551234",
          estado: "activo",
        }],
      })
      .mockResolvedValueOnce({ rows: [] });                          // insert vendedores

    const result = await registerUser({
      nombre_completo: "Pedro Vendedor",
      correo: "pedro@tienda.com",
      password: "securepass123",
      rol: "vendedor",
      nombre_tienda: "Artesanías Pedro",
    });

    expect(result.id_usuario).toBe(20);
    expect(pool.query).toHaveBeenCalledTimes(4);
  });

  test("normaliza el correo a minúsculas", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id_rol: 2 }] })
      .mockResolvedValueOnce({
        rows: [{ id_usuario: 5, nombre_completo: "Test", correo: "test@example.com", telefono: null, estado: "activo" }],
      });

    await registerUser({ nombre_completo: "Test", correo: "TEST@EXAMPLE.COM", password: "12345678" });

    const emailCallArgs = pool.query.mock.calls[0][1];
    expect(emailCallArgs[0]).toBe("test@example.com");
  });
});

describe("auth.service - loginUser", () => {
  beforeEach(() => jest.resetAllMocks());

  test("lanza 400 si falta correo o password", async () => {
    await expect(loginUser({ correo: "a@b.com" })).rejects.toMatchObject({ statusCode: 400 });
    await expect(loginUser({ password: "pass" })).rejects.toMatchObject({ statusCode: 400 });
  });

  test("lanza 401 si el usuario no existe", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await expect(
      loginUser({ correo: "noexiste@b.com", password: "pass" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("lanza 401 si la cuenta no está activa", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id_usuario: 1, nombre_completo: "X", correo: "x@b.com", password_hash: "hash", estado: "inactivo", rol: "cliente" }],
    });
    await expect(
      loginUser({ correo: "x@b.com", password: "pass" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("lanza 401 si la contraseña es incorrecta", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id_usuario: 1, nombre_completo: "X", correo: "x@b.com", password_hash: "hash", estado: "activo", rol: "cliente" }],
    });
    bcrypt.compare.mockResolvedValue(false);
    await expect(
      loginUser({ correo: "x@b.com", password: "wrongpass" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("retorna usuario y token al iniciar sesión correctamente", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{
        id_usuario: 5,
        nombre_completo: "María López",
        correo: "maria@test.com",
        password_hash: "$2b$10$correcthash",
        estado: "activo",
        rol: "cliente",
      }],
    });
    bcrypt.compare.mockResolvedValue(true);

    const result = await loginUser({ correo: "maria@test.com", password: "mypassword" });

    expect(result).toHaveProperty("token");
    expect(result.user).toMatchObject({
      id_usuario: 5,
      correo: "maria@test.com",
      rol: "cliente",
    });
    expect(typeof result.token).toBe("string");
  });
});
