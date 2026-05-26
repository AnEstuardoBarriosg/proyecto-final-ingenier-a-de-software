const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");

const ordersRoutes = require("./routes/orders.routes");
const cartRoutes = require("./routes/cart.routes");
const productsRoutes = require("./routes/products.routes");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const paymentsRoutes = require("./routes/payments.routes");
const sellerRoutes = require("./routes/seller.routes");
const adminRoutes = require("./routes/admin.routes");
const categoriesRoutes = require("./routes/categories.routes");
const sellerOrdersRoutes = require("./routes/seller-orders.routes");
const adminSellersRoutes = require("./routes/admin-sellers.routes");
const adminUsersRoutes = require("./routes/admin-users.routes");
const passwordRoutes = require("./routes/password.routes");
const adminProductsRoutes = require("./routes/admin-products.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const reviewsRoutes = require("./routes/reviews.routes");
const addressesRoutes = require("./routes/addresses.routes");

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

app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/products", productsRoutes);
app.use("/cart", cartRoutes);
app.use("/payments", paymentsRoutes);
app.use("/seller", sellerRoutes);
app.use("/admin", adminRoutes);
app.use("/categories", categoriesRoutes);
app.use("/seller/orders", sellerOrdersRoutes);
app.use("/admin/sellers", adminSellersRoutes);
app.use("/admin/users", adminUsersRoutes);
app.use("/password", passwordRoutes);
app.use("/admin/products", adminProductsRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/addresses", addressesRoutes);
module.exports = app;