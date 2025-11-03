export default defineEventHandler(async (e) => {
  const db = e.context.cloudflare.env.DB // <- nom de ton binding D1
  if (!db) {
    throw createError({ statusCode: 500, statusMessage: 'Missing D1 binding DB' })
  }
  // évite un nom de table réservé comme "table"
  const { results } = await db.prepare('SELECT * FROM users').all()

  await setUserSession(e, {
    user: {
      login: results[0].name,
    },
    // Private data accessible only on server/ routes
    secure: {
      apiToken: '1234567890'
    },
    loggedInAt: new Date()
  })

  return results
})