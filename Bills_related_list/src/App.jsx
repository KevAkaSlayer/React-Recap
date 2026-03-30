import { useRef, useState, useMemo } from 'react'
import { Toaster, toast } from 'sonner'
import { useBillData } from './hooks/useBillData'
import { useBills } from './hooks/useBills'
import { usePurchaseOrders } from './hooks/usePurchaseOrders'
import { BillsTable } from './components/BillsTable'
import { BillForm } from './components/BillForm'
import { PurchaseOrdersTable } from './components/PurchaseOrdersTable'
import { PurchaseOrderForm } from './components/PurchaseOrderForm'
import { PaymentForm } from './components/PaymentForm'
import { Modal } from './components/Modal'
import { Spinner } from './components/ui/Spinner'
import { Button } from './components/ui/Button'
import {
  getBillDetails,
  createBooksBill,
  updateBooksBill,
  markBillOpen,
  getPurchaseOrderDetails,
  createPurchaseOrder,
  updatePurchaseOrder,
  markPOOpen,
  markPOBilled,
  createVendorPayment,
  isBooksSuccess,
} from './lib/zoho'

function todayISO() { return new Date().toISOString().slice(0, 10) }

// ── Detect which view from the URL path ───────────────────────────────────────
//   localhost:3000/bills           → bills
//   localhost:3000/purchase-order  → purchase orders
function getView() {
  const path = window.location.pathname
  if (path.includes('/purchase-order')) return 'po'
  return 'bills' // default
}

export default function App() {
  const view = useMemo(getView, []) // 'bills' or 'po'

  // ── Shared data: vendor, items, accounts (loaded once)
  const { vendorName, booksVendorId, items, accounts, loading: initLoading, error: initError } =
    useBillData()

  // ── Bills data
  const { bills, loading: billsLoading, error: billsError, refresh: refreshBills } =
    useBills(booksVendorId)

  // ── Purchase Orders data
  const { orders, loading: poLoading, error: poError, refresh: refreshPOs } =
    usePurchaseOrders(booksVendorId)

  // ── Modal state (shared for bills + POs)
  const [modal, setModal] = useState(null)
  // modal shape: { type: 'bill-create'|'bill-edit'|'po-create'|'po-edit'|'payment', data?: any }
  const [editData, setEditData] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef(null)
  const saveStatusRef = useRef('draft')

  // ── Payment modal
  const [paymentBill, setPaymentBill] = useState(null)
  const [paymentSubmitting, setPaymentSubmitting] = useState(false)
  const paymentFormRef = useRef(null)

  const defaultVendor = booksVendorId ? { id: booksVendorId, name: vendorName } : null

  // ── Modal helpers ──────────────────────────────────────────────────────────

  function openModal(type, data) {
    setEditData(data ?? null)
    setModal(type)
  }

  function closeModal() {
    if (submitting) return
    setModal(null)
    setEditData(null)
  }

  // ── Bill handlers ──────────────────────────────────────────────────────────

  function handleNewBill() { openModal('bill-create') }

  async function handleEditBill(billId) {
    openModal('bill-edit')
    setLoadingDetail(true)
    try {
      const bill = await getBillDetails(billId)
      setEditData(bill)
    } catch (err) {
      console.error('[App] getBillDetails error:', err)
      toast.error('Could not load bill details.')
      setModal(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  async function handleMarkBillOpen(billId) {
    toast.info('Marking bill as open…')
    try {
      const res = await markBillOpen(billId)
      if (!isBooksSuccess(res)) { toast.error(res?.message ?? 'Failed.'); return }
      toast.success('Bill marked as open!')
      refreshBills()
    } catch (err) {
      toast.error(err.message ?? 'Failed to mark bill as open.')
    }
  }

  async function handleBillSubmit(payload) {
    const status = saveStatusRef.current
    setSubmitting(true)
    try {
      if (modal === 'bill-create') {
        const res = await createBooksBill(payload)
        if (!isBooksSuccess(res)) { toast.error(res?.message ?? 'Failed to create bill.'); return }
        if (status === 'open' && res.bill?.bill_id) {
          const openRes = await markBillOpen(res.bill.bill_id)
          if (!isBooksSuccess(openRes)) toast.error('Bill created but could not mark as open.')
        }
        toast.success(`Bill "${payload.bill_number}" ${status === 'open' ? 'created & opened' : 'saved as draft'}!`)
      } else {
        const res = await updateBooksBill(editData.bill_id, payload)
        if (!isBooksSuccess(res)) { toast.error(res?.message ?? 'Failed to update bill.'); return }
        toast.success(`Bill "${payload.bill_number}" updated!`)
      }
      closeModal()
      refreshBills()
    } catch (err) {
      toast.error(err.message ?? 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Payment handlers ───────────────────────────────────────────────────────

  function handleRecordPayment(bill) { setPaymentBill(bill) }
  function closePayment() { if (!paymentSubmitting) setPaymentBill(null) }

  async function handlePaymentSubmit(payload) {
    setPaymentSubmitting(true)
    try {
      const res = await createVendorPayment(payload)
      if (!isBooksSuccess(res)) { toast.error(res?.message ?? 'Failed to record payment.'); return }
      toast.success('Payment recorded!')
      setPaymentBill(null)
      refreshBills()
    } catch (err) {
      toast.error(err.message ?? 'Failed to record payment.')
    } finally {
      setPaymentSubmitting(false)
    }
  }

  // ── PO handlers ────────────────────────────────────────────────────────────

  function handleNewPO() { openModal('po-create') }

  async function handleEditPO(poId) {
    openModal('po-edit')
    setLoadingDetail(true)
    try {
      const po = await getPurchaseOrderDetails(poId)
      setEditData(po)
    } catch (err) {
      console.error('[App] getPurchaseOrderDetails error:', err)
      toast.error('Could not load PO details.')
      setModal(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  async function handleMarkPOOpen(poId) {
    toast.info('Marking PO as open…')
    try {
      const res = await markPOOpen(poId)
      if (!isBooksSuccess(res)) { toast.error(res?.message ?? 'Failed.'); return }
      toast.success('PO marked as open!')
      refreshPOs()
    } catch (err) {
      toast.error(err.message ?? 'Failed to mark PO as open.')
    }
  }

  async function handlePOSubmit(payload) {
    const status = saveStatusRef.current
    setSubmitting(true)
    try {
      if (modal === 'po-create') {
        const res = await createPurchaseOrder(payload)
        if (!isBooksSuccess(res)) { toast.error(res?.message ?? 'Failed to create PO.'); return }
        if (status === 'open' && res.purchaseorder?.purchaseorder_id) {
          const openRes = await markPOOpen(res.purchaseorder.purchaseorder_id)
          if (!isBooksSuccess(openRes)) toast.error('PO created but could not mark as open.')
        }
        toast.success(`PO "${payload.purchaseorder_number}" ${status === 'open' ? 'created & opened' : 'saved as draft'}!`)
      } else {
        const res = await updatePurchaseOrder(editData.purchaseorder_id, payload)
        if (!isBooksSuccess(res)) { toast.error(res?.message ?? 'Failed to update PO.'); return }
        toast.success(`PO "${payload.purchaseorder_number}" updated!`)
      }
      closeModal()
      refreshPOs()
    } catch (err) {
      toast.error(err.message ?? 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Convert PO to Bill ──────────────────────────────────────────────────────

  const [convertingPO, setConvertingPO] = useState(null) // the PO being converted

  async function handleConvertToBill(po) {
    console.log('[App] convert PO to bill:', po.purchaseorder_number)
    // Fetch full PO details to get line items
    setLoadingDetail(true)
    try {
      const fullPO = await getPurchaseOrderDetails(po.purchaseorder_id)
      // Pre-fill bill data from PO
      const billData = {
        vendor_id: fullPO.vendor_id,
        vendor_name: fullPO.vendor_name,
        bill_number: '',
        date: todayISO(),
        due_date: '',
        reference_number: fullPO.purchaseorder_number,
        notes: fullPO.notes ?? '',
        line_items: (fullPO.line_items ?? []).map((li) => ({
          ...li,
          line_item_id: undefined, // new bill line items, not existing
        })),
      }
      setConvertingPO(fullPO)
      setEditData(billData)
      setModal('po-to-bill')
    } catch (err) {
      console.error('[App] convert PO error:', err)
      toast.error('Could not load PO details for conversion.')
    } finally {
      setLoadingDetail(false)
    }
  }

  async function handleConvertSubmit(payload) {
    const status = saveStatusRef.current
    const poId = convertingPO?.purchaseorder_id
    const poNumber = convertingPO?.purchaseorder_number
    setSubmitting(true)
    try {
      console.log('[App] converting PO to bill — desired bill status:', status, 'poId:', poId)

      // Step 1: Create the bill (always WITHOUT purchaseorder_ids so it stays draft)
      const res = await createBooksBill(payload)
      console.log('[App] createBooksBill result:', res)
      if (!isBooksSuccess(res)) { toast.error(res?.message ?? 'Failed to create bill.'); return }

      const billId = res.bill?.bill_id
      console.log('[App] bill created, id:', billId, 'status:', res.bill?.status)

      // Step 2: If user wants open → mark bill as open
      if (status === 'open' && billId) {
        console.log('[App] marking bill as open...')
        const openRes = await markBillOpen(billId)
        console.log('[App] markBillOpen result:', openRes)
        if (!isBooksSuccess(openRes)) {
          toast.error('Bill created as draft but could not mark as open.')
        }
      }

      // Step 3: Mark PO as billed
      if (poId) {
        console.log('[App] marking PO as billed...')
        try {
          const billedRes = await markPOBilled(poId)
          console.log('[App] markPOBilled result:', billedRes)
          if (!isBooksSuccess(billedRes)) {
            toast.error('Bill created but PO could not be marked as billed: ' + (billedRes?.message ?? 'Unknown error'))
          }
        } catch (poErr) {
          console.error('[App] markPOBilled error:', poErr)
          toast.error('Bill created but PO status update failed: ' + poErr.message)
        }
      }

      const label = status === 'open' ? 'open' : 'draft'
      toast.success(`${label.charAt(0).toUpperCase() + label.slice(1)} bill created from PO "${poNumber}"!`)
      setConvertingPO(null)
      closeModal()
      await Promise.all([refreshPOs(), refreshBills()])
    } catch (err) {
      console.error('[App] handleConvertSubmit error:', err)
      toast.error(err.message ?? 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Modal config ───────────────────────────────────────────────────────────

  const isBillModal = modal === 'bill-create' || modal === 'bill-edit' || modal === 'po-to-bill'
  const isPOModal = modal === 'po-create' || modal === 'po-edit'
  const isCreate = modal === 'bill-create' || modal === 'po-create' || modal === 'po-to-bill'

  const modalTitle = modal === 'po-to-bill'
    ? `Convert to Bill — ${convertingPO?.purchaseorder_number ?? ''}`
    : isBillModal
      ? (modal === 'bill-create' ? 'New Bill' : `Edit Bill — ${editData?.bill_number ?? ''}`)
      : isPOModal
        ? (modal === 'po-create' ? 'New Purchase Order' : `Edit PO — ${editData?.purchaseorder_number ?? ''}`)
        : ''

  function createFooterButtons() {
    return (
      <>
        <span className="text-xs text-slate-400 mr-auto">
          Fields marked <span className="text-rose-500 font-medium">*</span> are required
        </span>
        <Button variant="ghost" type="button" onClick={closeModal} disabled={submitting}>Cancel</Button>
        {isCreate ? (
          <>
            <Button type="button" variant="outline" disabled={submitting}
              loading={submitting && saveStatusRef.current === 'draft'}
              onClick={() => { saveStatusRef.current = 'draft'; formRef.current?.requestSubmit() }}>
              {submitting && saveStatusRef.current === 'draft' ? 'Saving…' : 'Save as Draft'}
            </Button>
            <Button type="button" disabled={submitting}
              loading={submitting && saveStatusRef.current === 'open'}
              onClick={() => { saveStatusRef.current = 'open'; formRef.current?.requestSubmit() }}>
              {submitting && saveStatusRef.current === 'open' ? 'Saving…' : 'Save as Open'}
            </Button>
          </>
        ) : (
          <Button type="button" loading={submitting} onClick={() => formRef.current?.requestSubmit()}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        )}
      </>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-4">
      <Toaster position="top-right" richColors closeButton />

      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-200">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-800">
              {view === 'bills' ? 'Bills' : 'Purchase Orders'}
            </h1>
            <p className="text-xs text-slate-400">{vendorName || 'Loading…'} · Zoho Books</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />

          <div className="p-6">

            {/* Loading */}
            {initLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Spinner size={8} />
                <p className="text-sm text-slate-400">Loading…</p>
              </div>
            )}

            {/* Error */}
            {!initLoading && initError && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-5 flex items-start gap-3">
                <svg className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-rose-700">{initError}</p>
              </div>
            )}

            {/* Content */}
            {!initLoading && !initError && booksVendorId && view === 'bills' && (
              <BillsTable
                bills={bills}
                loading={billsLoading}
                error={billsError}
                onNewBill={handleNewBill}
                onEditBill={handleEditBill}
                onRefresh={refreshBills}
                onMarkOpen={handleMarkBillOpen}
                onRecordPayment={handleRecordPayment}
              />
            )}

            {!initLoading && !initError && booksVendorId && view === 'po' && (
              <PurchaseOrdersTable
                orders={orders}
                bills={bills}
                loading={poLoading}
                error={poError}
                onNewPO={handleNewPO}
                onEditPO={handleEditPO}
                onRefresh={() => { refreshPOs(); refreshBills() }}
                onMarkOpen={handleMarkPOOpen}
                onConvertToBill={handleConvertToBill}
              />
            )}

          </div>
        </div>
      </div>

      {/* Bill / PO Create-Edit Modal */}
      <Modal
        open={isBillModal || isPOModal}
        onClose={closeModal}
        title={modalTitle}
        size="xl"
        footer={createFooterButtons()}
      >
        {(modal === 'bill-edit' || modal === 'po-edit' || (modal === 'po-to-bill' && !editData)) && loadingDetail && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size={8} />
            <p className="text-sm text-slate-400">Loading details…</p>
          </div>
        )}

        {/* Bill form (create, edit, or convert from PO) */}
        {isBillModal && (isCreate || editData) && !loadingDetail && (
          <BillForm
            mode={isCreate ? 'create' : 'edit'}
            initialData={editData}
            defaultVendor={defaultVendor}
            items={items}
            accounts={accounts}
            submitting={submitting}
            formRef={formRef}
            onSubmit={modal === 'po-to-bill' ? handleConvertSubmit : handleBillSubmit}
          />
        )}

        {/* PO form */}
        {isPOModal && (isCreate || editData) && !loadingDetail && (
          <PurchaseOrderForm
            mode={isCreate ? 'create' : 'edit'}
            initialData={editData}
            defaultVendor={defaultVendor}
            items={items}
            accounts={accounts}
            existingOrders={orders}
            submitting={submitting}
            formRef={formRef}
            onSubmit={handlePOSubmit}
          />
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        open={paymentBill !== null}
        onClose={closePayment}
        title={paymentBill ? `Record Payment — ${paymentBill.bill_number}` : 'Record Payment'}
        size="md"
        footer={
          <>
            <span className="text-xs text-slate-400 mr-auto">
              Fields marked <span className="text-rose-500 font-medium">*</span> are required
            </span>
            <Button variant="ghost" type="button" onClick={closePayment} disabled={paymentSubmitting}>Cancel</Button>
            <Button type="button" loading={paymentSubmitting} onClick={() => paymentFormRef.current?.requestSubmit()}>
              {paymentSubmitting ? 'Recording…' : 'Record Payment'}
            </Button>
          </>
        }
      >
        {paymentBill && (
          <PaymentForm
            bill={paymentBill}
            accounts={accounts}
            submitting={paymentSubmitting}
            formRef={paymentFormRef}
            onSubmit={handlePaymentSubmit}
          />
        )}
      </Modal>

    </div>
  )
}