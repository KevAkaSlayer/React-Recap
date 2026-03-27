export function Button({ children, loading = false, disabled, variant = 'primary', ...rest }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold ' +
    'transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 '

  const variants = {
    primary:
      'bg-indigo-600 text-white shadow-sm shadow-indigo-200 ' +
      'hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 ' +
      'focus:ring-indigo-500 active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300 border border-slate-200',
    danger:
      'bg-rose-600 text-white shadow-sm shadow-rose-200 ' +
      'hover:bg-rose-700 hover:shadow-md hover:shadow-rose-200 ' +
      'focus:ring-rose-500 active:scale-[0.98]',
  }

  return (
    <button disabled={disabled || loading} className={base + (variants[variant] ?? variants.primary)} {...rest}>
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}