export function Label({ htmlFor, required, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide"
    >
      {children}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  )
}
