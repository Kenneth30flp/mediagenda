import { env } from '../config/env.js';

// Constraint -> mensaje entendible para el usuario final.
const uniqueMessages = {
  appointments_doctor_time_unique: 'Ese doctor ya tiene una cita agendada en esa fecha y hora',
  users_email_key: 'Ya existe un empleado registrado con ese correo',
  patients_email_key: 'Ya existe un paciente registrado con ese correo',
  patients_document_id_key: 'Ya existe un paciente registrado con ese documento',
  doctors_email_key: 'Ya existe un doctor registrado con ese correo',
  doctors_medical_license_key: 'Ya existe un doctor registrado con esa licencia medica'
};

export function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Recurso no encontrado' });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (error.name === 'ZodError') {
    const issues = error.issues || error.errors || [];
    return res.status(400).json({
      message: issues[0]?.message || 'Datos invalidos',
      errors: issues.map((issue) => ({ field: issue.path?.join('.') || '', message: issue.message }))
    });
  }

  // JSON malformado en el body.
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo de la peticion no es un JSON valido' });
  }

  if (error.message?.startsWith('Origen no permitido por CORS')) {
    return res.status(403).json({ message: 'Origen no autorizado' });
  }

  if (error.code === '23505') {
    return res.status(409).json({
      message: uniqueMessages[error.constraint] || 'Ya existe un registro con esos datos unicos'
    });
  }

  if (error.code === '23503') {
    return res.status(400).json({ message: 'El paciente o doctor seleccionado no existe' });
  }

  if (error.code === '23514') {
    return res.status(400).json({ message: 'Alguno de los valores enviados no es permitido' });
  }

  // invalid_text_representation: por ejemplo /api/patients/abc
  if (error.code === '22P02') {
    return res.status(400).json({ message: 'El identificador enviado no es valido' });
  }

  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return res.status(503).json({ message: 'No se pudo conectar con la base de datos' });
  }

  const status = error.status || error.statusCode || 500;

  // En 500 no exponemos el mensaje interno: puede filtrar SQL o rutas del servidor.
  if (status >= 500) {
    return res.status(status).json({
      message: env.isProduction ? 'Error interno del servidor' : error.message || 'Error interno del servidor'
    });
  }

  return res.status(status).json({ message: error.message || 'Error en la peticion' });
}
