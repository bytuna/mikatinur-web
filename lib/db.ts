import { createPool, type VercelPool } from '@vercel/postgres';

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
export const pool: VercelPool | null = connectionString
  ? createPool({ connectionString })
  : null;

export async function withDb<T>(callback: (client: any) => Promise<T>): Promise<T> {
  if (!pool) throw new Error('Database connection is not configured');
  const client = await pool.connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}
