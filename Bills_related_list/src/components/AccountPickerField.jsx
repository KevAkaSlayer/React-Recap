import { useState, useRef, useEffect } from 'react'

/**
 * Simple account picker — searchable dropdown of existing Zoho Books accounts.
 * No inline account creation to avoid endless loop issues.
 */
export function AccountPickerField({ value, onChange, accounts = [], disabled }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  const selected = accounts.find((a) => String(a.account_id) === String(value))

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Filter accounts by search text
  const filtered = search.trim()
    ? accounts.filter((a) => a.account_name.toLowerCase().includes(search.toLowerCase()))
    : accounts

  // Group by account_type
  const groups = filtered.reduce((map, a) => {
    const type = a.account_type ?? 'Other'
    if (!map[type]) map[type] = []
    map[type].push(a)
    return map
  }, {})

  function handleSelect(accountId) {
    onChange(accountId)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative mt-1">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen((o) => !o) }}
        disabled={disabled}
        className={
          'w-full flex items-center justify-between rounded-md border px-2 py-1.5 text-xs text-left ' +
          'bg-white transition focus:outline-none focus:ring-1 focus:ring-emerald-500 ' +
          'disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 ' +
          (!value ? 'border-amber-300 bg-amber-50 text-slate-400' : 'border-slate-200 text-slate-700')
        }
      >
        <span className="truncate">{selected ? selected.account_name : '— Select account —'}</span>
        <svg className="ml-1 h-3 w-3 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-56 rounded-md border border-slate-200 bg-white shadow-lg text-xs">
          {/* Search */}
          <div className="p-1.5 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accounts…"
              className="w-full rounded px-2 py-1 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Grouped list */}
          <div className="max-h-44 overflow-y-auto">
            {Object.keys(groups).length === 0 && (
              <p className="px-3 py-2 text-slate-400">No accounts found.</p>
            )}
            {Object.entries(groups).map(([type, list]) => (
              <div key={type}>
                <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {type.replace(/_/g, ' ')}
                </p>
                {list.map((a) => (
                  <button
                    key={a.account_id}
                    type="button"
                    onClick={() => handleSelect(a.account_id)}
                    className={
                      'w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 transition ' +
                      (String(a.account_id) === String(value) ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700')
                    }
                  >
                    {a.account_name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}