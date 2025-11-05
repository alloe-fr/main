export default defineEventHandler(async (e) => {
  await clearUserSession(e)
  return { ok: true }
})