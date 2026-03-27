import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { Select } from '../ui/Select'
import { Label } from '../ui/Label'
import { ProductLookupField } from './ProductLookupField'
import { usePicklists } from '../../hooks/usePicklists'

// ── Line-item helpers ─────────────────────────────────────────────────────────

/**
 * A single blank line item.
 * `product` stores the Zoho product lookup value { id, name } | null.
 */
const emptyItem = () => ({
  _id: crypto.randomUUID(),
  product: null,      // { id: string, name: string } | null
  quantity: 1,
  unitPrice: '',      // string so the number input stays controlled
})

function lineTotal(item) {
  const qty = parseFloat(item.quantity) || 0
  const price = parseFloat(item.unitPrice) || 0
  return qty * price
}

function grandTotal(items) {
  return items.reduce((sum, item) => sum + lineTotal(item), 0)
}

// ── State initialisation ──────────────────────────────────────────────────────

/**
 * Hydrate form state from an existing Zoho quote (edit mode)
 * or supply clean defaults (create mode).
 *
 * Zoho quote Product_Details item shape:
 *   { product: { id, name } | string, quantity, unit_price, ... }
 */
function buildInitialState(quote, deal) {
  if (quote) {
    const rawItems = Array.isArray(quote.Product_Details) ? quote.Product_Details : []
    return {
      subject: quote.Subject ?? '',
      stage: quote.Quote_Stage ?? 'Draft',
      validTill: quote.Valid_Till ?? '',
      description: quote.Description ?? '',
      terms: quote.Terms_and_Conditions ?? '',
      lineItems: rawItems.length
        ? rawItems.map((p) => {
            // Zoho may return product as object or string
            const prod = p.product
            const productValue =
              prod && typeof prod === 'object' && prod.id
                ? { id: prod.id, name: prod.name ?? prod.Product_Name ?? '' }
                : null
            return {
              _id: crypto.randomUUID(),
              product: productValue,
              quantity: p.quantity ?? 1,
              unitPrice: p.unit_price != null ? String(p.unit_price) : '',
            }
          })
        : [emptyItem()],
    }
  }

  return {
    subject: deal?.Deal_Name ? `Quote for ${deal.Deal_Name}` : '',
    stage: 'Draft',
    validTill: '',
    description: '',
    terms: '',
    lineItems: [emptyItem()],
  }
}

// ── Payload builder ───────────────────────────────────────────────────────────

/**
 * Build the Zoho API payload from form values.
 * Only line items that have a product selected (id present) are included.
 */
function buildPayload(values, deal) {
  const productDetails = values.lineItems
    .filter((item) => item.product?.id)
    .map((item) => ({
      product: { id: item.product.id },
      quantity: parseFloat(item.quantity) || 1,
      unit_price: parseFloat(item.unitPrice) || 0,
    }))

  return {
    Subject: values.subject.trim(),
    Quote_Stage: values.stage,
    ...(values.validTill ? { Valid_Till: values.validTill } : {}),
    ...(values.description.trim() ? { Description: values.description.trim() } : {}),
    ...(values.terms.trim() ? { Terms_and_Conditions: values.terms.trim() } : {}),
    ...(productDetails.length ? { Product_Details: productDetails } : {}),
    ...(deal?.id ? { Deal_Name: { id: deal.id } } : {}),
    ...(deal?.Account_Name?.id
      ? { Account_Name: { id: deal.Account_Name.id } }
      : {}),
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function QuoteModal({ deal, quote, onSave, onClose, saving }) {
  const isEdit = !!quote
  const [values, setValues] = useState(() => buildInitialState(quote, deal))
  const [errors, setErrors] = useState({})
  const overlayRef = useRef(null)
  const { picklists } = usePicklists('Quotes', ['Quote_Stage'])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── Field setters ──────────────────────────────────────────────────────────

  function set(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  // ── Line-item mutators ─────────────────────────────────────────────────────

  function updateItem(id, patch) {
    setValues((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item._id === id ? { ...item, ...patch } : item,
      ),
    }))
  }

  /**
   * Called by ProductLookupField when the user selects a product.
   * Auto-fills unit price from the Zoho Products record.
   */
  function handleProductSelect(itemId, product, record) {
    const patch = { product }
    if (record?.Unit_Price != null) {
      patch.unitPrice = String(record.Unit_Price)
    }
    updateItem(itemId, patch)
  }

  function addItem() {
    setValues((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, emptyItem()],
    }))
  }

  function removeItem(id) {
    setValues((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item._id !== id),
    }))
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate() {
    const errs = {}
    if (!values.subject.trim()) errs.subject = 'Subject is required.'
    const validProducts = values.lineItems.filter((item) => item.product?.id)
    if (!validProducts.length) errs.products = 'Add at least one product.'
    return errs
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    const payload = buildPayload(values, deal)
    const result = await onSave(payload, isEdit ? quote.id : null)
    if (result.success) onClose()
  }

  const total = grandTotal(values.lineItems)

  // ── JSX ────────────────────────────────────────────────────────────────────

  const modal = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-100">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <DocumentIcon className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              {isEdit ? 'Edit Quote' : 'Create Quote'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Subject (full width) */}
            <div>
              <Label htmlFor="q-subject" required>Subject</Label>
              <Input
                id="q-subject"
                type="text"
                value={values.subject}
                onChange={(e) => set('subject', e.target.value)}
                placeholder="e.g. Quote for Acme Corp"
                hasError={!!errors.subject}
                disabled={saving}
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-rose-500">{errors.subject}</p>
              )}
            </div>

            {/* Stage + Valid Till */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="q-stage">Quote Stage</Label>
                <Select
                  id="q-stage"
                  value={values.stage}
                  onChange={(e) => set('stage', e.target.value)}
                  options={picklists['Quote_Stage'] ?? []}
                  placeholder="— Select —"
                  disabled={saving}
                />
              </div>
              <div>
                <Label htmlFor="q-valid">Valid Till</Label>
                <Input
                  id="q-valid"
                  type="date"
                  value={values.validTill}
                  onChange={(e) => set('validTill', e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Read-only deal + account info */}
            {(deal?.Deal_Name || deal?.Account_Name?.name) && (
              <div className="grid grid-cols-2 gap-4">
                {deal?.Deal_Name && (
                  <div>
                    <Label>Deal Name</Label>
                    <div className="mt-1 flex items-center h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600 truncate">
                      {deal.Deal_Name}
                    </div>
                  </div>
                )}
                {deal?.Account_Name?.name && (
                  <div>
                    <Label>Account</Label>
                    <div className="mt-1 flex items-center h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600 truncate">
                      {deal.Account_Name.name}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Product line items ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label>Products / Services</Label>
                  {errors.products && (
                    <p className="mt-0.5 text-xs text-rose-500">{errors.products}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  disabled={saving}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-40 transition-colors"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add Product
                </button>
              </div>

              {/*
                NOTE: no overflow-hidden on this container so the
                ProductLookupField portaled dropdowns can escape.
                Header/footer have their own rounded corners instead.
              */}
              <div className="rounded-xl border border-slate-200">

                {/* Table header */}
                <div className="grid grid-cols-[1fr_72px_96px_88px_32px] items-center bg-slate-50 rounded-t-xl border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <span>Product</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Unit Price</span>
                  <span className="text-right">Total</span>
                  <span />
                </div>

                {/* Rows */}
                {values.lineItems.length === 0 ? (
                  <p className="px-4 py-5 text-sm text-slate-400 text-center">
                    No products added yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {values.lineItems.map((item) => (
                      <div
                        key={item._id}
                        className="grid grid-cols-[1fr_72px_96px_88px_32px] items-center gap-1 px-2 py-2"
                      >
                        {/* Product lookup */}
                        <ProductLookupField
                          value={item.product}
                          onChange={(val) => updateItem(item._id, { product: val })}
                          onProductSelect={(record) =>
                            handleProductSelect(item._id, { id: record.id, name: record.Product_Name ?? '' }, record)
                          }
                          disabled={saving}
                        />

                        {/* Quantity */}
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item._id, { quantity: e.target.value })}
                          disabled={saving}
                          className="w-full rounded-md border border-slate-200 bg-white px-1.5 py-1.5 text-sm text-center text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-50"
                        />

                        {/* Unit Price */}
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item._id, { unitPrice: e.target.value })}
                          placeholder="0.00"
                          disabled={saving}
                          className="w-full rounded-md border border-slate-200 bg-white px-1.5 py-1.5 text-sm text-right text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-50"
                        />

                        {/* Row total (computed) */}
                        <span className="text-sm text-right text-slate-700 font-medium pr-0.5 tabular-nums">
                          {lineTotal(item).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 2,
                          })}
                        </span>

                        {/* Remove row */}
                        <button
                          type="button"
                          onClick={() => removeItem(item._id)}
                          disabled={saving || values.lineItems.length === 1}
                          title="Remove row"
                          className="flex items-center justify-center rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors disabled:opacity-30"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Grand total footer */}
                <div className="flex items-center justify-end gap-3 px-4 py-2.5 bg-slate-50 rounded-b-xl border-t border-slate-200">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Grand Total
                  </span>
                  <span className="text-sm font-semibold text-slate-800 tabular-nums">
                    {total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="q-desc">Description</Label>
              <Textarea
                id="q-desc"
                rows={2}
                value={values.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Add a description…"
                disabled={saving}
              />
            </div>

            {/* Terms & Conditions */}
            <div>
              <Label htmlFor="q-terms">Terms &amp; Conditions</Label>
              <Textarea
                id="q-terms"
                rows={2}
                value={values.terms}
                onChange={(e) => set('terms', e.target.value)}
                placeholder="Add terms and conditions…"
                disabled={saving}
              />
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-white shrink-0">
            <span className="text-xs text-slate-400">
              Fields marked <span className="text-rose-500">*</span> are required
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {saving
                  ? isEdit ? 'Saving…' : 'Creating…'
                  : isEdit ? 'Save Quote' : 'Create Quote'}
              </Button>
            </div>
          </div>
        </form>

      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function DocumentIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}