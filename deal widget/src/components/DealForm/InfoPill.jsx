/** Read-only owner badge with avatar initial */
export function InfoPill({ label, value }) {
  const initial = value?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1.5">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 shrink-0">
          <span className="text-[10px] font-bold text-white leading-none">{initial}</span>
        </div>
        <span className="text-sm font-medium text-indigo-700">{value ?? '—'}</span>
      </div>
    </div>
  )
}