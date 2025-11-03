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
  createdAt: integer('created_at', { mode: 'timestamp' }).$default(() => new Date()),
});