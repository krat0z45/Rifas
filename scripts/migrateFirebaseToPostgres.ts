import fs from 'fs';
import admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function loadServiceAccount(): any {
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
  if (!fs.existsSync(path)) {
    throw new Error(`Service account JSON not found at ${path}. Set FIREBASE_SERVICE_ACCOUNT_PATH env var or place file there.`);
  }
  const raw = fs.readFileSync(path, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  // Initialize Firebase Admin
  const serviceAccount = loadServiceAccount();
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const fb = admin.firestore();

  try {
    console.log('Migrating admins...');
    const adminsSnap = await fb.collection('admins').get();
    for (const d of adminsSnap.docs) {
      const data = d.data();
      await prisma.admin.upsert({
        where: { id: d.id },
        update: {
          email: data.email || null,
          createdAt: data.createdAt ? new Date(data.createdAt) : null,
        },
        create: {
          id: d.id,
          email: data.email || null,
          createdAt: data.createdAt ? new Date(data.createdAt) : null,
        }
      });
    }

    console.log('Migrating raffles...');
    const rafflesSnap = await fb.collection('raffles').get();
    for (const d of rafflesSnap.docs) {
      const data = d.data() as any;
      await prisma.raffle.upsert({
        where: { id: d.id },
        update: {
          title: data.title || '',
          description: data.description || '',
          instructions: data.instructions || null,
          prizeImageUrl: data.prizeImageUrl || null,
          totalTickets: data.totalTickets || 0,
          ticketPrice: data.ticketPrice || 0,
          status: data.status || 'paused',
          createdAt: data.createdAt ? new Date(data.createdAt) : null,
        },
        create: {
          id: d.id,
          title: data.title || '',
          description: data.description || '',
          instructions: data.instructions || null,
          prizeImageUrl: data.prizeImageUrl || null,
          totalTickets: data.totalTickets || 0,
          ticketPrice: data.ticketPrice || 0,
          status: data.status || 'paused',
          createdAt: data.createdAt ? new Date(data.createdAt) : null,
        }
      });
    }

    console.log('Migrating reservations...');
    const reservationsSnap = await fb.collection('reservations').get();
    for (const d of reservationsSnap.docs) {
      const data = d.data() as any;

      await prisma.reservation.upsert({
        where: { id: d.id },
        update: {
          raffleId: data.raffleId,
          purchaserName: data.purchaserName || '',
          phone: data.phone || '',
          city: data.city || '',
          folio: data.folio || '',
          ticketNumbers: data.ticketNumbers || [],
          status: data.status || 'pending',
          totalAmount: data.totalAmount || 0,
          createdAt: data.createdAt ? new Date(data.createdAt) : null,
        },
        create: {
          id: d.id,
          raffleId: data.raffleId,
          purchaserName: data.purchaserName || '',
          phone: data.phone || '',
          city: data.city || '',
          folio: data.folio || '',
          ticketNumbers: data.ticketNumbers || [],
          status: data.status || 'pending',
          totalAmount: data.totalAmount || 0,
          createdAt: data.createdAt ? new Date(data.createdAt) : null,
        }
      });
    }

    console.log('Migrating settings...');
    const settingsDoc = await fb.collection('settings').doc('global').get();
    if (settingsDoc.exists) {
      const s = settingsDoc.data() as any;
      await prisma.setting.upsert({
        where: { id: 'global' },
        update: {
          adminWhatsApp: s.adminWhatsApp || null,
          bankInfo: s.bankInfo || null,
        },
        create: {
          id: 'global',
          adminWhatsApp: s.adminWhatsApp || null,
          bankInfo: s.bankInfo || null,
        }
      });
    }

    console.log('Migration complete.');
  } catch (e) {
    console.error('Migration failed', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    // firebase admin doesn't need explicit shutdown in most cases
  }
}

main();
