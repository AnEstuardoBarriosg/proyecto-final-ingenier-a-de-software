const pool = require("../db/pool");

const simulatePayment = async (
    idUsuario,
    { id_pedido, resultado, metodo_pago },
) => {
    if (!id_pedido || !resultado) {
        throw new Error("id_pedido y resultado son obligatorios");
    }

    const resultadosValidos = ["approved", "rejected", "pending"];

    if (!resultadosValidos.includes(resultado)) {
        throw new Error("El resultado del pago no es válido");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const orderResult = await client.query(
            `
      SELECT id_pedido, id_usuario, total, estado
      FROM pedidos
      WHERE id_pedido = $1 AND id_usuario = $2
      LIMIT 1
      `,
            [id_pedido, idUsuario],
        );

        if (orderResult.rows.length === 0) {
            throw new Error("El pedido no existe o no pertenece al usuario");
        }

        const order = orderResult.rows[0];

        if (order.estado !== "pendiente_pago") {
            throw new Error("El pedido no está disponible para procesar pago");
        }

        const existingPayment = await client.query(
            `
      SELECT id_pago
      FROM pagos
      WHERE id_pedido = $1
      LIMIT 1
      `,
            [id_pedido],
        );

        if (existingPayment.rows.length > 0) {
            throw new Error("El pedido ya tiene un pago registrado");
        }

        let estado_pago = "";
        let nuevo_estado_pedido = "";

        if (resultado === "approved") {
            estado_pago = "aprobado";
            nuevo_estado_pedido = "pagado";
        } else if (resultado === "rejected") {
            estado_pago = "rechazado";
            nuevo_estado_pedido = "pago_rechazado";
        } else if (resultado === "pending") {
            estado_pago = "pendiente";
            nuevo_estado_pedido = "pendiente_confirmacion_pago";
        }

        const paymentResult = await client.query(
            `
      INSERT INTO pagos (id_pedido, metodo_pago, referencia_externa, monto, estado_pago, fecha_pago)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id_pago, id_pedido, metodo_pago, referencia_externa, monto, estado_pago, fecha_pago
      `,
            [
                id_pedido,
                metodo_pago || "simulado",
                `SIM-${Date.now()}`,
                order.total,
                estado_pago,
            ],
        );

        await client.query(
            `
      UPDATE pedidos
      SET estado = $1
      WHERE id_pedido = $2
      `,
            [nuevo_estado_pedido, id_pedido],
        );

        await client.query("COMMIT");

        return {
            pago: paymentResult.rows[0],
            pedido: {
                id_pedido: order.id_pedido,
                estado_anterior: order.estado,
                estado_actual: nuevo_estado_pedido,
            },
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    simulatePayment,
};
