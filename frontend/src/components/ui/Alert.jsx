const tones = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-[#28A745]/25 bg-[#28A745]/10 text-[#28A745]',
  info: 'border-amber-200 bg-amber-50 text-amber-700'
};

export default function Alert({ tone = 'error', message, onClose }) {
  if (!message) return null;

  return (
    <div className={`mb-5 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${tones[tone]}`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="shrink-0 opacity-60 transition hover:opacity-100" aria-label="Cerrar aviso">
          ✕
        </button>
      )}
    </div>
  );
}
