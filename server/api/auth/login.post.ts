import { z } from 'zod';
import { eq, lt, gte, ne, or } from 'drizzle-orm';
import { invalidInput, internal } from '~~/server/utils/httpErrors';

export default defineEventHandler(async (event) => {
    try {
        const schema = z
            .object({
                email: z.email("Le format de l'email est invalide").optional(),
                name: z.string().min(3, "Le nom est requis").optional(),
                password: z.string("Le mot de passe est requis").min(8, "Le mot de passe doit contenir au moins 8 caractères"),
            })
            .refine(
                (data) => data.email || data.name, // au moins un des deux
                {
                    message: "Vous devez renseigner un email ou un nom d'utilisateur",
                    path: ['email'],
                }
            )

        const body = schema.parse(await readBody(event));
        const db = useDb(event);

        const result = await db.select().from(t.users).where(
            or(
                eq(t.users.email, body.email ?? '-1'),
                eq(t.users.name, body.name ?? '-1')
            )
        ).get();

        if (!result) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Erreur : utilisateur introuvable.',
            });
        }
        if (await verifyPassword(result.password, body.password)) {
            await replaceUserSession(event, {
                user: {
                    name: result.name,
                },
                secure: {
                    id: result.id,
                    email: result.email,
                },
            });
        } else throw createError({
            statusCode: 401,
            statusMessage: 'Erreur : mot de passe incorrect.',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw invalidInput(error.issues);
        }

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error; // Re-throw known errors
        }

        // Erreur générique
        console.error('Unexpected error:', error);
        throw internal();
    }
});