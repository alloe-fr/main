import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { init } from '@paralleldrive/cuid2';

const createId = init({
  length: 10,
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  publicId: text('public_id').notNull().unique().$default(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name').notNull().unique(),
  password: text('password').notNull(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).$default(() => new Date()),
});

export const emailVerificationTokens = sqliteTable('email_verification_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  tokenHash: text('token_hash').notNull().unique(), // SHA-256 hex
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$default(() => new Date()),
});