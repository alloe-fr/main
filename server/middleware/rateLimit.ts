// Rate limiting pour éviter les attaques par force brute
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

export default defineEventHandler(async (event) => {
    const path = event.path

    // Appliquer uniquement sur /api/login
    if (!path.includes('/api/login')) {
        return
    }

    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const now = Date.now()
    const maxAttempts = 5
    const windowMs = 15 * 60 * 1000 // 15 minutes

    const attempt = loginAttempts.get(ip)

    if (attempt) {
        if (now < attempt.resetAt) {
            if (attempt.count >= maxAttempts) {
                throw createError({
                    statusCode: 429,
                    statusMessage: 'Too many login attempts. Please try again later.'
                })
            }
            attempt.count++
        } else {
            // Reset window
            loginAttempts.set(ip, { count: 1, resetAt: now + windowMs })
        }
    } else {
        loginAttempts.set(ip, { count: 1, resetAt: now + windowMs })
    }

    // Nettoyage périodique
    if (Math.random() < 0.01) {
        for (const [key, value] of loginAttempts.entries()) {
            if (now > value.resetAt) {
                loginAttempts.delete(key)
            }
        }
    }
})
