-- =========================================
-- Raíces Market - seeds.sql
-- Datos iniciales de prueba
-- =========================================

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
-- Nota:
-- password_hash aquí está como texto de prueba.
-- Más adelante, cuando implementen auth real,
-- deben generar hashes reales con bcrypt.
-- =========================
INSERT INTO usuarios (id_rol, nombre_completo, correo, password_hash, telefono, estado)
VALUES
(
    (SELECT id_rol FROM roles WHERE nombre = 'administrador'),
    'Administrador General',
    'admin@raicesmarket.com',
    'hash_temporal_admin',
    '55550001',
    'activo'
),
(
    (SELECT id_rol FROM roles WHERE nombre = 'vendedor'),
    'María López',
    'vendedor@raicesmarket.com',
    'hash_temporal_vendedor',
    '55550002',
    'activo'
),
(
    (SELECT id_rol FROM roles WHERE nombre = 'cliente'),
    'Carlos Pérez',
    'cliente@raicesmarket.com',
    'hash_temporal_cliente',
    '55550003',
    'activo'
)
ON CONFLICT (correo) DO NOTHING;

-- =========================
-- 3. VENDEDOR
-- =========================
INSERT INTO vendedores (id_usuario, nombre_tienda, descripcion, estado_aprobacion)
VALUES
(
    (SELECT id_usuario FROM usuarios WHERE correo = 'vendedor@raicesmarket.com'),
    'Artesanías López',
    'Tienda dedicada a la venta de artesanías y productos locales hechos a mano.',
    'aprobado'
)
ON CONFLICT (id_usuario) DO NOTHING;

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
VALUES
(
    (SELECT id_vendedor FROM vendedores
     WHERE id_usuario = (SELECT id_usuario FROM usuarios WHERE correo = 'vendedor@raicesmarket.com')),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Textiles'),
    'Bufanda artesanal',
    'Bufanda tejida a mano con diseños tradicionales.',
    120.00,
    10,
    'activo'
),
(
    (SELECT id_vendedor FROM vendedores
     WHERE id_usuario = (SELECT id_usuario FROM usuarios WHERE correo = 'vendedor@raicesmarket.com')),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Cerámica'),
    'Taza de barro',
    'Taza artesanal elaborada en cerámica con acabado rústico.',
    85.00,
    15,
    'activo'
),
(
    (SELECT id_vendedor FROM vendedores
     WHERE id_usuario = (SELECT id_usuario FROM usuarios WHERE correo = 'vendedor@raicesmarket.com')),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Accesorios'),
    'Pulsera tejida',
    'Pulsera artesanal de hilo con diseño colorido.',
    35.00,
    20,
    'activo'
),
(
    (SELECT id_vendedor FROM vendedores
     WHERE id_usuario = (SELECT id_usuario FROM usuarios WHERE correo = 'vendedor@raicesmarket.com')),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Decoración'),
    'Jarrón decorativo',
    'Jarrón artesanal ideal para decoración de interiores.',
    150.00,
    5,
    'activo'
);

-- =========================
-- 6. IMÁGENES DE PRODUCTOS
-- =========================
INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal)
VALUES
(
    (SELECT id_producto FROM productos WHERE nombre = 'Bufanda artesanal' LIMIT 1),
    'https://via.placeholder.com/400x300?text=Bufanda+artesanal',
    TRUE
),
(
    (SELECT id_producto FROM productos WHERE nombre = 'Taza de barro' LIMIT 1),
    'https://via.placeholder.com/400x300?text=Taza+de+barro',
    TRUE
),
(
    (SELECT id_producto FROM productos WHERE nombre = 'Pulsera tejida' LIMIT 1),
    'https://via.placeholder.com/400x300?text=Pulsera+tejida',
    TRUE
),
(
    (SELECT id_producto FROM productos WHERE nombre = 'Jarrón decorativo' LIMIT 1),
    'https://via.placeholder.com/400x300?text=Jarron+decorativo',
    TRUE
);

-- =========================
-- 7. DIRECCIÓN DEL CLIENTE
-- =========================
INSERT INTO direcciones (
    id_usuario,
    direccion_linea,
    ciudad,
    referencia,
    codigo_postal,
    es_principal
)
VALUES
(
    (SELECT id_usuario FROM usuarios WHERE correo = 'cliente@raicesmarket.com'),
    'Zona 1, 5ta avenida 10-20',
    'Guatemala',
    'Frente al parque central',
    '01001',
    TRUE
);

-- =========================
-- 8. CARRITO DE PRUEBA
-- =========================
INSERT INTO carritos (id_usuario, estado)
VALUES
(
    (SELECT id_usuario FROM usuarios WHERE correo = 'cliente@raicesmarket.com'),
    'activo'
);

-- =========================
-- 9. DETALLES DEL CARRITO
-- =========================
INSERT INTO carrito_detalles (id_carrito, id_producto, cantidad, precio_unitario)
VALUES
(
    (SELECT id_carrito FROM carritos
     WHERE id_usuario = (SELECT id_usuario FROM usuarios WHERE correo = 'cliente@raicesmarket.com')
     ORDER BY id_carrito DESC LIMIT 1),
    (SELECT id_producto FROM productos WHERE nombre = 'Bufanda artesanal' LIMIT 1),
    1,
    120.00
),
(
    (SELECT id_carrito FROM carritos
     WHERE id_usuario = (SELECT id_usuario FROM usuarios WHERE correo = 'cliente@raicesmarket.com')
     ORDER BY id_carrito DESC LIMIT 1),
    (SELECT id_producto FROM productos WHERE nombre = 'Pulsera tejida' LIMIT 1),
    2,
    35.00
);