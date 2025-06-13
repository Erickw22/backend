const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ongRoutes = require('./routes/ongRoutes');

const app = express();

// ✅ Configuração de CORS mais segura e compatível com preflight
const allowedOrigins = ['https://ajudaog.netlify.app'];

app.use(cors({
    origin: 'https://ajudaong.netlify.app', 
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Erro: variável de ambiente MONGO_URI não definida!');
  process.exit(1);
}

// Removendo as opções depreciadas
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB conectado!'))
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  });

// ✅ Suas rotas
app.use('/ongs', ongRoutes);
app.use('/auth', authRoutes);

// ✅ Resposta para rota não encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// ✅ Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
