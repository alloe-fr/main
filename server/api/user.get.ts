import { users } from '~~/server/database/schema';

export default defineEventHandler(async (event) => {
  const body = { email: 'test@example.com', name: 'Test User' };
  const db = useDb(event);
  await db.insert(users).values({ email: body.email, name: body.name ?? null }).run();
  return { ok: true };
});