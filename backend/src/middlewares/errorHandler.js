export function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (error.name === 'ZodError') {
    return res.status(400).json({ message: 'Datos invalidos', errors: error.errors });
  }

  if (error.code === '23505') {
    return res.status(409).json({ message: 'Ya existe un registro con esos datos unicos' });
  }

  if (error.code === '23503') {
    return res.status(400).json({ message: 'El paciente o doctor seleccionado no existe' });
  }

  return res.status(error.status || 500).json({
    message: error.message || 'Error interno del servidor'
  });
}
