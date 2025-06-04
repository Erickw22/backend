const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_secreto';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ msg: 'Token mal formatado' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('_id role');

    if (!user) {
      return res.status(401).json({ msg: 'Usuário não encontrado' });
    }

    req.user = { id: user._id, role: user.role };

    next();
  } catch (err) {
    console.error('Erro na verificação do token:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token expirado' });
    }

    return res.status(401).json({ msg: 'Token inválido' });
  }
};

module.exports = { authMiddleware };
