import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Demo Mode Fallback
    if (mongoose.connection.readyState !== 1) {
      const demoUser = { id: 'demo-user', role: role || 'member' };
      const token = jwt.sign(demoUser, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        success: true,
        isDemo: true,
        token,
        user: { ...demoUser, name, email }
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'member'
    });

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Demo Mode Fallback
    if (mongoose.connection.readyState !== 1) {
      const demoUser = { id: 'demo-user', role: 'admin' };
      const token = jwt.sign(demoUser, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        success: true,
        isDemo: true,
        token,
        user: { ...demoUser, name: 'Demo User', email }
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ 
        success: true, 
        user: { 
          id: req.user.id, 
          name: 'Demo User', 
          email: 'demo@example.com', 
          role: req.user.role 
        } 
      });
    }
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
