import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Database } from './db.js';
import { sendOtpViaTextBee } from './sms.js';

const JWT_SECRET = process.env.JWT_SECRET || 'krishivaani_dev_jwt_secret_9918237198273';
const COOKIE_NAME = 'krishivaani_session';

// Zod Validation Schemas
export const SendOtpSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Mobile must be a valid 10-digit Indian number starting with 6-9'),
  intent: z.enum(['register', 'login']).optional(),
});

export const VerifyOtpSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Mobile must be a valid 10-digit Indian number'),
  otp: z
    .string()
    .regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export const RegisterSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Mobile must be a valid 10-digit Indian number'),
  otp: z
    .string()
    .regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long'),
  pin: z
    .string()
    .regex(/^\d{6}$/, 'Security PIN must be exactly 6 digits'),
  language: z.string().optional().default('hi'),
});

export const LoginSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Mobile must be a valid 10-digit Indian number'),
  pin: z
    .string()
    .regex(/^\d{6}$/, 'PIN must be exactly 6 digits'),
});

// Simple sliding window rate limiter
const rateLimits: Record<string, { count: number; resetAt: number }> = {};
function checkRateLimit(key: string, maxLimit = 10, windowSec = 60): boolean {
  const now = Date.now();
  const entry = rateLimits[key];
  if (!entry || now > entry.resetAt) {
    rateLimits[key] = { count: 1, resetAt: now + windowSec * 1000 };
    return true;
  }
  if (entry.count >= maxLimit) {
    return false;
  }
  entry.count += 1;
  return true;
}

// Generate JWT token
export function signUserToken(user: { id: string; mobile: string; name: string; language: string }): string {
  return jwt.sign(
    {
      sub: user.id,
      mobile: user.mobile,
      name: user.name,
      language: user.language,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Extract user from request cookies or Authorization header
export function authenticateRequest(req: Request): { id: string; mobile: string; name: string; language: string } | null {
  const token = req.cookies?.[COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.sub,
      mobile: decoded.mobile,
      name: decoded.name,
      language: decoded.language,
    };
  } catch {
    return null;
  }
}

// Set auth cookie
function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  });
}

// --- Controller Handlers ---

export async function handleSendOtp(req: Request, res: Response) {
  try {
    const ip = req.ip || 'ip';
    if (!checkRateLimit(`send_otp_${ip}`, 8, 60)) {
      return res.status(429).json({ error: 'Too many OTP requests. Please wait a minute.' });
    }

    const parsed = SendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const { mobile, intent } = parsed.data;

    // Check existing registration
    const existingUser = await Database.findUserByMobile(mobile);
    if (intent === 'register' && existingUser) {
      return res.status(409).json({
        error: 'An account already exists with this mobile number. Please log in.',
        userExists: true,
      });
    }

    // Generate secure 6-digit numeric OTP
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await Database.saveOtp(mobile, randomOtp);
    if (!result.success) {
      return res.status(429).json({ error: result.message });
    }

    // Dispatch SMS via TextBee SMS Gateway
    const smsResult = await sendOtpViaTextBee(mobile, randomOtp);

    return res.json({
      success: true,
      message: `OTP sent successfully to +91-${mobile}. (Valid for 5 minutes)`,
      expiresInSec: result.otpExpiresInSec,
      demoOtp: result.demoOtp, // Provided for instant UI testability & verification
      deliveredViaTextBee: smsResult.deliveredViaTextBee,
    });
  } catch (err: any) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ error: 'Internal server error while sending OTP' });
  }
}

export async function handleVerifyOtp(req: Request, res: Response) {
  try {
    const parsed = VerifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const { mobile, otp } = parsed.data;
    const result = await Database.verifyOtp(mobile, otp);

    if (!result.valid) {
      return res.status(400).json({ error: result.message || 'Invalid OTP code' });
    }

    return res.json({
      success: true,
      message: 'OTP verified successfully.',
    });
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: 'Internal server error while verifying OTP' });
  }
}

export async function handleRegister(req: Request, res: Response) {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const { mobile, name, pin, language } = parsed.data;

    // Check if user already exists
    const existing = await Database.findUserByMobile(mobile);
    if (existing) {
      return res.status(409).json({ error: 'Mobile number already registered. Please login.' });
    }

    const newUser = await Database.createUser({
      mobile,
      name: name.trim(),
      pin,
      language: language || 'hi',
    });

    const token = signUserToken(newUser);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to KrishiVaani.',
      user: {
        id: newUser.id,
        mobile: newUser.mobile,
        name: newUser.name,
        language: newUser.language,
        state: newUser.state,
        district: newUser.district,
        primaryCrop: newUser.primaryCrop,
      },
      token,
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const ip = req.ip || 'ip';
    if (!checkRateLimit(`login_${ip}`, 10, 60)) {
      return res.status(429).json({ error: 'Too many login attempts. Please wait a minute.' });
    }

    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const { mobile, pin } = parsed.data;

    // Check lockout
    const lockout = await Database.checkLockout(mobile);
    if (lockout.isLocked) {
      return res.status(423).json({
        error: `Account temporarily locked due to repeated failed logins. Please try again in ${Math.ceil(lockout.remainingSec / 60)} minutes.`,
      });
    }

    const user = await Database.findUserByMobile(mobile);
    if (!user) {
      await Database.recordFailedLogin(mobile);
      return res.status(401).json({ error: 'Mobile number not found. Please register first.' });
    }

    const pinValid = Database.verifyPin(pin, user.pinHash);
    if (!pinValid) {
      const lockRes = await Database.recordFailedLogin(mobile);
      if (lockRes.isLocked) {
        return res.status(423).json({
          error: 'Account locked for 15 minutes due to 5 consecutive incorrect PIN entries.',
        });
      }
      return res.status(401).json({ error: 'Incorrect 6-digit PIN. Please try again.' });
    }

    // Success
    await Database.recordSuccessfulLogin(mobile);
    const token = signUserToken(user);
    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        language: user.language,
        state: user.state,
        district: user.district,
        primaryCrop: user.primaryCrop,
      },
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function handleLogout(req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return res.json({ success: true, message: 'Logged out successfully.' });
}

export async function handleMe(req: Request, res: Response) {
  const session = authenticateRequest(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = (await Database.findUserById(session.id)) || (await Database.findUserByMobile(session.mobile));
  if (!user) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  return res.json({
    user: {
      id: user.id,
      mobile: user.mobile,
      name: user.name,
      language: user.language,
      state: user.state,
      district: user.district,
      primaryCrop: user.primaryCrop,
    },
  });
}
