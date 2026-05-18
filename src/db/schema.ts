import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const raffles = pgTable('raffles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  prizeImageUrl: text('prize_image_url').notNull(),
  images: text('images'),
  totalTickets: integer('total_tickets').notNull(),
  ticketPrice: integer('ticket_price').notNull(),
  status: text('status').notNull(),
  instructions: text('instructions').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const reservations = pgTable('reservations', {
  id: text('id').primaryKey(),
  folio: text('folio').notNull(),
  raffleId: text('raffle_id').notNull().references(() => raffles.id),
  purchaserName: text('purchaser_name').notNull(),
  phone: text('phone').notNull(),
  city: text('city').notNull(),
  ticketNumbers: jsonb('ticket_numbers').$type<number[]>().notNull(),
  totalAmount: integer('total_amount').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const settings = pgTable('settings', {
  id: text('id').primaryKey(),
  adminWhatsApp: text('admin_whatsapp').notNull(),
  bankInfo: text('bank_info').notNull(),
  systemName: text('system_name').notNull().default('RifasPremium'),
  aboutUs: text('about_us').default(''),
  address: text('address').default(''),
  contactPhone: text('contact_phone').default(''),
  contactEmail: text('contact_email').default(''),
  facebookUrl: text('facebook_url').default(''),
  instagramUrl: text('instagram_url').default(''),
});
