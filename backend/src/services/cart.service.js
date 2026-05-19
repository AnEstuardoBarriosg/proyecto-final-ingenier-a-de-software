const pool = require("../db/pool");

const getOrCreateActiveCart = async (idUsuario) => {
    const existingCart = await pool.query(
        `
    SELECT id_carrito, id_usuario, estado, fecha_creacion
    FROM carritos
    WHERE id_usuario = $1 AND estado = 'activo'
    ORDER BY id_carrito DESC
    LIMIT 1
    `,
        [idUsuario],
    );

    if (existingCart.rows.length > 0) {
        return existingCart.rows[0];
    }

    const newCart = await pool.query(
        `
    INSERT INTO carritos (id_usuario, estado)
    VALUES ($1, 'activo')
    RETURNING id_carrito, id_usuario, estado, fecha_creacion
    `,
        [idUsuario],
    );

    return newCart.rows[0];
};

const buildCartResponse = async (idCarrito) => {
    const cartResult = await pool.query(
        `
    SELECT id_carrito, id_usuario, estado, fecha_creacion
    FROM carritos
    WHERE id_carrito = $1
    LIMIT 1
    `,
        [idCarrito],
    );

    if (cartResult.rows.length === 0) {
        return null;
    }

    const itemsResult = await pool.query(
        `
    SELECT 
      cd.id_detalle_carrito,
      cd.id_producto,
      p.nombre,
      cd.cantidad,
      cd.precio_unitario,
      (cd.cantidad * cd.precio_unitario) AS subtotal
    FROM carrito_detalles cd
    INNER JOIN productos p ON cd.id_producto = p.id_producto
    WHERE cd.id_carrito = $1
    ORDER BY cd.id_detalle_carrito ASC
    `,
        [idCarrito],
    );

    const cart = cartResult.rows[0];
    const items = itemsResult.rows;

    const total = items.reduce((acc, item) => {
        return acc + Number(item.subtotal);
    }, 0);

    return {
        ...cart,
        items,
        total,
    };
};

const getActiveCart = async (idUsuario) => {
    const cart = await getOrCreateActiveCart(idUsuario);
    return buildCartResponse(cart.id_carrito);
};

const addItem = async (idUsuario, { id_producto, cantidad }) => {
    if (!id_producto || !cantidad) {
        throw new Error("id_producto y cantidad son obligatorios");
    }

    if (Number(cantidad) <= 0) {
        throw new Error("La cantidad debe ser mayor que cero");
    }

    const productResult = await pool.query(
        `
    SELECT id_producto, nombre, precio, stock, estado
    FROM productos
    WHERE id_producto = $1
    LIMIT 1
    `,
        [id_producto],
    );

    if (productResult.rows.length === 0) {
        throw new Error("El producto no existe");
    }

    const product = productResult.rows[0];

    if (product.estado !== "activo") {
        throw new Error("El producto no está disponible");
    }

    if (Number(cantidad) > Number(product.stock)) {
        throw new Error("No hay stock suficiente para este producto");
    }

    const cart = await getOrCreateActiveCart(idUsuario);

    const existingItem = await pool.query(
        `
    SELECT id_detalle_carrito, cantidad
    FROM carrito_detalles
    WHERE id_carrito = $1 AND id_producto = $2
    LIMIT 1
    `,
        [cart.id_carrito, id_producto],
    );

    if (existingItem.rows.length > 0) {
        const currentItem = existingItem.rows[0];
        const nuevaCantidad = Number(currentItem.cantidad) + Number(cantidad);

        if (nuevaCantidad > Number(product.stock)) {
            throw new Error("La cantidad total supera el stock disponible");
        }

        await pool.query(
            `
      UPDATE carrito_detalles
      SET cantidad = $1, precio_unitario = $2
      WHERE id_detalle_carrito = $3
      `,
            [nuevaCantidad, product.precio, currentItem.id_detalle_carrito],
        );
    } else {
        await pool.query(
            `
      INSERT INTO carrito_detalles (id_carrito, id_producto, cantidad, precio_unitario)
      VALUES ($1, $2, $3, $4)
      `,
            [cart.id_carrito, id_producto, cantidad, product.precio],
        );
    }

    return buildCartResponse(cart.id_carrito);
};

const updateItem = async (idUsuario, idDetalleCarrito, { cantidad }) => {
    if (!cantidad) {
        throw new Error("La cantidad es obligatoria");
    }

    if (Number(cantidad) <= 0) {
        throw new Error("La cantidad debe ser mayor que cero");
    }

    const cart = await getOrCreateActiveCart(idUsuario);

    const itemResult = await pool.query(
        `
    SELECT cd.id_detalle_carrito, cd.id_producto
    FROM carrito_detalles cd
    WHERE cd.id_detalle_carrito = $1 AND cd.id_carrito = $2
    LIMIT 1
    `,
        [idDetalleCarrito, cart.id_carrito],
    );

    if (itemResult.rows.length === 0) {
        throw new Error("El producto no existe en el carrito");
    }

    const item = itemResult.rows[0];

    const productResult = await pool.query(
        `
    SELECT id_producto, precio, stock
    FROM productos
    WHERE id_producto = $1
    LIMIT 1
    `,
        [item.id_producto],
    );

    const product = productResult.rows[0];

    if (Number(cantidad) > Number(product.stock)) {
        throw new Error("La cantidad supera el stock disponible");
    }

    await pool.query(
        `
    UPDATE carrito_detalles
    SET cantidad = $1, precio_unitario = $2
    WHERE id_detalle_carrito = $3
    `,
        [cantidad, product.precio, idDetalleCarrito],
    );

    return buildCartResponse(cart.id_carrito);
};

const deleteItem = async (idUsuario, idDetalleCarrito) => {
    const cart = await getOrCreateActiveCart(idUsuario);

    const deleteResult = await pool.query(
        `
    DELETE FROM carrito_detalles
    WHERE id_detalle_carrito = $1 AND id_carrito = $2
    RETURNING id_detalle_carrito
    `,
        [idDetalleCarrito, cart.id_carrito],
    );

    if (deleteResult.rows.length === 0) {
        throw new Error("El producto no existe en el carrito");
    }

    return buildCartResponse(cart.id_carrito);
};

module.exports = {
    getActiveCart,
    addItem,
    updateItem,
    deleteItem,
};
