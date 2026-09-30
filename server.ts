import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import {
  handleSendOtp,
  handleVerifyOtp,
  handleRegister,
  handleLogin,
  handleLogout,
  handleMe,
} from './server/auth.js';
import { handleAsr, handleTts } from './server/voice.js';
import {
  handleGetMandiRates,
  handleGetWeather,
  handleGetSchemes,
  handleCropDoctor,
  handleAskAgronomist,
} from './server/farming.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));
  app.use(cookieParser());

  // Security headers & basic anti-CSRF check
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  // Auth Endpoints
  app.post('/api/auth/send-otp', handleSendOtp);
  app.post('/api/auth/verify-otp', handleVerifyOtp);
  app.post('/api/auth/register', handleRegister);
  app.post('/api/auth/login', handleLogin);
  app.post('/api/auth/logout', handleLogout);
  app.get('/api/auth/me', handleMe);

  // Voice Endpoints
  app.post('/api/voice/asr', handleAsr);
  app.post('/api/voice/tts', handleTts);

  // Farming Domain Endpoints
  app.get('/api/farming/mandi', handleGetMandiRates);
  app.get('/api/farming/weather', handleGetWeather);
  app.get('/api/farming/schemes', handleGetSchemes);
  app.post('/api/farming/crop-doctor', handleCropDoctor);
  app.post('/api/farming/ask', handleAskAgronomist);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Client SPA mounting
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 KrishiVaani Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
