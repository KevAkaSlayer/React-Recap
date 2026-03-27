import { useState, useEffect, useRef } from 'react'
import { getBooksVendors } from '../lib/zoho'

const DEBOUNCE_MS = 350

/**
 * Searchable vendor combobox backed by Zoho Books contacts (contact_type=vendor).
 *
 * value  : { id: string, name: string } | null
 * onChange: (value) => void
 */
export function VendorLookupField({ value, onChange, disabled }) {
  const [query, setQuery] = useState(value?.name ?? '')
  const [options, setOptions] = useState([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const timerRef = useRef(null)
  const containerRef = useRef(null)

  // When the value prop changes externally (e.g. form reset), sync display text
  useEffect(() => {
    setQuery(value?.name ?? '')
  }, [value?.name])

  function search(text) {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      console.log('[VendorLookupField] searching:', text)
      setSearching(true)
      const results = await getBooksVendors(text)
      console.log('[VendorLookupField] results:', results)
      setOptions(results)
      setSearching(false)
    }, DEBOUNCE_MS)
  }

  function handleInputChange(e) {
    const text = e.target.value
    setQuery(text)
    onChange(null) // clear confirmed selection while typing
    setOpen(true)
    search(text)
  }

  function handleFocus() {
    setOpen(true)
    if (options.length === 0) search(query)
  }

  function handleSelect(vendor) {
    console.log('[VendorLookupField] selected:', vendor)
    setQuery(vendor.contact_name)
    onChange({ id: vendor.contact_id, name: vendor.contact_name })
    setOpen(false)
  }

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const hasSelection = !!value?.id

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          disabled={disabled}
          placeholder="Search vendor…"
          className={
            'w-full rounded-lg border bg-white px-3 py-2 pr-8 text-sm text-slate-800 ' +
            'placeholder:text-slate-400 shadow-sm transition ' +
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ' +
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ' +
            (hasSelection ? 'border-emerald-400' : 'border-slate-200')
          }
        />
        {/* Check icon when a vendor is confirmed */}
        {hasSelection && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
        {searching && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <svg className="h-3.5 w-3.5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto">
          {searching && options.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-400">Searching…</p>
          )}
          {!searching && options.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-400">No vendors found.</p>
          )}
          {options.map((vendor) => (
            <button
              key={vendor.contact_id}
              type="button"
              onMouseDown={(e) => e.preventDefault()} // prevent blur before click
              onClick={() => handleSelect(vendor)}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
            >
              {vendor.contact_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
