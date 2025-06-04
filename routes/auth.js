const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { authMiddleware } = require("../middlewares/authMiddleware");

const JWT_SECRET = process.env.JWT_SECRET || "seu_segredo_super_secreto";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ msg: "Todos os campos são obrigatórios" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ msg: "Email inválido" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ msg: "Usuário já existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      role: "user",
    });

    await user.save();

    return res.status(201).json({ msg: "Usuário registrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return res.status(500).json({ msg: "Erro interno ao registrar usuário" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Preencha todos os campos" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: "Credenciais inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ msg: "Credenciais inválidas" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({
      msg: "Login bem-sucedido",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isAdmin: user.role === "admin",
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ msg: "Erro interno no login" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }
    return res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário autenticado:", error);
    return res.status(500).json({ msg: "Erro no servidor" });
  }
});

router.patch("/me", authMiddleware, async (req, res) => {
  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
    return res
      .status(400)
      .json({ msg: "Nome, sobrenome e email são obrigatórios" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ msg: "Email inválido" });
  }

  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    return res.status(400).json({ msg: "ID de usuário inválido" });
  }

  try {
    const emailUsed = await User.findOne({
      email,
      _id: { $ne: new mongoose.Types.ObjectId(req.user.id) },
    });

    if (emailUsed) {
      return res
        .status(409)
        .json({ msg: "Email já está em uso por outro usuário" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, email },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }

    return res.json({
      msg: "Dados atualizados com sucesso",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500).json({ msg: "Erro interno ao atualizar usuário" });
  }
});

module.exports = router;
