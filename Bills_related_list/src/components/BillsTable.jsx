import { Spinner } from './ui/Spinner'
import { Button } from './ui/Button'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const STATUS = {
  draft:    { label: 'Draft',    cls: 'bg-slate-100 text-slate-600' },
  open:     { label: 'Open',     cls: 'bg-blue-50 text-blue-700' },
  overdue:  { label: 'Overdue',  cls: 'bg-rose-50 text-rose-700' },
  paid:     { label: 'Paid',     cls: 'bg-emerald-50 text-emerald-700' },
  void:     { label: 'Void',     cls: 'bg-slate-100 text-slate-400' },
  pending_approval: { label: 'Pending', cls: 'bg-amber-50 text-amber-700' },
}

const NON_EDITABLE = new Set(['paid', 'void'])

function StatusBadge({ status }) {
  const s = STATUS[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  )
}

export function BillsTable({ bills, loading, error, onNewBill, onEditBill, onRefresh }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner size={8} />
        <p className="text-sm text-slate-400">Syncing bills from Zoho Books…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-100 p-4">
        <svg className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-rose-700">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {bills.length} bill{bills.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Refresh"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <Button onClick={onNewBill}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Bill
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {bills.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-slate-200">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">No bills yet</p>
          <p className="text-xs text-slate-400 mb-4">No bills found for this vendor in Zoho Books.</p>
          <Button onClick={onNewBill}>Create First Bill</Button>
        </div>
      ) : (
        /* Bills table */
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Bill #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Total</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Balance</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.map((bill) => {
                const editable = !NON_EDITABLE.has(bill.status)
                return (
                  <tr
                    key={bill.bill_id}
                    className={`hover:bg-slate-50/60 transition ${editable ? 'cursor-pointer' : ''}`}
                    onClick={() => editable && onEditBill(bill.bill_id)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">{bill.bill_number}</td>
                    <td className="px-4 py-3 text-slate-600">{bill.date}</td>
                    <td className="px-4 py-3 text-slate-600">{bill.due_date || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={bill.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 font-medium">
                      {fmt.format(bill.total ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {fmt.format(bill.balance ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editable ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onEditBill(bill.bill_id) }}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                        >
                          Edit
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">View only</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
