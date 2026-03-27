import { useState, useEffect, useRef, useCallback } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import { searchRecords } from '../../lib/zoho'
import { Spinner } from './Spinner'

/**
 * LookupField – combobox backed by a Zoho CRM entity.
 * The input field itself is the search box; there is no separate search inside the dropdown.
 *
 * @param {string}   props.id
 * @param {'Accounts'|'Contacts'} props.entity
 * @param {string}   props.displayKey   – record field that holds the display label
 * @param {{ id: string, name: string } | null} props.value
 * @param {function} props.onChange      – called with { id, name } or null
 * @param {boolean}  [props.disabled]
 * @param {string}   [props.placeholder]
 * @param {boolean}  [props.hasError]
 */
export function LookupField({
  id,
  entity,
  displayKey,
  value,
  onChange,
  disabled = false,
  placeholder = 'Search…',
  hasError = false,
}) {
  const [inputText, setInputText] = useState(value?.name ?? '')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'error'
  const [highlighted, setHighlighted] = useState(0)

  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const debouncedText = useDebounce(inputText, 350)

  // ── Sync display text when external value changes (e.g. after save / initial load) ──
  useEffect(() => {
    setInputText(value?.name ?? '')
  }, [value])

  // ── Fetch whenever dropdown is open or debounced text changes ──
  useEffect(() => {
    if (!open) return
    setStatus('loading')
    setHighlighted(0)

    searchRecords(entity, debouncedText)
      .then((data) => { setResults(data); setStatus('idle') })
      .catch((err) => {
        console.error(`[LookupField] search error (${entity}):`, err)
        setResults([])
        setStatus('error')
      })
  }, [open, debouncedText, entity])

  // ── Close & revert text on outside click ──
  useEffect(() => {
    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setInputText(value?.name ?? '') // revert if no selection was made
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [value])

  // ── Reset highlighted index when dropdown closes ──
  useEffect(() => {
    if (!open) setHighlighted(0)
  }, [open])

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleInputChange(e) {
    setInputText(e.target.value)
    setOpen(true)
  }

  function handleFocus() {
    setOpen(true)
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
        scrollIntoView(next)
        return next
      })
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => {
        const next = Math.max(h - 1, 0)
        scrollIntoView(next)
        return next
      })
      return
    }
    if (e.key === 'Enter' && results[highlighted]) {
      e.preventDefault()
      selectRecord(results[highlighted])
    }
    if (e.key === 'Tab') {
      // Close gracefully on tab-out; revert if nothing selected
      setOpen(false)
      setInputText(value?.name ?? '')
    }
  }

  function scrollIntoView(index) {
    listRef.current?.children[index]?.scrollIntoView({ block: 'nearest' })
  }

  const selectRecord = useCallback(
    (record) => {
      const name = record[displayKey] ?? ''
      setInputText(name)
      onChange({ id: record.id, name })
      setOpen(false)
    },
    [onChange, displayKey],
  )

  function handleClear(e) {
    e.preventDefault()
    setInputText('')
    onChange(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  // ── Derived ──────────────────────────────────────────────────────────────
  const borderClass = open
    ? 'border-indigo-500 ring-2 ring-indigo-500'
    : hasError
      ? 'border-rose-400'
      : 'border-slate-200'

  return (
    <div ref={containerRef} className="relative">
      {/* ── Combobox input ── */}
      <div className={`flex items-center w-full rounded-lg border bg-white shadow-sm transition-all ${borderClass}`}>
        {/* Search icon */}
        <span className="pl-3 text-slate-400 shrink-0">
          <SearchIcon />
        </span>

        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          autoComplete="off"
          disabled={disabled}
          value={inputText}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={
            'flex-1 min-w-0 px-2 py-2 text-sm bg-transparent text-slate-800 ' +
            'placeholder:text-slate-400 focus:outline-none ' +
            'disabled:text-slate-400 disabled:cursor-not-allowed'
          }
        />

        {/* Right-side adornment: spinner while loading, clear × when value selected */}
        <span className="pr-2.5 flex items-center gap-1 shrink-0">
          {status === 'loading' && open ? (
            <Spinner size={4} />
          ) : value?.id ? (
            <button
              type="button"
              onMouseDown={handleClear}
              disabled={disabled}
              aria-label="Clear selection"
              className="text-slate-400 hover:text-rose-500 transition-colors focus:outline-none disabled:opacity-40"
            >
              <XIcon />
            </button>
          ) : null}
        </span>
      </div>

      {/* ── Results dropdown ── */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <ul ref={listRef} role="listbox" className="max-h-52 overflow-y-auto py-1">

            {status === 'error' && (
              <li className="px-4 py-3 text-sm text-rose-500 text-center">
                Failed to load. Try typing again.
              </li>
            )}

            {status === 'idle' && results.length === 0 && (
              <li className="px-4 py-6 text-sm text-slate-400 text-center">
                {inputText.trim()
                  ? `No ${entity} found for "${inputText}"`
                  : `No ${entity} found.`}
              </li>
            )}

            {status === 'idle' && results.map((record, i) => {
              const label = record[displayKey] ?? record.id
              const isSelected = record.id === value?.id
              const isHighlighted = i === highlighted

              return (
                <li
                  key={record.id}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlighted(i)}
                  onMouseDown={(e) => {
                    e.preventDefault() // keep input focused, prevent blur race
                    selectRecord(record)
                  }}
                  className={[
                    'flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer select-none transition-colors',
                    isHighlighted ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50',
                    isSelected ? 'font-medium' : '',
                  ].join(' ')}
                >
                  <span className="truncate">{label}</span>
                  {isSelected && <CheckIcon />}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Inline SVG icons ─────────────────────────────────────────────────────────

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

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-indigo-600 shrink-0 ml-2" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  )
}
