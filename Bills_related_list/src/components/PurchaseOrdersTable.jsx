import { Spinner } from './ui/Spinner'
import { Button } from './ui/Button'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const STATUS = {
  draft:            { label: 'Draft',            cls: 'bg-slate-100 text-slate-600' },
  open:             { label: 'Open',             cls: 'bg-blue-50 text-blue-700' },
  billed:           { label: 'Billed',           cls: 'bg-emerald-50 text-emerald-700' },
  partially_billed: { label: 'Partially Billed', cls: 'bg-amber-50 text-amber-700' },
  cancelled:        { label: 'Cancelled',        cls: 'bg-rose-50 text-rose-600' },
  closed:           { label: 'Closed',           cls: 'bg-slate-100 text-slate-400' },
  issued:           { label: 'Issued',           cls: 'bg-indigo-50 text-indigo-700' },
  overdue:          { label: 'Overdue',          cls: 'bg-rose-50 text-rose-700' },
  pending_approval: { label: 'Pending Approval', cls: 'bg-amber-50 text-amber-700' },
}

const NON_EDITABLE = new Set(['billed', 'cancelled', 'closed'])

function StatusBadge({ status }) {
  const s = STATUS[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  )
}

export function PurchaseOrdersTable({ orders, bills, loading, error, onNewPO, onEditPO, onRefresh, onMarkOpen, onConvertToBill }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner size={8} />
        <p className="text-sm text-slate-400">Syncing purchase orders from Zoho Books…</p>
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
          {orders.length} order{orders.length !== 1 ? 's' : ''}
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
          <Button onClick={onNewPO}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New PO
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-slate-200">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">No purchase orders yet</p>
          <p className="text-xs text-slate-400 mb-4">No POs found for this vendor in Zoho Books.</p>
          <Button onClick={onNewPO}>Create First PO</Button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">PO #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Delivery Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Total</th>
                <th className="w-40" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((po) => {
                const editable = !NON_EDITABLE.has(po.status)
                // Find bills linked to this PO (by reference_number matching PO number)
                const linkedBills = (bills ?? []).filter(
                  (b) => b.reference_number === po.purchaseorder_number
                )
                return (
                  <tr
                    key={po.purchaseorder_id}
                    className={`hover:bg-slate-50/60 transition ${editable ? 'cursor-pointer' : ''}`}
                    onClick={() => editable && onEditPO(po.purchaseorder_id)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">{po.purchaseorder_number}</span>
                      {linkedBills.length > 0 && (
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {linkedBills.map((b) => (
                            <span key={b.bill_id} className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                              </svg>
                              {b.bill_number}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{po.date}</td>
                    <td className="px-4 py-3 text-slate-600">{po.delivery_date || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={po.status} /></td>
                    <td className="px-4 py-3 text-right text-slate-700 font-medium">{fmt.format(po.total ?? 0)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {po.status === 'draft' && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onMarkOpen(po.purchaseorder_id) }}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                          >
                            Mark Open
                          </button>
                        )}
                        {(po.status === 'open' || po.status === 'partially_billed') && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onConvertToBill(po) }}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                          >
                            Convert to Bill
                          </button>
                        )}
                        {editable && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onEditPO(po.purchaseorder_id) }}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                          >
                            Edit
                          </button>
                        )}
                        {!editable && (
                          <span className="text-xs text-slate-400">View only</span>
                        )}
                      </div>
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