import pg from 'pg';
import { env } from './env.js';

// Los proveedores gestionados (Neon, Supabase, Render) exigen TLS y en varios
// casos presentan certificados que Node no puede validar contra su CA local.
function resolveSsl() {
  if (env.databaseSsl === 'false') return false;
  if (env.databaseSsl === 'true') return { rejectUnauthorized: false };

  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(env.databaseUrl);
  return isLocal ? false : { rejectUnauthorized: false };
}

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: resolveSsl(),
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000
});

// Sin este listener, un error en una conexion inactiva (muy comun cuando el
// proveedor cierra conexiones ociosas) tumba todo el proceso de Node.
pool.on('error', (error) => {
  console.error('[db] Error en conexion inactiva del pool:', error.message);
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function closePool() {
  await pool.end();
}
