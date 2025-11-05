import { z } from 'zod'
import { init } from '@paralleldrive/cuid2'
import { eq } from 'drizzle-orm'
import { invalidInput, conflict as errConflict, badRequest, internal } from '~~/server/utils/httpErrors'


const createId = init({ length: 10 })

const registerSchema = z.object({
  email: z.email('Le format de l\'email est invalide'),
  name: z.string('Le nom est requis').min(3, 'Le nom doit contenir au moins 3 caractères'),
  password: z.string('Le mot de passe est requis').min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export default defineEventHandler(async (event) => {
  try {
    const db = useDb(event)
    const body = registerSchema.parse(await readBody(event))
    const hashedPassword = await hashPassword(body.password)

    // On tente quelques fois au cas où l'identifiant public généré collisionne
    const MAX_ID_RETRIES = 3
    for (let attempt = 0; attempt < MAX_ID_RETRIES; attempt++) {
      const publicId = createId()
      // Utiliser onConflictDoNothing sur public_id pour éviter l'exception, puis vérifier l'insertion
      try {
        await db
          .insert(t.users)
          .values({ publicId, email: body.email, name: body.name, password: hashedPassword })
          .onConflictDoNothing({ target: t.users.publicId })
          .run()
      } catch (err) {
        const info = parseDbError(err)
        if (info.kind === 'unique') {
          if (info.column === 'email') throw errConflict('Email déjà utilisé', 'email')
          if (info.column === 'name') throw errConflict('Nom d\'utilisateur déjà utilisé', 'name')
        }
        if (info.kind === 'not_null') throw badRequest(`Le champ ${info.column} est obligatoire`)
        if (info.kind === 'foreign_key') throw badRequest('Référence étrangère invalide')
        throw err
      }

      // Vérifier si l'insertion a effectivement eu lieu (si public_id a collisionné, l'insert a été "doNothing")
      const inserted = await db
        .select({ id: t.users.id })
        .from(t.users)
        .where(eq(t.users.email, body.email))
        .get()

      if (inserted) {
        return { ok: true, user: { publicId, email: body.email, name: body.name } }
      }
      // sinon → on retente avec un nouvel ID
    }

    // Ne devrait pas arriver, mais on sécurise
    throw internal('Impossible de générer un identifiant unique')
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw invalidInput(error.issues)
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error // Re-throw known errors
    }

    // Erreur générique
    console.error('Unexpected error during registration:', error)
    throw internal()
  }
})