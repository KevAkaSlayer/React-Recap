/**
 * Zoho SDK + Books API layer.
 *
 * Every Books call goes through booksRequest() which handles:
 *   - URL construction with organization_id
 *   - CONNECTION.invoke call
 *   - Response parsing (res.details.statusMessage)
 *
 * Connection: "zoho_books_testing" | Org: 771340721
 */

const ZOHO = window.ZOHO
const ORG_ID = '771340721'
const CONN_NAME = 'zoho_books_testing'
const BASE = 'https://www.zohoapis.com/books/v3'

// ── Core helper ──────────────────────────────────────────────────────────────

/**
 * @param {'GET'|'POST'|'PUT'} method
 * @param {string} path - e.g. "bills", "bills/123", "bills/123/status/open"
 * @param {object} [data] - GET: query params | POST/PUT: JSON body
 */
async function booksRequest(method, path, data) {
  const isWrite = method === 'POST' || method === 'PUT'

  // Build URL: always includes organization_id; GET params appended to URL
  let url = `${BASE}/${path}?organization_id=${ORG_ID}`
  if (!isWrite && data) {
    const qs = Object.entries(data)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    if (qs) url += '&' + qs
  }

  const req_data = {
    url,
    method,
    param_type: 1,
    parameters: isWrite ? { JSONString: JSON.stringify(data ?? {}) } : {},
  }

  console.log(`[Books] ${method} /${path}`)

  const res = await ZOHO.CRM.CONNECTION.invoke(CONN_NAME, req_data)

  if (res?.code !== 'SUCCESS') {
    console.error('[Books] connection failed:', res)
    throw new Error(res?.message ?? 'Connection invoke failed')
  }

  // Actual Books JSON lives in res.details.statusMessage
  const sm = res.details?.statusMessage
  if (typeof sm === 'string') {
    try { return JSON.parse(sm) } catch { return sm }
  }
  return sm ?? {}
}

// ── Success check ────────────────────────────────────────────────────────────

export function isBooksSuccess(res) {
  return res?.code === 0
}

// ── CRM SDK ──────────────────────────────────────────────────────────────────

export function initSDK() {
  return new Promise((resolve) => {
    ZOHO.embeddedApp.on('PageLoad', (data) => {
      console.log('[SDK] PageLoad:', data)
      resolve(data)
    })
    ZOHO.embeddedApp.init()
  })
}

export async function getCRMVendor(recordId) {
  const res = await ZOHO.CRM.API.getRecord({ Entity: 'Vendors', RecordID: recordId })
  return res?.data?.[0] ?? null
}

// ── Items & Accounts ─────────────────────────────────────────────────────────

export async function getBooksItems() {
  const res = await booksRequest('GET', 'items')
  console.log('[Books] items:', res?.items?.length)
  return res?.items ?? []
}

export async function getBooksAccounts() {
  const res = await booksRequest('GET', 'chartofaccounts', { filter_by: 'AccountType.Active' })
  console.log('[Books] accounts:', res?.chartofaccounts?.length)
  return res?.chartofaccounts ?? []
}

// ── Bills ────────────────────────────────────────────────────────────────────

export async function getBillsList(vendorId) {
  const res = await booksRequest('GET', 'bills')
  const all = res?.bills ?? []
  const vid = String(vendorId)
  const matched = all.filter((b) => String(b.vendor_id) === vid)
  console.log('[Books] bills:', matched.length, '/', all.length, 'for vendor', vid)
  return matched
}

export async function getBillDetails(billId) {
  const res = await booksRequest('GET', `bills/${billId}`)
  return res?.bill ?? null
}

export async function createBooksBill(payload) {
  return booksRequest('POST', 'bills', payload)
}

export async function updateBooksBill(billId, payload) {
  return booksRequest('PUT', `bills/${billId}`, payload)
}

export async function markBillOpen(billId) {
  return booksRequest('POST', `bills/${billId}/status/open`)
}

// ── Purchase Orders ──────────────────────────────────────────────────────────

export async function getPurchaseOrdersList(vendorId) {
  const res = await booksRequest('GET', 'purchaseorders')
  const all = res?.purchaseorders ?? []
  const vid = String(vendorId)
  const matched = all.filter((po) => String(po.vendor_id) === vid)
  console.log('[Books] POs:', matched.length, '/', all.length, 'for vendor', vid)
  return matched
}

export async function getPurchaseOrderDetails(poId) {
  const res = await booksRequest('GET', `purchaseorders/${poId}`)
  return res?.purchaseorder ?? null
}

export async function createPurchaseOrder(payload) {
  return booksRequest('POST', 'purchaseorders', payload)
}

export async function updatePurchaseOrder(poId, payload) {
  return booksRequest('PUT', `purchaseorders/${poId}`, payload)
}

export async function markPOOpen(poId) {
  return booksRequest('POST', `purchaseorders/${poId}/status/open`)
}

export async function markPOBilled(poId) {
  return booksRequest('POST', `purchaseorders/${poId}/status/billed`)
}

export async function markPOCancelled(poId) {
  return booksRequest('POST', `purchaseorders/${poId}/status/cancelled`)
}

// ── Vendor Payments ──────────────────────────────────────────────────────────

export async function createVendorPayment(payload) {
  return booksRequest('POST', 'vendorpayments', payload)
}