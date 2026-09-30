import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { MongoClient, Db, Collection } from 'mongodb';

export interface User {
  id: string;
  mobile: string;
  name: string;
  pinHash: string;
  language: string;
  state?: string;
  district?: string;
  primaryCrop?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OtpRecord {
  mobile: string;
  codeHash: string;
  expiresAt: number; // timestamp ms
  attempts: number;
  resendCount: number;
  lastSentAt: number;
}

export interface LockoutRecord {
  mobile: string;
  failedLoginAttempts: number;
  lockedUntil: number | null;
}

interface DatabaseSchema {
  users: Record<string, User>; // key is mobile
  otps: Record<string, OtpRecord>; // key is mobile
  lockouts: Record<string, LockoutRecord>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadLocalDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading db.json, creating fresh state', err);
  }

  const salt = bcrypt.genSaltSync(10);
  const samplePinHash = bcrypt.hashSync('123456', salt);
  const defaultUser: User = {
    id: 'farmer-demo-01',
    mobile: '9876543210',
    name: 'Ramesh Patel (रमेश पटेल)',
    pinHash: samplePinHash,
    language: 'hi',
    state: 'Madhya Pradesh',
    district: 'Indore',
    primaryCrop: 'Wheat (गेहूं)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const initial: DatabaseSchema = {
    users: {
      '9876543210': defaultUser,
    },
    otps: {},
    lockouts: {},
  };

  saveLocalDb(initial);
  return initial;
}

function saveLocalDb(localDb: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json', err);
  }
}

// In-memory reference synced to file as fallback
let localDb: DatabaseSchema = loadLocalDb();

// MongoDB Client & State
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnected = false;

export async function initDatabase(): Promise<boolean> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || (!dbUrl.startsWith('mongodb://') && !dbUrl.startsWith('mongodb+srv://'))) {
    console.log('[Database] Using local file-persisted store (db.json)');
    return false;
  }

  try {
    console.log('[Database] Connecting to MongoDB...');
    mongoClient = new MongoClient(dbUrl, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    isMongoConnected = true;
    console.log(`[Database] MongoDB connected successfully to database: ${mongoDb.databaseName}`);

    // Ensure collections and unique indexes
    const usersCol = mongoDb.collection('users');
    const otpsCol = mongoDb.collection('otps');
    await usersCol.createIndex({ mobile: 1 }, { unique: true }).catch(() => {});
    await otpsCol.createIndex({ mobile: 1 }, { unique: true }).catch(() => {});

    // Seed sample farmer if users collection is empty
    const count = await usersCol.countDocuments();
    if (count === 0 && localDb.users['9876543210']) {
      await usersCol.insertOne({
        ...localDb.users['9876543210'],
        _id: 'farmer-demo-01' as any,
      }).catch(() => {});
    }

    return true;
  } catch (err: any) {
    console.warn(`[Database] MongoDB connection error (${err.message}). Falling back to local file database.`);
    isMongoConnected = false;
    return false;
  }
}

// Immediately attempt connection on module load
initDatabase().catch(() => {});

export const Database = {
  async findUserByMobile(mobile: string): Promise<User | null> {
    if (isMongoConnected && mongoDb) {
      try {
        const doc = await mongoDb.collection('users').findOne({ mobile });
        if (doc) {
          return {
            id: (doc._id?.toString() || doc.id) as string,
            mobile: doc.mobile,
            name: doc.name,
            pinHash: doc.pinHash,
            language: doc.language || 'hi',
            state: doc.state,
            district: doc.district,
            primaryCrop: doc.primaryCrop,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          };
        }
      } catch (err) {
        console.warn('Mongo findUserByMobile error, checking fallback:', err);
      }
    }
    return localDb.users[mobile] || null;
  },

  async findUserById(id: string): Promise<User | null> {
    if (isMongoConnected && mongoDb) {
      try {
        const usersCol = mongoDb.collection('users');
        const doc = await usersCol.findOne({
          $or: [{ _id: id as any }, { id }],
        });
        if (doc) {
          return {
            id: (doc._id?.toString() || doc.id) as string,
            mobile: doc.mobile,
            name: doc.name,
            pinHash: doc.pinHash,
            language: doc.language || 'hi',
            state: doc.state,
            district: doc.district,
            primaryCrop: doc.primaryCrop,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          };
        }
      } catch (err) {
        console.warn('Mongo findUserById error:', err);
      }
    }
    return Object.values(localDb.users).find((u) => u.id === id) || null;
  },

  async createUser(user: { mobile: string; name: string; pin: string; language?: string }): Promise<User> {
    const salt = bcrypt.genSaltSync(10);
    const pinHash = bcrypt.hashSync(user.pin, salt);
    const id = 'farmer_' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const newUser: User = {
      id,
      mobile: user.mobile,
      name: user.name,
      pinHash,
      language: user.language || 'hi',
      state: 'Madhya Pradesh',
      district: 'Sehore',
      primaryCrop: 'Wheat',
      createdAt: now,
      updatedAt: now,
    };

    if (isMongoConnected && mongoDb) {
      try {
        await mongoDb.collection('users').insertOne({
          _id: id as any,
          ...newUser,
        });
      } catch (err) {
        console.warn('Mongo createUser error, falling back:', err);
      }
    }

    localDb.users[user.mobile] = newUser;
    saveLocalDb(localDb);
    return newUser;
  },

  async updateUserLanguage(mobile: string, language: string): Promise<User | null> {
    const now = new Date().toISOString();
    if (isMongoConnected && mongoDb) {
      try {
        await mongoDb.collection('users').updateOne(
          { mobile },
          { $set: { language, updatedAt: now } }
        );
      } catch (err) {
        console.warn('Mongo updateUserLanguage error:', err);
      }
    }

    const user = localDb.users[mobile];
    if (user) {
      user.language = language;
      user.updatedAt = now;
      saveLocalDb(localDb);
      return user;
    }
    return null;
  },

  verifyPin(pin: string, pinHash: string): boolean {
    return bcrypt.compareSync(pin, pinHash);
  },

  // OTP Management
  async saveOtp(mobile: string, otpCode: string): Promise<{ success: boolean; message?: string; otpExpiresInSec: number; demoOtp?: string }> {
    const now = Date.now();
    let existing: OtpRecord | null = null;

    if (isMongoConnected && mongoDb) {
      try {
        const doc = await mongoDb.collection('otps').findOne({ mobile });
        if (doc) existing = doc as any;
      } catch {}
    }
    if (!existing) existing = localDb.otps[mobile] || null;

    // Check resend limits: max 3 resends within 10 minutes
    if (existing && existing.resendCount >= 3 && now - existing.lastSentAt < 10 * 60 * 1000) {
      return {
        success: false,
        message: 'Maximum OTP resend limit reached (3 attempts). Please wait 10 minutes.',
        otpExpiresInSec: 0,
      };
    }

    const salt = bcrypt.genSaltSync(10);
    const codeHash = bcrypt.hashSync(otpCode, salt);
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity
    const otpRecord: OtpRecord = {
      mobile,
      codeHash,
      expiresAt,
      attempts: 0,
      resendCount: existing ? existing.resendCount + 1 : 1,
      lastSentAt: now,
    };

    if (isMongoConnected && mongoDb) {
      try {
        await mongoDb.collection('otps').updateOne(
          { mobile },
          { $set: otpRecord },
          { upsert: true }
        );
      } catch (err) {
        console.warn('Mongo saveOtp error:', err);
      }
    }

    localDb.otps[mobile] = otpRecord;
    saveLocalDb(localDb);

    return {
      success: true,
      otpExpiresInSec: 300,
      demoOtp: otpCode,
    };
  },

  async verifyOtp(mobile: string, enteredCode: string): Promise<{ valid: boolean; message?: string; locked?: boolean }> {
    const now = Date.now();
    let otp: OtpRecord | null = null;

    if (isMongoConnected && mongoDb) {
      try {
        const doc = await mongoDb.collection('otps').findOne({ mobile });
        if (doc) otp = doc as any;
      } catch {}
    }
    if (!otp) otp = localDb.otps[mobile] || null;

    if (!otp) {
      return { valid: false, message: 'No OTP requested for this mobile number.' };
    }

    if (now > otp.expiresAt) {
      if (isMongoConnected && mongoDb) {
        await mongoDb.collection('otps').deleteOne({ mobile }).catch(() => {});
      }
      delete localDb.otps[mobile];
      saveLocalDb(localDb);
      return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (otp.attempts >= 5) {
      if (isMongoConnected && mongoDb) {
        await mongoDb.collection('otps').deleteOne({ mobile }).catch(() => {});
      }
      delete localDb.otps[mobile];
      saveLocalDb(localDb);
      return {
        valid: false,
        locked: true,
        message: 'Maximum wrong OTP attempts exceeded (5). Please request a new OTP.',
      };
    }

    const matches = bcrypt.compareSync(enteredCode, otp.codeHash);
    if (!matches) {
      otp.attempts += 1;
      if (isMongoConnected && mongoDb) {
        await mongoDb.collection('otps').updateOne({ mobile }, { $inc: { attempts: 1 } }).catch(() => {});
      }
      saveLocalDb(localDb);
      const remaining = 5 - otp.attempts;
      return {
        valid: false,
        message: `Incorrect OTP. ${remaining} attempts remaining.`,
      };
    }

    // Success: Clear used OTP
    if (isMongoConnected && mongoDb) {
      await mongoDb.collection('otps').deleteOne({ mobile }).catch(() => {});
    }
    delete localDb.otps[mobile];
    saveLocalDb(localDb);
    return { valid: true };
  },

  // Lockout check
  async checkLockout(mobile: string): Promise<{ isLocked: boolean; remainingSec: number }> {
    let lock: LockoutRecord | null = null;
    if (isMongoConnected && mongoDb) {
      try {
        const doc = await mongoDb.collection('lockouts').findOne({ mobile });
        if (doc) lock = doc as any;
      } catch {}
    }
    if (!lock) lock = localDb.lockouts[mobile] || null;

    if (!lock || !lock.lockedUntil) return { isLocked: false, remainingSec: 0 };
    const now = Date.now();
    if (now < lock.lockedUntil) {
      return { isLocked: true, remainingSec: Math.ceil((lock.lockedUntil - now) / 1000) };
    }

    if (isMongoConnected && mongoDb) {
      await mongoDb.collection('lockouts').deleteOne({ mobile }).catch(() => {});
    }
    delete localDb.lockouts[mobile];
    saveLocalDb(localDb);
    return { isLocked: false, remainingSec: 0 };
  },

  async recordFailedLogin(mobile: string): Promise<{ isLocked: boolean; remainingSec: number }> {
    const now = Date.now();
    let lock = localDb.lockouts[mobile] || { mobile, failedLoginAttempts: 0, lockedUntil: null };
    lock.failedLoginAttempts += 1;

    let isLocked = false;
    let remainingSec = 0;

    if (lock.failedLoginAttempts >= 5) {
      lock.lockedUntil = now + 15 * 60 * 1000; // 15 mins
      lock.failedLoginAttempts = 0;
      isLocked = true;
      remainingSec = 15 * 60;
    }

    if (isMongoConnected && mongoDb) {
      try {
        await mongoDb.collection('lockouts').updateOne(
          { mobile },
          { $set: lock },
          { upsert: true }
        );
      } catch {}
    }

    localDb.lockouts[mobile] = lock;
    saveLocalDb(localDb);
    return { isLocked, remainingSec };
  },

  async recordSuccessfulLogin(mobile: string) {
    if (isMongoConnected && mongoDb) {
      await mongoDb.collection('lockouts').deleteOne({ mobile }).catch(() => {});
    }
    if (localDb.lockouts[mobile]) {
      delete localDb.lockouts[mobile];
      saveLocalDb(localDb);
    }
  },
};
