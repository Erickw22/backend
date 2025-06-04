const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);

    const adminExists = await User.findOne({ email: 'admin@exemplo.com' });
    if (adminExists) {
      console.log('Usuário admin já existe');
      mongoose.disconnect();
      return;
    }

    const password = 'suaSenhaSuperSecreta';
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@exemplo.com',
      passwordHash: passwordHash,
      isAdmin: true
    });

    await admin.save();
    console.log('Admin criado com sucesso!');
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
