import { useCallback, useState } from 'react';

/**
 * Centraliza el estado de error/exito/carga de las pantallas para que ninguna
 * peticion fallida quede en silencio en la consola.
 */
export function useFeedback() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const clear = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  const run = useCallback(async (action, successMessage) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await action();
      if (successMessage) setSuccess(successMessage);
      return result;
    } catch (err) {
      setError(err.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  return { error, success, loading, setError, setSuccess, clear, run };
}
