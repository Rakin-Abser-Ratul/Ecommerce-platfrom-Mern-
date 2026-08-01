import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// @desc    Register new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ detail: 'Email is already registered.' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ detail: 'Username is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      is_active: newUser.is_active ?? true,
      created_at: newUser.created_at || newUser.createdAt,
    });
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
};

// @desc    Login user & return token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const userEmail = req.body.username || req.body.email;
  const userPassword = req.body.password;

  try {
    const user = await User.findOne({ email: userEmail });

    if (!user || !(await bcrypt.compare(userPassword, user.password))) {
      return res.status(401).set('WWW-Authenticate', 'Bearer').json({
        detail: 'Incorrect email or password',
      });
    }

    const accessToken = jwt.sign(
      { sub: user.email, id: user.id },
      process.env.JWT_SECRET || 'your_fallback_secret',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      access_token: accessToken,
      token_type: 'bearer',
    });
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.sub || req.user.email });

    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      is_active: user.is_active ?? true,
      created_at: user.created_at || user.createdAt,
    });
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
};