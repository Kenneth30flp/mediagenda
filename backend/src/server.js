import app from './app.js';
import { env } from './config/env.js';
import { closePool } from './config/db.js';

const server = app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port} (${env.nodeEnv})`);
});

async function shutdown(signal) {
  console.log(`[server] ${signal} recibido, cerrando conexiones...`);

  server.close(async () => {
    try {
      await closePool();
    } catch (error) {
      console.error('[server] Error al cerrar el pool:', error.message);
    }

    process.exit(0);
  });

  // Si algo queda colgado, forzamos la salida.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[server] Promesa no manejada:', reason);
});
