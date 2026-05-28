-- =========================================
-- Raíces Market - seeds.sql
-- Datos iniciales de prueba
-- =========================================

-- =========================================
-- 0. EXTENSIÓN NECESARIA PARA HASHES
-- =========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- 1. ROLES
-- =========================
INSERT INTO roles (nombre) VALUES
('cliente'),
('vendedor'),
('administrador')
ON CONFLICT (nombre) DO NOTHING;

-- =========================
-- 2. USUARIOS
-- Contraseña de prueba para todos:
-- 12345678
-- Se genera con bcrypt desde PostgreSQL
-- =========================

-- Administrador
INSERT INTO usuarios (id_rol, nombre_completo, correo, password_hash, telefono, estado)
SELECT
    (SELECT id_rol FROM roles WHERE nombre = 'administrador' LIMIT 1),
    'Administrador General',
    'admin@raicesmarket.com',
    crypt('12345678', gen_salt('bf', 10)),
    '55550001',
    'activo'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE correo = 'admin@raicesmarket.com'
);

-- Vendedor
INSERT INTO usuarios (id_rol, nombre_completo, correo, password_hash, telefono, estado)
SELECT
    (SELECT id_rol FROM roles WHERE nombre = 'vendedor' LIMIT 1),
    'María López',
    'vendedor@raicesmarket.com',
    crypt('12345678', gen_salt('bf', 10)),
    '55550002',
    'activo'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE correo = 'vendedor@raicesmarket.com'
);

-- Cliente demo
INSERT INTO usuarios (id_rol, nombre_completo, correo, password_hash, telefono, estado)
SELECT
    (SELECT id_rol FROM roles WHERE nombre = 'cliente' LIMIT 1),
    'Carlos Pérez',
    'cliente@raicesmarket.com',
    crypt('12345678', gen_salt('bf', 10)),
    '55550003',
    'activo'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE correo = 'cliente@raicesmarket.com'
);

-- =========================
-- 3. VENDEDOR
-- =========================
INSERT INTO vendedores (id_usuario, nombre_tienda, descripcion, estado_aprobacion)
SELECT
    (SELECT id_usuario FROM usuarios WHERE correo = 'vendedor@raicesmarket.com' LIMIT 1),
    'Artesanías López',
    'Tienda dedicada a la venta de artesanías y productos locales hechos a mano.',
    'aprobado'
WHERE NOT EXISTS (
    SELECT 1
    FROM vendedores
    WHERE id_usuario = (
        SELECT id_usuario FROM usuarios WHERE correo = 'vendedor@raicesmarket.com' LIMIT 1
    )
);

-- =========================
-- 4. CATEGORÍAS
-- =========================
INSERT INTO categorias (nombre, descripcion) VALUES
('Textiles', 'Productos textiles elaborados artesanalmente.'),
('Cerámica', 'Piezas decorativas y utilitarias de cerámica.'),
('Accesorios', 'Accesorios artesanales y detalles decorativos.'),
('Decoración', 'Artículos decorativos para el hogar.')
ON CONFLICT (nombre) DO NOTHING;

-- =========================
-- 5. PRODUCTOS
-- =========================
INSERT INTO productos (
    id_vendedor,
    id_categoria,
    nombre,
    descripcion,
    precio,
    stock,
    estado
)
SELECT
    (SELECT id_vendedor
     FROM vendedores
     WHERE id_usuario = (
         SELECT id_usuario FROM usuarios WHERE correo = 'vendedor@raicesmarket.com' LIMIT 1
     )
     LIMIT 1),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Textiles' LIMIT 1),
    'Bufanda artesanal',
    'Bufanda tejida a mano con diseños tradicionales.',
    120.00,
    10,
    'activo'
WHERE NOT EXISTS (
    SELECT 1 FROM productos WHERE nombre = 'Bufanda artesanal'
);

INSERT INTO productos (
    id_vendedor,
    id_categoria,
    nombre,
    descripcion,
    precio,
    stock,
    estado
)
SELECT
    (SELECT id_vendedor
     FROM vendedores
     WHERE id_usuario = (
         SELECT id_usuario FROM usuarios WHERE correo = 'vendedor@raicesmarket.com' LIMIT 1
     )
     LIMIT 1),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Cerámica' LIMIT 1),
    'Taza de barro',
    'Taza artesanal elaborada en cerámica con acabado rústico.',
    85.00,
    15,
    'activo'
WHERE NOT EXISTS (
    SELECT 1 FROM productos WHERE nombre = 'Taza de barro'
);

INSERT INTO productos (
    id_vendedor,
    id_categoria,
    nombre,
    descripcion,
    precio,
    stock,
    estado
)
SELECT
    (SELECT id_vendedor
     FROM vendedores
     WHERE id_usuario = (
         SELECT id_usuario FROM usuarios WHERE correo = 'vendedor@raicesmarket.com' LIMIT 1
     )
     LIMIT 1),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Accesorios' LIMIT 1),
    'Pulsera tejida',
    'Pulsera artesanal de hilo con diseño colorido.',
    35.00,
    20,
    'activo'
WHERE NOT EXISTS (
    SELECT 1 FROM productos WHERE nombre = 'Pulsera tejida'
);

INSERT INTO productos (
    id_vendedor,
    id_categoria,
    nombre,
    descripcion,
    precio,
    stock,
    estado
)
SELECT
    (SELECT id_vendedor
     FROM vendedores
     WHERE id_usuario = (
         SELECT id_usuario FROM usuarios WHERE correo = 'vendedor@raicesmarket.com' LIMIT 1
     )
     LIMIT 1),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Decoración' LIMIT 1),
    'Jarrón decorativo',
    'Jarrón artesanal ideal para decoración de interiores.',
    150.00,
    5,
    'activo'
WHERE NOT EXISTS (
    SELECT 1 FROM productos WHERE nombre = 'Jarrón decorativo'
);

-- =========================
-- 6. IMÁGENES DE PRODUCTOS
-- =========================
INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal)
SELECT
    (SELECT id_producto FROM productos WHERE nombre = 'Bufanda artesanal' LIMIT 1),
    'https://placehold.co/400x300?text=Pulsera+tejida',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM producto_imagenes
    WHERE id_producto = (SELECT id_producto FROM productos WHERE nombre = 'Bufanda artesanal' LIMIT 1)
      AND es_principal = TRUE
);

INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal)
SELECT
    (SELECT id_producto FROM productos WHERE nombre = 'Taza de barro' LIMIT 1),
    'https://placehold.co/400x300?text=Taza+de+barro',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM producto_imagenes
    WHERE id_producto = (SELECT id_producto FROM productos WHERE nombre = 'Taza de barro' LIMIT 1)
      AND es_principal = TRUE
);

INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal)
SELECT
    (SELECT id_producto FROM productos WHERE nombre = 'Pulsera tejida' LIMIT 1),
    'https://placehold.co/400x300?text=Pulsera+tejida',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM producto_imagenes
    WHERE id_producto = (SELECT id_producto FROM productos WHERE nombre = 'Pulsera tejida' LIMIT 1)
      AND es_principal = TRUE
);

INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal)
SELECT
    (SELECT id_producto FROM productos WHERE nombre = 'Jarrón decorativo' LIMIT 1),
    'https://placehold.co/400x300?text=Jarron+decorativo',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM producto_imagenes
    WHERE id_producto = (SELECT id_producto FROM productos WHERE nombre = 'Jarrón decorativo' LIMIT 1)
      AND es_principal = TRUE
);

-- =========================
-- 7. DIRECCIÓN DEL CLIENTE DEMO
-- =========================
INSERT INTO direcciones (
    id_usuario,
    direccion_linea,
    ciudad,
    referencia,
    codigo_postal,
    es_principal
)
SELECT
    (SELECT id_usuario FROM usuarios WHERE correo = 'cliente@raicesmarket.com' LIMIT 1),
    'Zona 1, 5ta avenida 10-20',
    'Guatemala',
    'Frente al parque central',
    '01001',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM direcciones
    WHERE id_usuario = (
        SELECT id_usuario FROM usuarios WHERE correo = 'cliente@raicesmarket.com' LIMIT 1
    )
);

-- =========================
-- 8. CARRITO DE PRUEBA DEL CLIENTE DEMO
-- =========================
INSERT INTO carritos (id_usuario, estado)
SELECT
    (SELECT id_usuario FROM usuarios WHERE correo = 'cliente@raicesmarket.com' LIMIT 1),
    'activo'
WHERE NOT EXISTS (
    SELECT 1
    FROM carritos
    WHERE id_usuario = (
        SELECT id_usuario FROM usuarios WHERE correo = 'cliente@raicesmarket.com' LIMIT 1
    )
      AND estado = 'activo'
);

-- =========================
-- 9. DETALLES DEL CARRITO
-- =========================
INSERT INTO carrito_detalles (id_carrito, id_producto, cantidad, precio_unitario)
SELECT
    (
        SELECT id_carrito
        FROM carritos
        WHERE id_usuario = (
            SELECT id_usuario FROM usuarios WHERE correo = 'cliente@raicesmarket.com' LIMIT 1
        )
          AND estado = 'activo'
        ORDER BY id_carrito DESC
        LIMIT 1
    ),
    (SELECT id_producto FROM productos WHERE nombre = 'Bufanda artesanal' LIMIT 1),
    1,
    120.00
WHERE NOT EXISTS (
    SELECT 1
    FROM carrito_detalles
    WHERE id_carrito = (
        SELECT id_carrito
        FROM carritos
        WHERE id_usuario = (
            SELECT id_usuario FROM usuarios WHERE correo = 'cliente@raicesmarket.com' LIMIT 1
        )
          AND estado = 'activo'
        ORDER BY id_carrito DESC
        LIMIT 1
    )
      AND id_producto = (SELECT id_producto FROM productos WHERE nombre = 'Bufanda artesanal' LIMIT 1)
);

INSERT INTO carrito_detalles (id_carrito, id_producto, cantidad, precio_unitario)
SELECT
    (
        SELECT id_carrito
        FROM carritos
        WHERE id_usuario = (
            SELECT id_usuario FROM usuarios WHERE correo = 'cliente@raicesmarket.com' LIMIT 1
        )
          AND estado = 'activo'
        ORDER BY id_carrito DESC
        LIMIT 1
    ),
    (SELECT id_producto FROM productos WHERE nombre = 'Pulsera tejida' LIMIT 1),
    2,
    35.00
WHERE NOT EXISTS (
    SELECT 1
    FROM carrito_detalles
    WHERE id_carrito = (
        SELECT id_carrito
        FROM carritos
        WHERE id_usuario = (
            SELECT id_usuario FROM usuarios WHERE correo = 'cliente@raicesmarket.com' LIMIT 1
        )
          AND estado = 'activo'
        ORDER BY id_carrito DESC
        LIMIT 1
    )
      AND id_producto = (SELECT id_producto FROM productos WHERE nombre = 'Pulsera tejida' LIMIT 1)
);