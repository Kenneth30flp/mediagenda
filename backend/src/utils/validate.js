export function validate(schema) {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

// Evita que un id no numerico llegue a Postgres y produzca un error 500.
export function validateId(paramName = 'id') {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!/^\d+$/.test(value)) {
      return res.status(400).json({ message: 'El identificador enviado no es valido' });
    }

    return next();
  };
}
