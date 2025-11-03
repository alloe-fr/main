import { z } from 'zod'
import { init } from '@paralleldrive/cuid2'


const createId = init({ length: 10 })

const registerSchema = z.object({
  email: z.string().email('Le format de l’email est invalide'),
  name: z.string().min(1, 'Le nom est requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

let body = {} as z.infer<typeof registerSchema>
let hashedPassword: string

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  body = registerSchema.parse(await readBody(event))
  hashedPassword = await hashPassword(body.password)

  try {
    // Tentative d’insertion unique
    const publicId = createId()

    await db.insert(t.users).values({
      publicId,
      email: body.email,
      name: body.name,
      password: hashedPassword,
    }).run()

    // Succès → on renvoie le nouvel utilisateur
    return {
      ok: true,
      user: {
        publicId,
        email: body.email,
        name: body.name,
      },
    }
  }

  // Gestion des erreurs
  catch (err) {
    if (err instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Invalid input',
        data: err.flatten(),
      })
    }

    const info = parseDbError(err)
    console.error('Database error on registration:', info)

    if (info.kind === 'unique') {
      switch (info.column) {
        case 'email':
          throw createError({
            statusCode: 409,
            statusMessage: 'Conflict',
            message: 'Email déjà utilisé',
            data: { field: 'email' },
          })
        case 'name':
          throw createError({
            statusCode: 409,
            statusMessage: 'Conflict',
            message: 'Nom d’utilisateur déjà utilisé',
            data: { field: 'name' },
          })
        case 'public_id': {
          const retryId = createId()
          try {
            await db.insert(t.users).values({
              publicId: retryId,
              email: body?.email,
              name: body?.name,
              password: hashedPassword!,
            }).run()
            return {
              ok: true,
              user: { publicId: retryId, email: body?.email, name: body?.name },
            }
          } catch (retryErr) {
            console.error('Retry failed after public_id collision:', retryErr)
            throw createError({
              statusCode: 500,
              statusMessage: 'Internal Server Error',
              message: 'Impossible de générer un identifiant unique',
            })
          }
        }
      }
    }

    if (info.kind === 'not_null') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: `Le champ ${info.column} est obligatoire`,
      })
    }

    if (info.kind === 'foreign_key') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Référence étrangère invalide',
      })
    }

    // Erreur générique
    console.error('Unexpected error during registration:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Erreur interne lors de la création du compte',
    })
  }
})