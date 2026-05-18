import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/db/schema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL || 'postgres://localhost/mydb');
const db = drizzle(sql, { schema });

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
  const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existingUser.length > 0) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await db.insert(schema.users).values({
    email,
    password: hashedPassword,
  }).returning();

  const token = jwt.sign({ id: newUser[0].id, email: newUser[0].email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: newUser[0].id, email: newUser[0].email } });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const users = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  const user = users[0];

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
  const allRaffles = await db.select().from(schema.raffles).orderBy(desc(schema.raffles.createdAt));
  res.json(allRaffles);
}));

app.get('/api/raffles/:id', asyncHandler(async (req, res) => {
  const data = await db.select().from(schema.raffles).where(eq(schema.raffles.id, req.params.id)).limit(1);
  res.json(data[0] || null);
}));

app.get('/api/raffles/:id/reservations', asyncHandler(async (req, res) => {
  const data = await db.select().from(schema.reservations).where(eq(schema.reservations.raffleId, req.params.id));
  res.json(data);
}));

app.post('/api/raffles', authenticateToken, asyncHandler(async (req, res) => {
  const newRaffle = await db.insert(schema.raffles).values({
    id: uuidv4(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
  res.json(newRaffle[0]);
}));

app.put('/api/raffles/:id', authenticateToken, asyncHandler(async (req, res) => {
  const updated = await db.update(schema.raffles)
    .set({ ...req.body, updatedAt: new Date() })
    .where(eq(schema.raffles.id, req.params.id))
    .returning();
  res.json(updated[0]);
}));

// --- RESERVATIONS ---
app.get('/api/reservations', authenticateToken, asyncHandler(async (req, res) => {
  const data = await db.select().from(schema.reservations).orderBy(desc(schema.reservations.createdAt));
  res.json(data);
}));

app.post('/api/reservations', asyncHandler(async (req, res) => {
  const newRef = await db.insert(schema.reservations).values({
    id: uuidv4(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
  res.json(newRef[0]);
}));

app.put('/api/reservations/:id/status', authenticateToken, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const updated = await db.update(schema.reservations)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.reservations.id, req.params.id))
    .returning();
  res.json(updated[0]);
}));

app.get('/api/reservations/folio/:folio', asyncHandler(async (req, res) => {
  const data = await db.select().from(schema.reservations)
    .where(eq(schema.reservations.folio, req.params.folio))
    .limit(1);
    
  if (data.length === 0) {
    return res.status(404).json({ error: 'Folio not found' });
  }

  // Also fetch raffle details so we can show them
  const raffleData = await db.select().from(schema.raffles)
    .where(eq(schema.raffles.id, data[0].raffleId))
    .limit(1);

  res.json({
    folio: data[0].folio,
    status: data[0].status,
    ticketNumbers: data[0].ticketNumbers,
    raffleId: data[0].raffleId,
    raffleTitle: raffleData[0]?.title || 'Rifa',
    totalAmount: data[0].totalAmount,
    purchaserName: data[0].purchaserName
  });
}));

// --- METRICS ---
app.get('/api/metrics', authenticateToken, asyncHandler(async (req, res) => {
  const raffles = await db.select().from(schema.raffles);
  const reservations = await db.select().from(schema.reservations);
  
  const totalRaffles = raffles.length;
  const activeRaffles = raffles.filter(r => r.status === 'active').length;
  
  const approvedReservations = reservations.filter(r => r.status === 'approved');
  const totalRevenue = approvedReservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalTicketsSold = approvedReservations.reduce((sum, r) => sum + r.ticketNumbers.length, 0);
  
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
  let settingsDb = await db.select().from(schema.settings).where(eq(schema.settings.id, 'global')).limit(1);
  if (settingsDb.length === 0) {
    settingsDb = await db.insert(schema.settings).values({ id: 'global', adminWhatsApp: '', bankInfo: '[]', systemName: 'RifasPremium', aboutUs: '', address: '', contactPhone: '', contactEmail: '', facebookUrl: '', instagramUrl: '' }).returning();
  }
  res.json(settingsDb[0]);
}));

app.put('/api/settings', authenticateToken, asyncHandler(async (req, res) => {
  console.log('PUT /api/settings req.body:', req.body);
  const updated = await db.update(schema.settings)
    .set(req.body)
    .where(eq(schema.settings.id, 'global'))
    .returning();
  console.log('PUT /api/settings updated:', updated);
  res.json(updated[0]);
}));

// --- USERS ---
app.get('/api/users', authenticateToken, asyncHandler(async (req, res) => {
  const data = await db.select({ id: schema.users.id, email: schema.users.email, createdAt: schema.users.createdAt }).from(schema.users);
  res.json(data);
}));

app.post('/api/users', authenticateToken, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const newRef = await db.insert(schema.users).values({
    email,
    password, // In a real app we would hash this
    createdAt: new Date(),
  }).returning({ id: schema.users.id, email: schema.users.email });
  res.json(newRef[0]);
}));

app.delete('/api/users/:id', authenticateToken, asyncHandler(async (req, res) => {
  await db.delete(schema.users).where(eq(schema.users.id, parseInt(req.params.id)));
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
