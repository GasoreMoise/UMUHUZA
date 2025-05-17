import { Request, Response } from 'express';
const { validationResult } = require('express-validator');
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient, Prisma } from '@prisma/client';
import { UserRole } from '@prisma/client';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/email.service';
import { logPasswordResetAttempt, logSuspiciousActivity } from '../utils/logger';

const prisma = new PrismaClient();

interface PasswordReset {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
  used: boolean;
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *               name:
 *                 type: string
 *                 description: User's name
 *               role:
 *                 type: string
 *                 description: User's role
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *       500:
 *         description: Server error
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role = UserRole.CITIZEN } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      Buffer.from(process.env.JWT_SECRET || 'your-secret-key'),
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as SignOptions
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *       500:
 *         description: Server error
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      Buffer.from(process.env.JWT_SECRET || 'your-secret-key'),
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as SignOptions
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 role:
 *                   type: string
 *                 agency:
 *                   type: string
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Server error
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId.toString() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        agency: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: If the email is registered, a reset link will be sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 hint:
 *                   type: string
 *       500:
 *         description: Server error
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logPasswordResetAttempt(req, false, 'Password reset requested for non-existent email');
      return res.json({ 
        message: 'If your email is registered, you will receive a password reset link',
        hint: 'Please check your email for the reset link. If you don\'t receive it within a few minutes, check your spam folder.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Create password reset record using Prisma's type-safe API
    await prisma.passwordReset.create({
      data: {
        token: resetToken,
        expiresAt,
        userId: user.id,
      },
    });

    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      logPasswordResetAttempt(req, false, 'Failed to send reset email', user.id);
      return res.status(500).json({ 
        message: 'Unable to send password reset email',
        hint: 'Please try again later or contact support if the problem persists.'
      });
    }

    logPasswordResetAttempt(req, true, 'Password reset email sent successfully', user.id);
    return res.json({ 
      message: 'If your email is registered, you will receive a password reset link',
      hint: 'Please check your email for the reset link. If you don\'t receive it within a few minutes, check your spam folder.'
    });
  } catch (error: unknown) {
    console.error('Forgot password error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logSuspiciousActivity(req, 'Forgot password error', { error: errorMessage });
    return res.status(500).json({ 
      message: 'An unexpected error occurred',
      hint: 'Please try again later or contact support if the problem persists.'
    });
  }
};

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using a valid token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token received via email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New password (min 8 characters)
 *     responses:
 *       200:
 *         description: Password has been reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 hint:
 *                   type: string
 *       400:
 *         description: Invalid token or weak password
 *       500:
 *         description: Server error
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password is too weak',
        hint: 'Password must be at least 8 characters long and include a mix of letters, numbers, and special characters.'
      });
    }

    // Find the reset token using Prisma's type-safe API
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetRequest) {
      logPasswordResetAttempt(req, false, 'Invalid or expired reset token');
      return res.status(400).json({ 
        message: 'Invalid or expired reset token',
        hint: 'The reset link may have expired or already been used. Please request a new password reset link.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Use transaction to update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRequest.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { used: true },
      }),
    ]);

    logPasswordResetAttempt(req, true, 'Password reset successful', resetRequest.userId);
    return res.json({ 
      message: 'Password has been reset successfully',
      hint: 'You can now log in with your new password.'
    });
  } catch (error: unknown) {
    console.error('Reset password error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logSuspiciousActivity(req, 'Reset password error', { error: errorMessage });
    return res.status(500).json({ 
      message: 'An unexpected error occurred',
      hint: 'Please try again later or contact support if the problem persists.'
    });
  }
}; 