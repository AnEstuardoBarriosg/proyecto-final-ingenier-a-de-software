const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-jwt-secret";

const authenticateToken = require("../../middlewares/auth.middleware");
const authorizeRoles = require("../../middlewares/role.middleware");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("auth.middleware - authenticateToken", () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
  });

  test("responde 401 si no hay cabecera Authorization", () => {
    const req = { headers: {} };
    const res = mockRes();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
    expect(next).not.toHaveBeenCalled();
  });

  test("responde 401 si el formato del token es inválido (sin Bearer)", () => {
    const req = { headers: { authorization: "InvalidFormat" } };
    const res = mockRes();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("responde 401 si el token está expirado o es inválido", () => {
    const req = { headers: { authorization: "Bearer tokenmalformado" } };
    const res = mockRes();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Token inválido o expirado" }));
    expect(next).not.toHaveBeenCalled();
  });

  test("llama a next() y asigna req.user con un token válido", () => {
    const payload = { id_usuario: 1, correo: "test@test.com", rol: "cliente" };
    const token = jwt.sign(payload, "test-jwt-secret");
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id_usuario: 1, rol: "cliente" });
  });
});

describe("role.middleware - authorizeRoles", () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
  });

  test("responde 401 si req.user no está definido", () => {
    const req = {};
    const res = mockRes();
    const middleware = authorizeRoles("admin");

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("responde 403 si el usuario no tiene el rol requerido", () => {
    const req = { user: { id_usuario: 1, rol: "cliente" } };
    const res = mockRes();
    const middleware = authorizeRoles("admin", "vendedor");

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
    expect(next).not.toHaveBeenCalled();
  });

  test("llama a next() si el usuario tiene un rol permitido", () => {
    const req = { user: { id_usuario: 2, rol: "admin" } };
    const res = mockRes();
    const middleware = authorizeRoles("admin", "vendedor");

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("acepta múltiples roles permitidos", () => {
    const req = { user: { id_usuario: 3, rol: "vendedor" } };
    const res = mockRes();
    const middleware = authorizeRoles("admin", "vendedor");

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
