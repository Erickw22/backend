// routes/ongRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Ong = require('../models/Ong');

router.post('/register', async (req, res) => {
  const { name, address, phone, location, email, description } = req.body;

  if (!name || !address || !phone || !location?.lat || !location?.lng) {
    return res.status(400).json({ msg: 'Todos os campos são obrigatórios' });
  }

  try {
    const ong = new Ong({ name, address, phone, location, email, description });
    await ong.save();
    res.status(201).json({ msg: 'ONG registrada com sucesso', ong });
  } catch (error) {
    console.error('Erro ao salvar ONG:', error);
    res.status(500).json({ msg: 'Erro interno ao salvar ONG' });
  }
});

router.get('/list', async (req, res) => {
  try {
    const ongs = await Ong.find();
    res.json(ongs);
  } catch (error) {
    console.error('Erro ao buscar ONGs:', error);
    res.status(500).json({ msg: 'Erro interno ao buscar ONGs' });
  }
});

router.get('/details/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: 'ID inválido' });
  }

  try {
    const ong = await Ong.findById(id);

    if (!ong) {
      return res.status(404).json({ msg: 'ONG não encontrada' });
    }

    res.json(ong);
  } catch (error) {
    console.error('Erro ao buscar detalhes da ONG:', error);
    res.status(500).json({ msg: 'Erro interno ao buscar detalhes da ONG' });
  }
});

module.exports = router;
