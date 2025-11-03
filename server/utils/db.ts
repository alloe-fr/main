import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../database/schema';

export const t = schema;

export const useDb = (event: any) => {
  // Cloudflare Workers → binding "DB" déclaré dans wrangler.jsonc
  const db = drizzle(event.context.cloudflare.env.DB, { schema });
  return db;
};