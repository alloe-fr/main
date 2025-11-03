export default defineEventHandler(async (event) => {
  const db = useDb(event);
  const users = await db.select().from(t.users).all();
  return { ok: true, users };
});