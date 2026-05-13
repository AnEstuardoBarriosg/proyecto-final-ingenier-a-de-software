const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Backend de Raíces Market funcionando correctamente'
  });
});

app.use('/auth', authRoutes);

module.exports = app;