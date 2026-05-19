const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                ok: false,
                message: "Usuario no autenticado",
            });
        }

        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({
                ok: false,
                message: "No tienes permisos para acceder a esta ruta",
            });
        }

        next();
    };
};

module.exports = authorizeRoles;
