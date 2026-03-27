/**
 * ProductLookupField – compact inline combobox for Zoho Products.
 *
 * Key differences from the generic LookupField:
 * - Hardwired to entity='Products', displayKey='Product_Name'
 * - Dropdown is portaled to <body> via position:fixed so it escapes
 *   table cells that use overflow:hidden
 * - Exposes onProductSelect(record) so callers can read Unit_Price etc.
 * - Shows unit price as a subtle hint inside each dropdown row
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useDebounce } from '../../hooks/useDebounce'
import { searchRecords } from '../../lib/zoho'
import { Spinner } from '../ui/Spinner'

export function ProductLookupField({
  value,            // { id, name } | null
  onChange,         // (value: { id, name } | null) => void
  onProductSelect,  // optional: (record) => void – full Zoho record for price auto-fill
  disabled = false,
}) {
  const [inputText, setInputText] = useState(value?.name ?? '')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'error'
  const [highlighted, setHighlighted] = useState(0)
  const [dropdownStyle, setDropdownStyle] = useState({})

  const containerRef = useRef(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const debouncedText = useDebounce(inputText, 350)

  // Sync display text when external value changes
  useEffect(() => {
    setInputText(value?.name ?? '')
  }, [value])

  // Fetch results when open or query changes
  useEffect(() => {
    if (!open) return
    setStatus('loading')
    setHighlighted(0)
    searchRecords('Products', debouncedText)
      .then((data) => { setResults(data); setStatus('idle') })
      .catch(() => { setResults([]); setStatus('error') })
  }, [open, debouncedText])

  // Compute fixed-position coordinates for the dropdown
  useEffect(() => {
    if (!open || !inputRef.current) return

    function reposition() {
      if (!inputRef.current) return
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 220),
        zIndex: 9999,
      })
    }

    reposition()
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open])

  // Close on click outside (works across the portal boundary)
  useEffect(() => {
    function handleMouseDown(e) {
      const inContainer = containerRef.current?.contains(e.target)
      const inDropdown = dropdownRef.current?.contains(e.target)
      if (!inContainer && !inDropdown) {
        setOpen(false)
        setInputText(value?.name ?? '')
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [value])

  useEffect(() => {
    if (!open) setHighlighted(0)
  }, [open])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const selectRecord = useCallback(
    (record) => {
      const name = record.Product_Name ?? ''
      setInputText(name)
      onChange({ id: record.id, name })
      onProductSelect?.(record)
      setOpen(false)
    },
    [onChange, onProductSelect],
  )

  function handleClear(e) {
    e.preventDefault()
    setInputText('')
    onChange(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false)
      setInputText(value?.name ?? '')
      inputRef.current?.blur()
      return
    }
    if (!open) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true) }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => {
        const next = Math.min(h + 1, results.length - 1)
        listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' })
        return next
      })
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => {
        const next = Math.max(h - 1, 0)
        listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' })
        return next
      })
      return
    }
    if (e.key === 'Enter' && results[highlighted]) {
      e.preventDefault()
      selectRecord(results[highlighted])
    }
    if (e.key === 'Tab') {
      setOpen(false)
      setInputText(value?.name ?? '')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const borderCls = open
    ? 'border-indigo-400 ring-1 ring-indigo-400'
    : 'border-slate-200'

  const dropdown = (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
    >
      <ul ref={listRef} role="listbox" className="max-h-48 overflow-y-auto py-1">
        {status === 'loading' && (
          <li className="flex items-center justify-center py-3">
            <Spinner size={4} />
          </li>
        )}
        {status === 'error' && (
          <li className="px-4 py-3 text-sm text-rose-500 text-center">
            Failed to load. Try again.
          </li>
        )}
        {status === 'idle' && results.length === 0 && (
          <li className="px-4 py-4 text-sm text-slate-400 text-center">
            {inputText.trim()
              ? `No products found for "${inputText}"`
              : 'No products found.'}
          </li>
        )}
        {status === 'idle' &&
          results.map((record, i) => {
            const isSelected = record.id === value?.id
            const isHighlighted = i === highlighted
            return (
              <li
                key={record.id}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlighted(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectRecord(record)
                }}
                className={[
                  'flex items-center justify-between px-3 py-2 text-sm cursor-pointer select-none transition-colors',
                  isHighlighted ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50',
                  isSelected ? 'font-medium' : '',
                ].join(' ')}
              >
                <span className="truncate">{record.Product_Name}</span>
                <span className="ml-2 text-xs text-slate-400 shrink-0 tabular-nums">
                  {record.Unit_Price != null
                    ? `$${Number(record.Unit_Price).toFixed(2)}`
                    : ''}
                </span>
              </li>
            )
          })}
      </ul>
    </div>
  )

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={`flex items-center w-full rounded-md border bg-white transition-all ${borderCls}`}>
        <span className="pl-2 text-slate-400 shrink-0">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          autoComplete="off"
          disabled={disabled}
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products…"
          className="flex-1 min-w-0 px-1.5 py-1.5 text-sm bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:text-slate-400 disabled:cursor-not-allowed"
        />
        {value?.id && (
          <button
            type="button"
            onMouseDown={handleClear}
            disabled={disabled}
            aria-label="Clear selection"
            className="pr-2 text-slate-400 hover:text-rose-500 transition-colors focus:outline-none disabled:opacity-40"
          >
            <XIcon />
          </button>
        )}
      </div>

      {open && createPortal(dropdown, document.body)}
    </div>
  )
}

// ── Inline icons ──────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  )
}