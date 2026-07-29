// Paleta categorica validada (ver skill dataviz: 5 slots, PASS en CVD y
// piso de vision normal contra la superficie #F7F9FB). Cada barra lleva su
// nombre y valor como texto normal, nunca como color de texto.
const CATEGORICAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'];

export default function SpecialtyBars({ data }) {
  if (data.length === 0) {
    return <p className="text-sm font-semibold text-[#1A2B4C]/50">Aun no hay citas para calcular la demanda por especialidad.</p>;
  }

  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="grid gap-4">
      {data.map((item, index) => (
        <div key={item.specialty}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-bold text-[#1A2B4C]">{item.specialty}</span>
            <span className="shrink-0 font-black text-[#1A2B4C]/60">{item.count}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F7F9FB]">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{ width: `${Math.max((item.count / max) * 100, 4)}%`, backgroundColor: CATEGORICAL[index % CATEGORICAL.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
