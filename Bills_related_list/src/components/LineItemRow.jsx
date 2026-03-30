import { useState, useRef, useEffect } from 'react'
import { AccountPickerField } from './AccountPickerField'

const cellClass = 'px-3 py-2 align-top'

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 ' +
  'placeholder:text-slate-400 transition ' +
  'focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ' +
  'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed'

/**
 * A single line-item row in the bill form.
 *
 * The item name field is a combobox — type freely or pick from existing Books items.
 * Selecting an existing item auto-fills rate + description and records item_id.
 * Typing a custom name (without selecting) creates the bill with just the name; no
 * separate Books item is created.
 */
/**
 * @param rateField - 'rate' for bills (items with selling rate), 'purchase_rate' for POs
 */
export function LineItemRow({ item, items, accounts, onChange, onRemove, canRemove, disabled, rateField = 'rate' }) {
  // Local display value for the combobox input — kept in sync with item.name
  const [inputValue, setInputValue] = useState(item.name ?? '')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  // Sync when parent updates item.name (e.g. edit-mode initial load)
  useEffect(() => {
    setInputValue(item.name ?? '')
  }, [item.name])

  // Only show items that have a value in the relevant rate field
  const eligibleItems = items.filter((i) => parseFloat(i[rateField]) > 0)

  // Filter by search text
  const suggestions = inputValue.trim()
    ? eligibleItems.filter((i) => i.name.toLowerCase().includes(inputValue.trim().toLowerCase()))
    : eligibleItems

  function handleInputChange(e) {
    const val = e.target.value
    setInputValue(val)
    setOpen(true)
    // Clear any previously linked item_id — user is now typing freely
    onChange({ name: val, item_id: '' })
  }

  function handleSelect(selected) {
    setInputValue(selected.name)
    setOpen(false)
    onChange({
      item_id: selected.item_id,
      account_id: '',
      name: selected.name,
      rate: selected[rateField] ?? selected.rate ?? 0,
      description: selected.description ?? '',
    })
  }

  function handleBlur() {
    // Small delay so mousedown on a suggestion fires before the dropdown closes
    setTimeout(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) {
        setOpen(false)
      }
    }, 150)
  }

  const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)

  return (
    <tr className="hover:bg-slate-50/50">

      {/* Item — combobox */}
      <td className={cellClass}>
        <div className="relative" ref={wrapperRef}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            onBlur={handleBlur}
            placeholder="Type or search item…"
            disabled={disabled}
            className={inputClass + (item.item_id ? ' pr-7' : '')}
          />

          {/* Checkmark when an existing item is linked */}
          {item.item_id && (
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}

          {/* Suggestions dropdown */}
          {open && !disabled && suggestions.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto text-sm">
              {suggestions.map((i) => (
                <li
                  key={i.item_id}
                  onMouseDown={() => handleSelect(i)}
                  className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <span className="truncate">{i.name}</span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(i[rateField] ?? i.rate ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Account picker — required by Zoho Books when no item_id is set */}
        {!item.item_id && (
          <AccountPickerField
            value={item.account_id}
            onChange={(accountId) => onChange({ account_id: accountId })}
            accounts={accounts ?? []}
            disabled={disabled}
          />
        )}
      </td>

      {/* Description */}
      <td className={cellClass}>
        <input
          type="text"
          value={item.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Description"
          disabled={disabled}
          className={inputClass}
        />
      </td>

      {/* Quantity */}
      <td className={cellClass}>
        <input
          type="number"
          value={item.quantity}
          min="0.01"
          step="0.01"
          onChange={(e) => onChange({ quantity: e.target.value })}
          disabled={disabled}
          className={inputClass + ' text-right'}
        />
      </td>

      {/* Rate */}
      <td className={cellClass}>
        <input
          type="number"
          value={item.rate}
          min="0"
          step="0.01"
          onChange={(e) => onChange({ rate: e.target.value })}
          disabled={disabled}
          className={inputClass + ' text-right'}
        />
      </td>

      {/* Amount (computed) */}
      <td className={cellClass + ' text-right text-sm font-medium text-slate-700 whitespace-nowrap'}>
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)}
      </td>

      {/* Remove */}
      <td className={cellClass}>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            title="Remove line item"
            className="h-6 w-6 rounded-md flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </td>

    </tr>
  )
}
