require('dotenv').config();

const requiredEnv = ['JWT_SECRET', 'DATABASE_URL'];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`FATAL: faltan variables de entorno: ${missing.join(', ')}`);
  console.error('Revisa tu archivo .env (ver .env.example).');
  process.exit(1);
}

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
