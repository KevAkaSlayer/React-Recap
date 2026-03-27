import { useState } from 'react'
import { toast } from 'sonner'
import { useQuotes } from '../../hooks/useQuotes'
import { QuoteModal } from './QuoteModal'
import { Spinner } from '../ui/Spinner'

export function QuoteSection({ deal }) {
  const dealId = deal?.id
  const { quotes, loading, error, saveQuote, removeQuote } = useQuotes(dealId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingQuote, setEditingQuote] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // ── Handlers ──────────────────────────────────────────────────────────────

  function openCreate() {
    setEditingQuote(null)
    setModalOpen(true)
  }

  function openEdit(quote) {
    setEditingQuote(quote)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingQuote(null)
  }

  async function handleSave(fields, quoteId) {
    setSaving(true)
    const result = await saveQuote(fields, quoteId)
    setSaving(false)
    if (result.success) {
      toast.success(quoteId ? 'Quote updated successfully!' : 'Quote created successfully!')
    } else {
      toast.error(result.message ?? 'Something went wrong.')
    }
    return result
  }

  async function performDelink(quoteId) {
    setDeletingId(quoteId)
    const result = await removeQuote(quoteId)
    setDeletingId(null)
    if (result.success) {
      toast.success('Quote delinked successfully.')
    } else {
      toast.error(result.message ?? 'Failed to delink quote.')
    }
  }

  function handleDelete(quote) {
    toast.warning(`Delink "${quote.Subject}" from this deal?`, {
      action: { label: 'Yes, delink', onClick: () => performDelink(quote.id) },
      cancel: { label: 'Keep' },
      duration: 8000,
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mt-6 pt-6 border-t border-slate-100">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DocumentIcon className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-700">Quotes</h2>
          {!loading && quotes.length > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold px-1.5">
              {quotes.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Create Quote
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8 gap-2">
          <Spinner size={5} />
          <span className="text-sm text-slate-400">Loading quotes…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2.5">
          <AlertIcon className="h-4 w-4 text-rose-500 shrink-0" />
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      )}

      {/* Empty state — only show when no quotes exist */}
      {!loading && !error && quotes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-dashed border-slate-200 py-8 px-4 text-center">
          <DocumentIcon className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-500">No quotes yet</p>
          <p className="text-xs text-slate-400 mt-0.5">Click "Create Quote" to add one to this deal.</p>
        </div>
      )}

      {/* Quotes table */}
      {!loading && !error && quotes.length > 0 && (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_120px_120px_72px] bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
            <span>Subject</span>
            <span>Stage</span>
            <span className="text-right">Grand Total</span>
            <span className="text-center">Actions</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {quotes.map((quote) => {
              const isDeleting = deletingId === quote.id
              return (
                <div
                  key={quote.id}
                  className={`grid grid-cols-[1fr_120px_120px_72px] items-center px-4 py-3 text-sm transition-colors hover:bg-slate-50 ${isDeleting ? 'opacity-50' : ''}`}
                >
                  {/* Subject */}
                  <span className="font-medium text-slate-800 truncate pr-3">
                    {quote.Subject ?? '—'}
                  </span>

                  {/* Stage */}
                  <span>
                    <StageBadge stage={quote.Quote_Stage} />
                  </span>

                  {/* Grand Total */}
                  <span className="text-right text-slate-700 font-medium tabular-nums">
                    {quote.Grand_Total != null
                      ? Number(quote.Grand_Total).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })
                      : '—'}
                  </span>

                  {/* Action icons */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(quote)}
                      disabled={isDeleting}
                      title="Edit quote"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors disabled:opacity-40"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(quote)}
                      disabled={isDeleting}
                      title="Delink quote"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors disabled:opacity-40"
                    >
                      {isDeleting ? (
                        <Spinner size={4} />
                      ) : (
                        <UnlinkIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <QuoteModal
          deal={deal}
          quote={editingQuote}
          saving={saving}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

// ── Stage badge ────────────────────────────────────────────────────────────────

const STAGE_COLORS = {
  Draft: 'bg-slate-100 text-slate-600',
  Negotiation: 'bg-amber-100 text-amber-700',
  Delivered: 'bg-blue-100 text-blue-700',
  'On Delivery': 'bg-cyan-100 text-cyan-700',
  Invoiced: 'bg-purple-100 text-purple-700',
  Accepted: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-600',
  Cancelled: 'bg-slate-100 text-slate-500',
}

function StageBadge({ stage }) {
  const cls = STAGE_COLORS[stage] ?? 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {stage ?? 'Draft'}
    </span>
  )
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function DocumentIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
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

function EditIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function UnlinkIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}

function AlertIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}