const base =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 ' +
  'placeholder:text-slate-400 shadow-sm transition ' +
  'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ' +
  'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed'

function borderClass(hasError) {
  return hasError ? 'border-rose-400' : 'border-slate-200'
}

export function Input({ id, type = 'text', disabled, hasError = false, ...rest }) {
  return (
    <input
      id={id}
      type={type}
      disabled={disabled}
      className={`${base} ${borderClass(hasError)}`}
      {...rest}
    />
  )
}

export function Textarea({ id, rows = 3, disabled, hasError = false, ...rest }) {
  return (
    <textarea
      id={id}
      rows={rows}
      disabled={disabled}
      className={`${base} ${borderClass(hasError)} resize-none`}
      {...rest}
    />
  )
}
