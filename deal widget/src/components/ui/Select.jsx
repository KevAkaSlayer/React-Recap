export function Select({ id, options = [], disabled, placeholder, hasError = false, ...rest }) {
  const borderClass = hasError ? 'border-rose-400' : 'border-slate-200'
  return (
    <select
      id={id}
      disabled={disabled}
      className={
        `w-full rounded-lg border ${borderClass} bg-white px-3 py-2 text-sm text-slate-800 ` +
        'shadow-sm transition appearance-none cursor-pointer ' +
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ' +
        'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed'
      }
      {...rest}
    >
      <option value="">{placeholder ?? '— Select —'}</option>
      {/* Show the current value even while picklist options are still loading */}
      {rest.value && !options.includes(rest.value) && (
        <option key="__current__" value={rest.value}>{rest.value}</option>
      )}
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}
