import { useRef, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { useBillData } from './hooks/useBillData'
import { useBills } from './hooks/useBills'
import { BillsTable } from './components/BillsTable'
import { BillForm } from './components/BillForm'
import { Modal } from './components/Modal'
import { Spinner } from './components/ui/Spinner'
import { Button } from './components/ui/Button'
import {
  closeWidget,
  getBillDetails,
  createBooksBill,
  updateBooksBill,
  isBooksSuccess,
} from './lib/zoho'

export default function App() {
  // ── Step 1: resolve CRM vendor → Books vendor + load items
  const { vendorName, booksVendorId, items, accounts, loading: initLoading, error: initError } =
    useBillData()

  // ── Step 2: load bills for this Books vendor
  const { bills, loading: billsLoading, error: billsError, refresh: refreshBills } =
    useBills(booksVendorId)

  // ── Modal: null | 'create' | 'edit'
  const [modalMode, setModalMode] = useState(null)
  const [editingBill, setEditingBill] = useState(null)
  const [loadingBill, setLoadingBill] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef(null)

  // Open create modal
  function handleNewBill() {
    console.log('[App] open create modal')
    setEditingBill(null)
    setModalMode('create')
  }

  // Open edit modal — fetch full bill details (includes line_items)
  async function handleEditBill(billId) {
    console.log('[App] open edit modal, billId:', billId)
    setEditingBill(null)
    setModalMode('edit')
    setLoadingBill(true)
    try {
      const bill = await getBillDetails(billId)
      console.log('[App] bill details:', bill)
      setEditingBill(bill)
    } catch (err) {
      console.error('[App] getBillDetails error:', err)
      toast.error('Could not load bill details.')
      setModalMode(null)
    } finally {
      setLoadingBill(false)
    }
  }

  function handleCloseModal() {
    if (submitting) return
    setModalMode(null)
    setEditingBill(null)
  }

  // Create or update bill in Zoho Books
  async function handleSubmit(payload) {
    console.log('[App] submit, mode:', modalMode, 'payload:', payload)
    setSubmitting(true)
    try {
      if (modalMode === 'create') {
        const res = await createBooksBill(payload)
        console.log('[App] createBooksBill response:', res)
        if (!isBooksSuccess(res)) {
          console.error('[App] create failed:', res?.code, res?.message)
          toast.error(res?.message ?? 'Failed to create bill.')
          return
        }
        toast.success(`Bill "${payload.bill_number}" created in Zoho Books!`)
      } else {
        const res = await updateBooksBill(editingBill.bill_id, payload)
        console.log('[App] updateBooksBill response:', res)
        if (!isBooksSuccess(res)) {
          console.error('[App] update failed:', res?.code, res?.message)
          toast.error(res?.message ?? 'Failed to update bill.')
          return
        }
        toast.success(`Bill "${payload.bill_number}" updated successfully!`)
      }
      handleCloseModal()
      refreshBills()
    } catch (err) {
      console.error('[App] handleSubmit error:', err)
      toast.error(err.message ?? 'An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  const defaultVendor = booksVendorId ? { id: booksVendorId, name: vendorName } : null

  const modalTitle =
    modalMode === 'create'
      ? 'New Bill'
      : editingBill
        ? `Edit Bill — ${editingBill.bill_number}`
        : 'Edit Bill'

  const modalFooter = (
    <>
      <span className="text-xs text-slate-400 mr-auto">
        Fields marked <span className="text-rose-500 font-medium">*</span> are required
      </span>
      <Button variant="ghost" type="button" onClick={handleCloseModal} disabled={submitting}>
        Cancel
      </Button>
      <Button
        type="button"
        loading={submitting}
        onClick={() => formRef.current?.requestSubmit()}
      >
        {submitting
          ? modalMode === 'create' ? 'Creating…' : 'Saving…'
          : modalMode === 'create' ? 'Create Bill' : 'Save Changes'}
      </Button>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-4">
      <Toaster position="top-right" richColors closeButton />

      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-200">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-800">Bills</h1>
              <p className="text-xs text-slate-400">
                {vendorName || 'Loading…'} · Zoho Books
              </p>
            </div>
          </div>
          <Button variant="ghost" type="button" onClick={closeWidget}>
            Close
          </Button>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />

          <div className="p-6">

            {/* Loading vendor + Books data */}
            {initLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Spinner size={8} />
                <p className="text-sm text-slate-400">Loading bills…</p>
              </div>
            )}

            {/* Error (SDK fail, vendor not in Books, connector not configured, etc.) */}
            {!initLoading && initError && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-5 flex items-start gap-3">
                <svg className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-rose-800 mb-1">Could not load bills</p>
                  <p className="text-sm text-rose-700">{initError}</p>
                </div>
              </div>
            )}

            {/* Bills table — only shown when vendor is resolved */}
            {!initLoading && !initError && booksVendorId && (
              <BillsTable
                bills={bills}
                loading={billsLoading}
                error={billsError}
                onNewBill={handleNewBill}
                onEditBill={handleEditBill}
                onRefresh={refreshBills}
              />
            )}

          </div>
        </div>

      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalMode !== null}
        onClose={handleCloseModal}
        title={modalTitle}
        size="xl"
        footer={modalFooter}
      >
        {modalMode === 'edit' && loadingBill && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size={8} />
            <p className="text-sm text-slate-400">Loading bill details…</p>
          </div>
        )}

        {(modalMode === 'create' || (modalMode === 'edit' && editingBill)) && (
          <BillForm
            mode={modalMode}
            initialData={editingBill}
            defaultVendor={defaultVendor}
            items={items}
            accounts={accounts}
            submitting={submitting}
            formRef={formRef}
            onSubmit={handleSubmit}
          />
        )}
      </Modal>

    </div>
  )
}
