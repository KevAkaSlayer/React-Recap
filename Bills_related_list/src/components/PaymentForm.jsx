import { useState } from 'react'
import { toast } from 'sonner'
import { Label } from './ui/Label'
import { Input, Textarea } from './ui/Input'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const PAYMENT_MODES = [
  'Cash',
  'Check',
  'Bank Transfer',
  'Credit Card',
  'Stripe',
  'PayPal',
  'Online Payment',
  'Other',
]

/**
 * Payment recording form for an open bill.
 *
 * Props:
 *   bill        : the bill object (bill_id, bill_number, total, balance, vendor_id)
 *   accounts    : chart of accounts for "Paid Through" dropdown (cash/bank)
 *   submitting  : boolean
 *   formRef     : React ref for form
 *   onSubmit(payload) : called with the vendor payment payload
 */
export function PaymentForm({ bill, accounts, submitting, formRef, onSubmit }) {
  const [form, setForm] = useState({
    amount: bill?.balance ?? bill?.total ?? 0,
    date: todayISO(),
    payment_mode: 'Cash',
    paid_through_account_id: '',
    reference_number: '',
    description: '',
  })

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // Filter accounts to cash/bank types for "Paid Through"
  const paidThroughAccounts = accounts.filter((a) =>
    ['cash', 'bank', 'other_current_asset'].includes(a.account_type)
  )

  function handleSubmit(e) {
    e.preventDefault()

    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) { toast.error('Amount must be greater than 0.'); return }
    if (!form.date) { toast.error('Payment date is required.'); return }
    if (!form.payment_mode) { toast.error('Payment mode is required.'); return }

    const payload = {
      vendor_id: bill.vendor_id,
      amount,
      date: form.date,
      payment_mode: form.payment_mode,
      bills: [
        {
          bill_id: bill.bill_id,
          amount_applied: amount,
        },
      ],
      ...(form.paid_through_account_id && { paid_through_account_id: form.paid_through_account_id }),
      ...(form.reference_number.trim() && { reference_number: form.reference_number.trim() }),
      ...(form.description.trim() && { description: form.description.trim() }),
    }

    console.log('[PaymentForm] submit payload:', payload)
    onSubmit(payload)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Bill info */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Bill</span>
          <span className="font-medium text-slate-800">{bill?.bill_number}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-slate-500">Total</span>
          <span className="text-slate-700">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bill?.total ?? 0)}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-slate-500">Balance Due</span>
          <span className="font-semibold text-rose-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bill?.balance ?? 0)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pay_amount" required>Amount</Label>
          <Input
            id="pay_amount"
            type="number"
            value={form.amount}
            min="0.01"
            step="0.01"
            onChange={(e) => setField('amount', e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <Label htmlFor="pay_date" required>Payment Date</Label>
          <Input
            id="pay_date"
            type="date"
            value={form.date}
            onChange={(e) => setField('date', e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment_mode" required>Payment Mode</Label>
          <select
            id="payment_mode"
            value={form.payment_mode}
            onChange={(e) => setField('payment_mode', e.target.value)}
            disabled={submitting}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
          >
            {PAYMENT_MODES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="paid_through">Paid Through</Label>
          <select
            id="paid_through"
            value={form.paid_through_account_id}
            onChange={(e) => setField('paid_through_account_id', e.target.value)}
            disabled={submitting}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
          >
            <option value="">— Select account —</option>
            {paidThroughAccounts.map((a) => (
              <option key={a.account_id} value={a.account_id}>{a.account_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="pay_ref">Reference #</Label>
        <Input
          id="pay_ref"
          value={form.reference_number}
          onChange={(e) => setField('reference_number', e.target.value)}
          placeholder="Check number, transaction ID…"
          disabled={submitting}
        />
      </div>

      <div>
        <Label htmlFor="pay_desc">Description</Label>
        <Textarea
          id="pay_desc"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Payment notes…"
          disabled={submitting}
        />
      </div>

    </form>
  )
}