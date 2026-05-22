const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");

const MIN_PASSWORD_LENGTH = 8;

const validationError = (message) => {
    const err = new Error(message);
    err.statusCode = 400;
    return err;
};

const authError = (message) => {
    const err = new Error(message);
    err.statusCode = 401;
    return err;
};

const registerUser = async ({
    nombre_completo,
    correo,
    password,
    telefono,
}) => {
    if (!nombre_completo || !correo || !password) {
        throw validationError("Nombre, correo y contraseña son obligatorios");
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        throw validationError(
            `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
        );
    }

    const correoNormalizado = String(correo).trim().toLowerCase();

    const existingUser = await pool.query(
        "SELECT id_usuario FROM usuarios WHERE correo = $1",
        [correoNormalizado],
    );

    if (existingUser.rows.length > 0) {
        throw validationError("El correo ya está registrado");
    }

    const roleResult = await pool.query(
        "SELECT id_rol FROM roles WHERE nombre = 'cliente' LIMIT 1",
    );

    if (roleResult.rows.length === 0) {
        throw new Error("No existe el rol cliente en la base de datos");
    }

    const id_rol = roleResult.rows[0].id_rol;
    const password_hash = await bcrypt.hash(password, 10);

    const insertUser = await pool.query(
        `INSERT INTO usuarios (id_rol, nombre_completo, correo, password_hash, telefono, estado)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_usuario, nombre_completo, correo, telefono, estado`,
        [
            id_rol,
            nombre_completo,
            correoNormalizado,
            password_hash,
            telefono || null,
            "activo",
        ],
    );

    return insertUser.rows[0];
};

const loginUser = async ({ correo, password }) => {
    if (!correo || !password) {
        throw validationError("Correo y contraseña son obligatorios");
    }

    const correoNormalizado = String(correo).trim().toLowerCase();

    const userResult = await pool.query(
        `SELECT u.id_usuario, u.nombre_completo, u.correo, u.password_hash, u.estado, r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.correo = $1
     LIMIT 1`,
        [correoNormalizado],
    );

    if (userResult.rows.length === 0) {
        throw authError("Credenciales inválidas");
    }

    const user = userResult.rows[0];

    if (user.estado !== "activo") {
        throw authError("La cuenta no está activa");
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
        throw authError("Credenciales inválidas");
    }

    const token = jwt.sign(
        {
            id_usuario: user.id_usuario,
            correo: user.correo,
            rol: user.rol,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        },
    );

    return {
        user: {
            id_usuario: user.id_usuario,
            nombre_completo: user.nombre_completo,
            correo: user.correo,
            rol: user.rol,
        },
        token,
    };
};

module.exports = {
    registerUser,
    loginUser,
};
