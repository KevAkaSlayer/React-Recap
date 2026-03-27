import { useRef } from 'react'
import { Toaster } from 'sonner'
import { useZohoDeal } from './hooks/useZohoDeal'
import { DealForm } from './components/DealForm/DealForm'
import { Spinner } from './components/ui/Spinner'
import { Button } from './components/ui/Button'
import { closeWidget, closeWidgetAndReload } from './lib/zoho'

export default function App() {
  const { deal, loading, saving, error, saveDeal } = useZohoDeal()
  const formRef = useRef(null)

  const showContent = !loading && !error && deal

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-4">
      <Toaster position="top-right" richColors closeButton />

      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-sm font-semibold text-slate-800">
              {deal?.Deal_Name ?? 'Deal Details'}
            </h1>
            <p className="text-xs text-slate-400">Zoho CRM · Deals</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          {/* Brand accent bar */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-500" />

          <div className="p-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Spinner size={8} />
                <p className="text-sm text-slate-400">Loading deal…</p>
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-100 p-4">
                <svg className="h-5 w-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            {showContent && (
              <DealForm
                deal={deal}
                saving={saving}
                onSave={saveDeal}
                formRef={formRef}
                onSaveSuccess={closeWidgetAndReload}
              />
            )}

            {!loading && !error && !deal && (
              <p className="py-10 text-center text-sm text-slate-400">No deal record found.</p>
            )}
          </div>
        </div>

        {/* Global footer */}
        {showContent && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white border border-slate-100 px-5 py-3.5 shadow-sm">
            <span className="text-xs text-slate-400 mr-auto">
              Fields marked <span className="text-rose-500 font-medium">*</span> are required
            </span>
            <Button variant="ghost" type="button" onClick={closeWidget} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="button"
              loading={saving}
              onClick={() => formRef.current?.requestSubmit()}
            >
              {saving ? 'Updating…' : 'Update Deal'}
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}