import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

export const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DATABASE_SSL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  frontendUrls: (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean)
};

const missing = ['databaseUrl', 'jwtSecret'].filter((key) => !env[key]);

if (missing.length > 0) {
  throw new Error(`Faltan variables de entorno obligatorias: ${missing.join(', ')}. Revisa backend/.env.example`);
}

if (env.isProduction && env.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres en produccion');
}

if (!env.isProduction && env.jwtSecret.length < 32) {
  console.warn('[env] JWT_SECRET es corto. Usa al menos 32 caracteres antes de publicar.');
}
