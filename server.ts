import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Middleware to verify JWT token
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

// Error wrapper
const asyncHandler = (fn: express.RequestHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req as any, res as any, next)).catch(next);
};

// --- AUTH MOCK / NEON ROUTES ---
app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { email, password: hashedPassword }
  });

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: newUser.id, email: newUser.email } });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email } });
}));

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: (req as any).user });
});

// --- RAFFLES ---
app.get('/api/raffles', asyncHandler(async (req, res) => {
  const allRaffles = await prisma.raffle.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(allRaffles);
}));

app.get('/api/raffles/:id', asyncHandler(async (req, res) => {
  const data = await prisma.raffle.findUnique({ where: { id: req.params.id } });
  res.json(data || null);
}));

app.get('/api/raffles/:id/reservations', asyncHandler(async (req, res) => {
  const data = await prisma.reservation.findMany({ where: { raffleId: req.params.id } });
  res.json(data);
}));

app.post('/api/raffles', authenticateToken, asyncHandler(async (req, res) => {
  const newRaffle = await prisma.raffle.create({
    data: {
      ...req.body,
      id: uuidv4(),
    }
  });
  res.json(newRaffle);
}));

app.put('/api/raffles/:id', authenticateToken, asyncHandler(async (req, res) => {
  const updated = await prisma.raffle.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(updated);
}));

// --- RESERVATIONS ---
app.get('/api/reservations', authenticateToken, asyncHandler(async (req, res) => {
  const data = await prisma.reservation.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(data);
}));

app.post('/api/reservations', asyncHandler(async (req, res) => {
  const newRef = await prisma.reservation.create({
    data: {
      ...req.body,
      id: uuidv4(),
    }
  });
  res.json(newRef);
}));

app.put('/api/reservations/:id/status', authenticateToken, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const updated = await prisma.reservation.update({
    where: { id: req.params.id },
    data: { status }
  });
  res.json(updated);
}));

app.get('/api/reservations/folio/:folio', asyncHandler(async (req, res) => {
  const data = await prisma.reservation.findFirst({
    where: { folio: req.params.folio }
  });
    
  if (!data) {
    return res.status(404).json({ error: 'Folio not found' });
  }

  // Also fetch raffle details so we can show them
  const raffleData = await prisma.raffle.findUnique({
    where: { id: data.raffleId }
  });

  res.json({
    folio: data.folio,
    status: data.status,
    ticketNumbers: data.ticketNumbers,
    raffleId: data.raffleId,
    raffleTitle: raffleData?.title || 'Rifa',
    totalAmount: data.totalAmount,
    purchaserName: data.purchaserName
  });
}));

// --- METRICS ---
app.get('/api/metrics', authenticateToken, asyncHandler(async (req, res) => {
  const raffles = await prisma.raffle.findMany();
  const reservations = await prisma.reservation.findMany();
  
  const totalRaffles = raffles.length;
  const activeRaffles = raffles.filter(r => r.status === 'active').length;
  
  const approvedReservations = reservations.filter(r => r.status === 'approved');
  const totalRevenue = approvedReservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalTicketsSold = approvedReservations.reduce((sum, r) => sum + (Array.isArray(r.ticketNumbers) ? r.ticketNumbers.length : 0), 0);
  
  // Sales over time (by month/day etc) simple group by status
  const salesByStatus = [
    { name: 'Aprobados', value: approvedReservations.length },
    { name: 'Pendientes', value: reservations.filter(r => r.status === 'pending').length },
    { name: 'Rechazados', value: reservations.filter(r => r.status === 'rejected').length },
  ];

  res.json({
    totalRaffles,
    activeRaffles,
    totalRevenue,
    totalTicketsSold,
    salesByStatus,
    recentReservations: reservations.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  });
}));

// --- SETTINGS ---
app.get('/api/settings', asyncHandler(async (req, res) => {
  let settingsDb = await prisma.setting.findUnique({ where: { id: 'global' } });
  if (!settingsDb) {
    settingsDb = await prisma.setting.create({
      data: { id: 'global', adminWhatsApp: '', bankInfo: '[]', systemName: 'RifasPremium', aboutUs: '', address: '', contactPhone: '', contactEmail: '', facebookUrl: '', instagramUrl: '' }
    });
  }
  res.json(settingsDb);
}));

app.put('/api/settings', authenticateToken, asyncHandler(async (req, res) => {
  console.log('PUT /api/settings req.body:', req.body);
  const updated = await prisma.setting.update({
    where: { id: 'global' },
    data: req.body
  });
  console.log('PUT /api/settings updated:', updated);
  res.json(updated);
}));

// --- USERS ---
app.get('/api/users', authenticateToken, asyncHandler(async (req, res) => {
  const data = await prisma.user.findMany({ select: { id: true, email: true, createdAt: true } });
  res.json(data);
}));

app.post('/api/users', authenticateToken, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const newRef = await prisma.user.create({
    data: {
      email,
      password, // In a real app we would hash this
    },
    select: { id: true, email: true }
  });
  res.json(newRef);
}));

app.delete('/api/users/:id', authenticateToken, asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
}));

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (!process.env.VERCEL) {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

startServer();

export default app;
