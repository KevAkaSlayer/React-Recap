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
    line_item_id: null,
    item_id: '',
    account_id: '',
    name: '',
    description: '',
    quantity: 1,
    rate: 0,
  }
}

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

/** Purchase Order create / edit form. */
function generateNextPONumber(existingOrders) {
  let maxNum = 0
  for (const po of existingOrders) {
    const match = po.purchaseorder_number?.match(/^PO-(\d+)$/i)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxNum) maxNum = num
    }
  }
  return 'PO-' + String(maxNum + 1).padStart(5, '0')
}

export function PurchaseOrderForm({ mode, initialData, defaultVendor, items, accounts, existingOrders, submitting, formRef, onSubmit }) {
  const isEdit = mode === 'edit'

  const [vendor] = useState(
    isEdit && initialData
      ? { id: initialData.vendor_id, name: initialData.vendor_name }
      : defaultVendor ?? null,
  )

  const initAddr = isEdit ? (initialData?.delivery_address ?? {}) : {}

  const [form, setForm] = useState({
    purchaseorder_number: isEdit
      ? (initialData?.purchaseorder_number ?? '')
      : generateNextPONumber(existingOrders ?? []),
    date: isEdit ? (initialData?.date ?? todayISO()) : todayISO(),
    delivery_date: isEdit ? (initialData?.delivery_date ?? '') : '',
    reference_number: isEdit ? (initialData?.reference_number ?? '') : '',
    notes: isEdit ? (initialData?.notes ?? '') : '',
    // Delivery address
    addr_address: initAddr.address ?? '',
    addr_city: initAddr.city ?? '',
    addr_state: initAddr.state ?? '',
    addr_zip: initAddr.zip ?? '',
    addr_country: initAddr.country ?? '',
  })

  const [lineItems, setLineItems] = useState(
    isEdit && initialData?.line_items?.length
      ? initialData.line_items.map(fromBooksLineItem)
      : [emptyLineItem()],
  )

  useEffect(() => {
    if (!isEdit || !initialData) return
    const addr = initialData.delivery_address ?? {}
    setForm({
      purchaseorder_number: initialData.purchaseorder_number ?? '',
      date: initialData.date ?? todayISO(),
      delivery_date: initialData.delivery_date ?? '',
      reference_number: initialData.reference_number ?? '',
      notes: initialData.notes ?? '',
      addr_address: addr.address ?? '',
      addr_city: addr.city ?? '',
      addr_state: addr.state ?? '',
      addr_zip: addr.zip ?? '',
      addr_country: addr.country ?? '',
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
    if (!form.purchaseorder_number.trim()) { toast.error('PO Number is required.'); return }
    if (!form.date) { toast.error('PO Date is required.'); return }
    if (!form.addr_address.trim()) { toast.error('Delivery Address is required.'); return }

    const validRows = lineItems.filter((row) =>
      row.item_id ? true : (row.name.trim() && row.account_id)
    )
    if (validRows.length === 0) {
      const hasNameOnly = lineItems.some((row) => !row.item_id && row.name.trim() && !row.account_id)
      toast.error(hasNameOnly ? 'Select an Account for each custom line item.' : 'At least one line item is required.')
      return
    }

    const line_items = validRows.map((row) => {
      const base = {
        description: row.description.trim() || undefined,
        quantity: parseFloat(row.quantity) || 1,
        rate: parseFloat(row.rate) || 0,
      }
      if (row.line_item_id) base.line_item_id = row.line_item_id
      if (row.item_id) {
        base.item_id = row.item_id
      } else {
        base.name = row.name.trim()
        base.account_id = row.account_id
      }
      return base
    })

    const delivery_address = {
      address: form.addr_address.trim(),
      ...(form.addr_city.trim() && { city: form.addr_city.trim() }),
      ...(form.addr_state.trim() && { state: form.addr_state.trim() }),
      ...(form.addr_zip.trim() && { zip: form.addr_zip.trim() }),
      ...(form.addr_country.trim() && { country: form.addr_country.trim() }),
    }

    const payload = {
      vendor_id: vendor.id,
      purchaseorder_number: form.purchaseorder_number.trim(),
      date: form.date,
      delivery_address,
      ...(form.delivery_date && { delivery_date: form.delivery_date }),
      ...(form.reference_number.trim() && { reference_number: form.reference_number.trim() }),
      ...(form.notes.trim() && { notes: form.notes.trim() }),
      line_items,
    }

    console.log('[PurchaseOrderForm] submit payload:', payload)
    onSubmit(payload)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-7">

      {/* Vendor (locked) */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Vendor</p>
        <Label required>Vendor Name</Label>
        <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2">
          <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium text-slate-800">{vendor?.name ?? '—'}</span>
          <span className="ml-auto text-xs text-slate-400">{vendor?.id}</span>
        </div>
      </section>

      {/* PO Details */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">PO Details</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="po_number" required>PO Number</Label>
            <Input
              id="po_number"
              value={form.purchaseorder_number}
              onChange={(e) => setField('purchaseorder_number', e.target.value)}
              placeholder="PO-001"
              disabled={submitting}
            />
          </div>
          <div>
            <Label htmlFor="po_date" required>Date</Label>
            <Input id="po_date" type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} disabled={submitting} />
          </div>
          <div>
            <Label htmlFor="delivery_date">Delivery Date</Label>
            <Input id="delivery_date" type="date" value={form.delivery_date} onChange={(e) => setField('delivery_date', e.target.value)} disabled={submitting} />
          </div>
          <div>
            <Label htmlFor="po_ref">Reference #</Label>
            <Input id="po_ref" value={form.reference_number} onChange={(e) => setField('reference_number', e.target.value)} placeholder="Ref number" disabled={submitting} />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="po_notes">Notes</Label>
          <Textarea id="po_notes" value={form.notes} onChange={(e) => setField('notes', e.target.value)} placeholder="Internal notes…" disabled={submitting} />
        </div>
      </section>

      {/* Delivery Address */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Delivery Address <span className="text-rose-500 ml-0.5">*</span>
        </p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="addr_address" required>Address</Label>
            <Input id="addr_address" value={form.addr_address} onChange={(e) => setField('addr_address', e.target.value)} placeholder="Street address" disabled={submitting} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="addr_city">City</Label>
              <Input id="addr_city" value={form.addr_city} onChange={(e) => setField('addr_city', e.target.value)} placeholder="City" disabled={submitting} />
            </div>
            <div>
              <Label htmlFor="addr_state">State</Label>
              <Input id="addr_state" value={form.addr_state} onChange={(e) => setField('addr_state', e.target.value)} placeholder="State" disabled={submitting} />
            </div>
            <div>
              <Label htmlFor="addr_zip">ZIP / Postal Code</Label>
              <Input id="addr_zip" value={form.addr_zip} onChange={(e) => setField('addr_zip', e.target.value)} placeholder="ZIP" disabled={submitting} />
            </div>
            <div>
              <Label htmlFor="addr_country">Country</Label>
              <Input id="addr_country" value={form.addr_country} onChange={(e) => setField('addr_country', e.target.value)} placeholder="Country" disabled={submitting} />
            </div>
          </div>
        </div>
      </section>

      {/* Line Items */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Line Items <span className="text-rose-500 ml-0.5">*</span>
          </p>
          <button type="button" onClick={addLineItem} disabled={submitting}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition">
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
                  rateField="purchase_rate"
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