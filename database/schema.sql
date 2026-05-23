-- =========================================
-- Raíces Market - schema.sql
-- Base de datos: PostgreSQL
-- =========================================

-- =========================
-- 1. TABLAS BASE
-- =========================

CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre_completo VARCHAR(120) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    estado VARCHAR(20) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expira TIMESTAMP,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_roles
        FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

CREATE TABLE IF NOT EXISTS vendedores (
    id_vendedor SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    nombre_tienda VARCHAR(120) NOT NULL,
    descripcion TEXT,
    estado_aprobacion VARCHAR(20) NOT NULL,
    CONSTRAINT fk_vendedores_usuarios
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- =========================
-- 2. CATÁLOGO DE PRODUCTOS
-- =========================

CREATE TABLE IF NOT EXISTS productos (
    id_producto SERIAL PRIMARY KEY,
    id_vendedor INT NOT NULL,
    id_categoria INT NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    stock INT NOT NULL CHECK (stock >= 0),
    estado VARCHAR(20) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_productos_vendedores
        FOREIGN KEY (id_vendedor) REFERENCES vendedores(id_vendedor),
    CONSTRAINT fk_productos_categorias
        FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

CREATE TABLE IF NOT EXISTS producto_imagenes (
    id_imagen SERIAL PRIMARY KEY,
    id_producto INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_producto_imagenes_productos
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- =========================
-- 3. CARRITO DE COMPRAS
-- =========================

CREATE TABLE IF NOT EXISTS carritos (
    id_carrito SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    estado VARCHAR(20) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_carritos_usuarios
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS carrito_detalles (
    id_detalle_carrito SERIAL PRIMARY KEY,
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    CONSTRAINT fk_carrito_detalles_carritos
        FOREIGN KEY (id_carrito) REFERENCES carritos(id_carrito),
    CONSTRAINT fk_carrito_detalles_productos
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- =========================
-- 4. DIRECCIONES Y PEDIDOS
-- =========================

CREATE TABLE IF NOT EXISTS direcciones (
    id_direccion SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    direccion_linea VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    referencia VARCHAR(255),
    codigo_postal VARCHAR(20),
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_direcciones_usuarios
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_direccion INT NOT NULL,
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    estado VARCHAR(30) NOT NULL,
    fecha_pedido TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedidos_usuarios
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_pedidos_direcciones
        FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direccion)
);

CREATE TABLE IF NOT EXISTS pedido_detalles (
    id_detalle_pedido SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    CONSTRAINT fk_pedido_detalles_pedidos
        FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    CONSTRAINT fk_pedido_detalles_productos
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- =========================
-- 5. PAGOS
-- =========================

CREATE TABLE IF NOT EXISTS pagos (
    id_pago SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL UNIQUE,
    metodo_pago VARCHAR(50) NOT NULL,
    referencia_externa VARCHAR(120),
    monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
    estado_pago VARCHAR(30) NOT NULL,
    fecha_pago TIMESTAMP,
    CONSTRAINT fk_pagos_pedidos
        FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
);

-- =========================
-- 6. RESEÑAS
-- =========================

CREATE TABLE IF NOT EXISTS resenas (
    id_resena SERIAL PRIMARY KEY,
    id_producto INT NOT NULL,
    id_usuario INT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_resena TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resenas_productos
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
    CONSTRAINT fk_resenas_usuarios
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- =========================
-- 7. NOTIFICACIONES
-- =========================

CREATE TABLE IF NOT EXISTS notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificaciones_usuarios
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- =========================
-- 8. ÍNDICES
-- =========================

CREATE INDEX IF NOT EXISTS idx_productos_id_categoria
    ON productos(id_categoria);

CREATE INDEX IF NOT EXISTS idx_productos_id_vendedor
    ON productos(id_vendedor);

CREATE INDEX IF NOT EXISTS idx_productos_estado
    ON productos(estado);

CREATE INDEX IF NOT EXISTS idx_pedidos_id_usuario
    ON pedidos(id_usuario);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado
    ON pedidos(estado);

CREATE INDEX IF NOT EXISTS idx_pagos_id_pedido
    ON pagos(id_pedido);

CREATE INDEX IF NOT EXISTS idx_carrito_detalles_carrito_producto
    ON carrito_detalles(id_carrito, id_producto);

CREATE INDEX IF NOT EXISTS idx_resenas_id_producto
    ON resenas(id_producto);

CREATE INDEX IF NOT EXISTS idx_notificaciones_id_usuario ON notificaciones(id_usuario);