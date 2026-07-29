import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import userRoutes from './routes/user.routes.js';
import profileRoutes from './routes/profile.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// Render/Vercel colocan un proxy delante: sin esto express-rate-limit ve
// siempre la misma IP y limitaria a todos los usuarios en conjunto.
app.set('trust proxy', 1);

const allowedOrigins = new Set([
  ...env.frontendUrls,
  'http://127.0.0.1:5173',
  'http://localhost:5173'
]);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Sin Origin: health checks, curl o apps nativas.
    if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }

    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '1mb' }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas peticiones. Intenta de nuevo en unos minutos.' }
}));

// El login necesita un limite mucho mas estricto para frenar fuerza bruta.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Demasiados intentos de inicio de sesion. Espera 15 minutos.' }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
