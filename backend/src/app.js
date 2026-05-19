const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");


const cartRoutes = require("./routes/cart.routes");
const productsRoutes = require("./routes/products.routes");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Backend de Raíces Market funcionando correctamente",
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      ok: true,
      message: "Conexión a PostgreSQL exitosa",
      serverTime: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al conectar con PostgreSQL",
      error: error.message,
    });
  }
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/products", productsRoutes);
app.use("/cart", cartRoutes);
module.exports = app;