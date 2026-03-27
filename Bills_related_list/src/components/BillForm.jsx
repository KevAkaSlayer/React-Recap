import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Label } from './ui/Label'
import { Input, Textarea } from './ui/Input'
import { LineItemRow } from './LineItemRow'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function emptyLineItem() {
  return {
    id: Math.random().toString(36).slice(2),
    line_item_id: null,   // null = new row; string = existing Books line item
    item_id: '',
    account_id: '',
    name: '',
    description: '',
    quantity: 1,
    rate: 0,
  }
}

/** Map a Books line_item object to our internal row shape */
function fromBooksLineItem(li) {
  return {
    id: li.line_item_id,
    line_item_id: li.line_item_id,
    item_id: li.item_id ?? '',
    account_id: li.account_id ?? '',
    name: li.name ?? '',
    description: li.description ?? '',
    quantity: li.quantity ?? 1,
    rate: li.rate ?? 0,
  }
}

/**
 * Bill create / edit form.
 *
 * Props:
 *   mode         : 'create' | 'edit'
 *   initialData  : null (create) or full bill object from getBillDetails (edit)
 *   defaultVendor: { id, name } — pre-filled vendor (from CRM context)
 *   items        : Books items array for line-item dropdown
 *   submitting   : boolean
 *   formRef      : React ref attached to <form>
 *   onSubmit(payload) : called with the complete bill payload
 *   onAddItem(item)   : called when a new Books item is created inside a row
 */
export function BillForm({ mode, initialData, defaultVendor, items, accounts, submitting, formRef, onSubmit }) {
  const isEdit = mode === 'edit'

  const [vendor, setVendor] = useState(
    isEdit && initialData
      ? { id: initialData.vendor_id, name: initialData.vendor_name }
      : defaultVendor ?? null,
  )

  const [form, setForm] = useState({
    bill_number: isEdit ? (initialData?.bill_number ?? '') : '',
    date: isEdit ? (initialData?.date ?? todayISO()) : todayISO(),
    due_date: isEdit ? (initialData?.due_date ?? '') : '',
    reference_number: isEdit ? (initialData?.reference_number ?? '') : '',
    notes: isEdit ? (initialData?.notes ?? '') : '',
  })

  const [lineItems, setLineItems] = useState(
    isEdit && initialData?.line_items?.length
      ? initialData.line_items.map(fromBooksLineItem)
      : [emptyLineItem()],
  )

  // When edit data arrives asynchronously (modal opens before data is loaded), sync it
  useEffect(() => {
    if (!isEdit || !initialData) return
    console.log('[BillForm] syncing initialData for edit:', initialData)
    setVendor({ id: initialData.vendor_id, name: initialData.vendor_name })
    setForm({
      bill_number: initialData.bill_number ?? '',
      date: initialData.date ?? todayISO(),
      due_date: initialData.due_date ?? '',
      reference_number: initialData.reference_number ?? '',
      notes: initialData.notes ?? '',
    })
    setLineItems(
      initialData.line_items?.length
        ? initialData.line_items.map(fromBooksLineItem)
        : [emptyLineItem()],
    )
  }, [initialData, isEdit])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateLineItem(id, updates) {
    setLineItems((prev) => prev.map((row) => (row.id === id ? { ...row, ...updates } : row)))
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, emptyLineItem()])
  }

  function removeLineItem(id) {
    setLineItems((prev) => prev.filter((row) => row.id !== id))
  }

  const total = lineItems.reduce(
    (sum, row) => sum + (parseFloat(row.quantity) || 0) * (parseFloat(row.rate) || 0),
    0,
  )

  function handleSubmit(e) {
    e.preventDefault()

    if (!vendor?.id) { toast.error('Vendor is required.'); return }
    if (!form.bill_number.trim()) { toast.error('Bill Number is required.'); return }
    if (!form.date) { toast.error('Bill Date is required.'); return }

    // A row is valid if it has item_id (existing) OR both name + account_id (custom)
    const validRows = lineItems.filter((row) =>
      row.item_id ? true : (row.name.trim() && row.account_id)
    )
    if (validRows.length === 0) {
      const hasNameOnly = lineItems.some((row) => !row.item_id && row.name.trim() && !row.account_id)
      toast.error(
        hasNameOnly
          ? 'Select an Account for each custom line item.'
          : 'At least one line item is required.'
      )
      return
    }

    const line_items = validRows.map((row) => {
      const base = {
        description: row.description.trim() || undefined,
        quantity: parseFloat(row.quantity) || 1,
        rate: parseFloat(row.rate) || 0,
      }
      // Preserve line_item_id for existing rows (required by update API)
      if (row.line_item_id) base.line_item_id = row.line_item_id
      // Zoho Books requires item_id OR account_id on every line item
      if (row.item_id) {
        base.item_id = row.item_id
      } else {
        base.name = row.name.trim()
        base.account_id = row.account_id
      }
      return base
    })

    const payload = {
      vendor_id: vendor.id,
      bill_number: form.bill_number.trim(),
      date: form.date,
      ...(form.due_date && { due_date: form.due_date }),
      ...(form.reference_number.trim() && { reference_number: form.reference_number.trim() }),
      ...(form.notes.trim() && { notes: form.notes.trim() }),
      line_items,
    }

    console.log('[BillForm] submit payload:', payload)
    onSubmit(payload)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-7">

      {/* ── Vendor ───────────────────────────────────────────── */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Vendor</p>
        <Label htmlFor="vendor" required>Vendor Name</Label>
        {/* Vendor is locked to the CRM context — always read-only */}
        <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2">
          <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium text-slate-800">{vendor?.name ?? '—'}</span>
          <span className="ml-auto text-xs text-slate-400">{vendor?.id}</span>
        </div>
      </section>

      {/* ── Bill Details ─────────────────────────────────────── */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Bill Details</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bill_number" required>Bill Number</Label>
            <Input
              id="bill_number"
              value={form.bill_number}
              onChange={(e) => setField('bill_number', e.target.value)}
              placeholder="BILL-001"
              disabled={submitting}
            />
          </div>
          <div>
            <Label htmlFor="date" required>Bill Date</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              disabled={submitting}
            />
          </div>
          <div>
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={form.due_date}
              onChange={(e) => setField('due_date', e.target.value)}
              disabled={submitting}
            />
          </div>
          <div>
            <Label htmlFor="reference_number">Reference #</Label>
            <Input
              id="reference_number"
              value={form.reference_number}
              onChange={(e) => setField('reference_number', e.target.value)}
              placeholder="Vendor invoice number"
              disabled={submitting}
            />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Internal notes for this bill…"
            disabled={submitting}
          />
        </div>
      </section>

      {/* ── Line Items ───────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Line Items <span className="text-rose-500 ml-0.5">*</span>
          </p>
          <button
            type="button"
            onClick={addLineItem}
            disabled={submitting}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Line Item
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-visible">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 w-[28%]">Item</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Description</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 w-20">Qty</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 w-24">Rate</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 w-24">Amount</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lineItems.map((row) => (
                <LineItemRow
                  key={row.id}
                  item={row}
                  items={items}
                  onChange={(updates) => updateLineItem(row.id, updates)}
                  onRemove={() => removeLineItem(row.id)}
                  canRemove={lineItems.length > 1}
                  disabled={submitting}
                  accounts={accounts}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="mt-3 flex justify-end">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-5 py-3 min-w-36 text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Total</p>
            <p className="text-xl font-semibold text-slate-800">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}
            </p>
          </div>
        </div>
      </section>

    </form>
  )
}
