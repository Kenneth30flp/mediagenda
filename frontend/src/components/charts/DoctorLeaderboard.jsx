const MEDAL_TONES = ['bg-[#28A745]', 'bg-[#1A2B4C]', 'bg-[#B0B0B0]'];

export default function DoctorLeaderboard({ data }) {
  if (data.length === 0) {
    return <p className="text-sm font-semibold text-[#1A2B4C]/50">Aun no hay citas registradas para el ranking de doctores.</p>;
  }

  const max = Math.max(...data.map((doctor) => doctor.count), 1);

  return (
    <div className="grid gap-3.5">
      {data.map((doctor, index) => (
        <div key={`${doctor.doctorName}-${index}`} className="flex items-center gap-3">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black text-white ${MEDAL_TONES[index] || 'bg-[#B0B0B0]/60'}`}>
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-bold text-[#1A2B4C]">{doctor.doctorName}</span>
              <span className="shrink-0 text-xs font-bold text-[#1A2B4C]/50">{doctor.count} {doctor.count === 1 ? 'cita' : 'citas'}</span>
            </div>
            <p className="truncate text-xs text-[#1A2B4C]/45">{doctor.specialty}</p>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#28A745]/12">
              <div className="h-full rounded-full bg-[#28A745] transition-[width] duration-700 ease-out" style={{ width: `${Math.max((doctor.count / max) * 100, 4)}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
