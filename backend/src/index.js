import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

import instellingenRoutes from './routes/instellingen.js';
import klantenRoutes from './routes/klanten.js';
import templatesRoutes from './routes/templates.js';
import feestverzoekRoutes from './routes/feestverzoeken.js';
import factuurRoutes from './routes/facturen.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const SESSION_SECRET = process.env.SESSION_SECRET || 'spanino-geheim';

const isProduction = process.env.NODE_ENV === 'production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.set('trust proxy', 1);
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Statische bestanden voor uploads (logo)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Logo upload configuratie
const opslag = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, 'logo' + path.extname(file.originalname)),
});
const upload = multer({ storage: opslag, limits: { fileSize: 2 * 1024 * 1024 } });

// Authenticatie middleware
function vereistLogin(req, res, next) {
  if (req.session && req.session.ingelogd) return next();
  res.status(401).json({ fout: 'Niet ingelogd' });
}

// Login routes (geen auth vereist)
app.post('/api/login', async (req, res) => {
  const { wachtwoord } = req.body;
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const instelling = await prisma.instelling.findUnique({ where: { sleutel: 'beheer_wachtwoord' } });
  await prisma.$disconnect();

  const juistWachtwoord = instelling ? instelling.waarde : 'spanino2026';
  if (wachtwoord === juistWachtwoord) {
    req.session.ingelogd = true;
    res.json({ succes: true });
  } else {
    res.status(401).json({ fout: 'Verkeerd wachtwoord' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ succes: true });
});

app.get('/api/auth-status', (req, res) => {
  res.json({ ingelogd: !!(req.session && req.session.ingelogd) });
});

// Logo upload route
app.post('/api/logo', vereistLogin, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ fout: 'Geen bestand ontvangen' });
    const logoPad = req.file.path;
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.instelling.upsert({
      where: { sleutel: 'logo_pad' },
      update: { waarde: logoPad },
      create: { sleutel: 'logo_pad', waarde: logoPad },
    });
    await prisma.$disconnect();
    res.json({ succes: true, pad: `/uploads/${req.file.filename}` });
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// API routes (met auth)
app.use('/api/instellingen', vereistLogin, instellingenRoutes);
app.use('/api/klanten', vereistLogin, klantenRoutes);
app.use('/api/templates', vereistLogin, templatesRoutes);
app.use('/api/feestverzoeken', vereistLogin, feestverzoekRoutes);
app.use('/api/facturen', vereistLogin, factuurRoutes);

app.listen(PORT, () => {
  console.log(`Spanino Pizza backend draait op http://localhost:${PORT}`);
});
