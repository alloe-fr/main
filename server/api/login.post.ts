import { z } from 'zod';
import { eq, lt, gte, ne, or } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const schema = z
            .object({
                email: z.string().email("Le format de l'email est invalide").optional(),
                name: z.string().min(1, "Le nom est requis").optional(),
                password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
            })
            .refine(
                (data) => data.email || data.name, // au moins un des deux
                {
                    message: "Vous devez renseigner un email ou un nom d'utilisateur",
                    path: ['email'], // tu peux choisir où placer l'erreur
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
                statusCode: 404,
                message: 'User not found',
            });
        }
        if (await verifyPassword(result.password, body.password)) {
            await replaceUserSession(event, {
                user: {
                    login: result.name,
                },
                // Private data accessible only on server/ routes
                secure: {
                    id: result.id,
                    email: result.email,
                },
            });
            return sendRedirect(event, '/');
        }
    } catch (error) {
        // Erreur de validation Zod
        if (error instanceof z.ZodError) {
            throw createError({
                statusCode: 400,
                message: 'Invalid input',
                data: error.issues,
            });
        }

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error; // Re-throw known errors
        }

        // Erreur générique
        console.error('Unexpected error:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to create user',
        });
    }
});