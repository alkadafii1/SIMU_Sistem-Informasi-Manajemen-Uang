const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const { users } = require('../storage/memory');
const { generateToken } = require('../utils/jwt');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REGISTER
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const error = new Error('Semua field (name, email, password) wajib diisi');
      error.statusCode = 400;
      throw error;
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      const error = new Error('Email sudah terdaftar');
      error.statusCode = 409;
      throw error;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('🔐 Password hash untuk', email, ':', passwordHash.substring(0, 20) + '...');

    const newUser = {
      id: users.length + 1,
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    console.log('✅ User registered:', { id: newUser.id, email: newUser.email });
    console.log('Total users:', users.length);

    const token = generateToken(newUser.id, newUser.email);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      token
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN (sudah diperbaiki, tanpa variabel sebelum destructuring)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('📥 Request login:', { email, passwordProvided: !!password });

    if (!email || !password) {
      const error = new Error('Email dan password wajib diisi');
      error.statusCode = 400;
      throw error;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('❌ User tidak ditemukan:', email);
      const error = new Error('Email atau password salah');
      error.statusCode = 401;
      throw error;
    }

    console.log('👤 User ditemukan:', user.email);
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log('🔑 Password valid?', isPasswordValid);

    if (!isPasswordValid) {
      const error = new Error('Email atau password salah');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user.id, user.email);
    res.json({
      success: true,
      message: 'Login berhasil',
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    next(error);
  }
};

// GET CURRENT USER
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// GOOGLE LOGIN
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      const error = new Error('ID token tidak ditemukan');
      error.statusCode = 400;
      throw error;
    }

    // Verifikasi token dengan Google
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID, // harus sama dengan Client ID frontend
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Cari user berdasarkan email
    let user = users.find(u => u.email === email);

    if (!user) {
      // Buat user baru jika belum ada (password dummy karena login via Google)
      const dummyPassword = await bcrypt.hash('google-oauth-' + Date.now(), 10);
      const newUser = {
        id: users.length + 1,
        name: name || email.split('@')[0],
        email: email,
        passwordHash: dummyPassword,
        googleId: googleId,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      user = newUser;
      console.log('✅ User baru dari Google:', user.email);
    } else {
      // Update googleId jika belum ada
      if (googleId && !user.googleId) {
        user.googleId = googleId;
      }
      console.log('🔁 User sudah ada (Google):', user.email);
    }

    const token = generateToken(user.id, user.email);
    res.json({
      success: true,
      message: 'Login dengan Google berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Google login error:', error);
    next(error);
  }
};


module.exports = { register, login, getMe, googleLogin };