/**
 * Zoho SDK wrappers for CRM + Zoho Books.
 *
 * All Books API calls use ZOHO.CRM.CONNECTION.invoke("zoho_books_testing", req_data).
 * No API actions need to be pre-configured inside the connection — only the
 * OAuth connection itself ("zoho_books_testing") needs to exist in:
 *   Zoho CRM → Settings → Developer Space → Connections
 *
 * org_id : 771340721
 */

export const ZOHO = window.ZOHO

const ORG_ID    = '771340721'
const CONN_NAME = 'zoho_books_testing'
const BASE_URL  = 'https://www.zohoapis.com/books/v3'

// ─────────────────────────────────────────────────────────────────────────────
// Core HTTP helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Make a Zoho Books API call through the CRM connection.
 *
 * @param {'GET'|'POST'|'PUT'|'DELETE'} method
 * @param {string}  path    e.g. "contacts", "bills", "bills/123"
 * @param {object}  params  URL query params (always includes organization_id)
 * @param {object|null} body  JSON body for POST / PUT (null for GET/DELETE)
 */
async function booksAPI({ method = 'GET', path, params = {}, body = null }) {
  // For POST/PUT: put organization_id in the URL query string so it's always present
  // and pass the JSON payload via parameters with param_type 2 (body).
  // For GET/DELETE: everything goes as query params with param_type 1.

  const isWrite = method === 'POST' || method === 'PUT'

  const url = isWrite
    ? `${BASE_URL}/${path}?organization_id=${ORG_ID}`
    : `${BASE_URL}/${path}`

  const req_data = {
    url,
    method,
    headers: { 'Content-Type': 'application/json' },
    // param_type 1 = URL query params (GET)
    // param_type 3 = raw JSON body (POST/PUT to JSON APIs like Zoho Books)
    param_type: isWrite ? 3 : 1,
    parameters: isWrite
      ? JSON.stringify(body ?? {})
      : { organization_id: ORG_ID, ...params },
  }

  console.log(`[booksAPI] ${method} /${path}`, req_data)

  const res = await ZOHO.CRM.CONNECTION.invoke(CONN_NAME, req_data)

  console.log(`[booksAPI] ${method} /${path} raw response:`, JSON.stringify(res, null, 2))
  console.log(`[booksAPI] res.code:`, res?.code)
  console.log(`[booksAPI] res.details type:`, typeof res?.details)
  console.log(`[booksAPI] res.details:`, res?.details)

  // CONNECTION.invoke wraps the actual API response inside res.details.
  // res.code === 'SUCCESS' means the connection call itself worked.
  if (res?.code !== 'SUCCESS') {
    throw new Error(`Connection error (code: ${res?.code}): ${res?.message ?? JSON.stringify(res)}`)
  }

  // res.details can be:
  //   A) The Books JSON object directly          → { code: 0, contacts: [...], ... }
  //   B) A JSON string of the Books response     → '{"code":0,"contacts":[...]}'
  //   C) A wrapper object with a .body property  → { statusCode: 200, body: '{"code":0,...}' }
  const details = res.details

  // Case C: { statusCode, body, headers }
  if (details && typeof details === 'object' && 'body' in details) {
    console.log(`[booksAPI] detected wrapper — res.details.body:`, details.body)
    const body = details.body
    if (typeof body === 'string') {
      try { return JSON.parse(body) } catch { return body }
    }
    return body
  }

  // Case B: plain JSON string
  if (typeof details === 'string') {
    try { return JSON.parse(details) } catch { return details }
  }

  // Case A: already a plain object
  return details ?? res
}

// ─────────────────────────────────────────────────────────────────────────────
// Zoho Books API success check
// ─────────────────────────────────────────────────────────────────────────────

/** Books API returns code:0 on success */
export function isBooksSuccess(res) {
  return res?.code === 0
}

// ─────────────────────────────────────────────────────────────────────────────
// CRM widget lifecycle
// ─────────────────────────────────────────────────────────────────────────────

export function closeWidget() {
  return ZOHO.CRM.UI.Popup.close()
}

export function closeWidgetAndReload() {
  return ZOHO.CRM.UI.Popup.closeReload()
}

export function initSDK() {
  return new Promise((resolve) => {
    ZOHO.embeddedApp.on('PageLoad', (data) => {
      console.log('[initSDK] PageLoad:', data)
      resolve(data)
    })
    ZOHO.embeddedApp.init()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// CRM Vendor record
// ─────────────────────────────────────────────────────────────────────────────

export function getCRMVendor(recordId) {
  console.log('[getCRMVendor] recordId:', recordId)
  return ZOHO.CRM.API.getRecord({ Entity: 'Vendors', RecordID: recordId }).then((res) => {
    console.log('[getCRMVendor] response:', res)
    return res?.data?.[0] ?? null
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Zoho Books — Vendors (contacts)
// ─────────────────────────────────────────────────────────────────────────────

export async function getBooksVendors(searchText = '') {
  console.log('[getBooksVendors] searchText:', searchText)
  const res = await booksAPI({
    method: 'GET',
    path: 'contacts',
    params: {
      contact_type: 'vendor',
      ...(searchText ? { search_text: searchText } : {}),
    },
  })
  console.log('[getBooksVendors] parsed result keys:', res ? Object.keys(res) : 'null/undefined')
  console.log('[getBooksVendors] parsed result:', JSON.stringify(res, null, 2))
  console.log('[getBooksVendors] contacts:', res?.contacts)
  return res?.contacts ?? []
}

// ─────────────────────────────────────────────────────────────────────────────
// Zoho Books — Items
// ─────────────────────────────────────────────────────────────────────────────

export async function getBooksItems() {
  console.log('[getBooksItems] fetching...')
  const res = await booksAPI({ method: 'GET', path: 'items' })
  console.log('[getBooksItems] items count:', res?.items?.length)
  return res?.items ?? []
}

export async function getBooksAccounts() {
  console.log('[getBooksAccounts] fetching all active accounts...')
  const res = await booksAPI({
    method: 'GET',
    path: 'chartofaccounts',
    params: { filter_by: 'AccountType.Active' },
  })
  console.log('[getBooksAccounts] accounts:', res?.chartofaccounts?.length)
  console.log('[getBooksAccounts] accounts list:', res?.chartofaccounts)
  return res?.chartofaccounts ?? []
}

export async function createBooksItem(itemData) {
  console.log('[createBooksItem] payload:', itemData)
  const res = await booksAPI({ method: 'POST', path: 'items', body: itemData })
  console.log('[createBooksItem] response:', res)
  return res
}

// ─────────────────────────────────────────────────────────────────────────────
// Zoho Books — Bills
// ─────────────────────────────────────────────────────────────────────────────

export async function getBillsList(vendorId) {
  console.log('[getBillsList] vendorId:', vendorId)
  const res = await booksAPI({
    method: 'GET',
    path: 'bills',
    params: { vendor_id: vendorId },
  })
  console.log('[getBillsList] parsed result keys:', res ? Object.keys(res) : 'null/undefined')
  console.log('[getBillsList] parsed result:', JSON.stringify(res, null, 2))
  console.log('[getBillsList] bills:', res?.bills)
  return res?.bills ?? []
}

export async function getBillDetails(billId) {
  console.log('[getBillDetails] billId:', billId)
  const res = await booksAPI({
    method: 'GET',
    path: `bills/${billId}`,
  })
  console.log('[getBillDetails] bill:', res?.bill)
  return res?.bill ?? null
}

export async function createBooksBill(payload) {
  console.log('[createBooksBill] payload:', JSON.stringify(payload, null, 2))
  const res = await booksAPI({ method: 'POST', path: 'bills', body: payload })
  console.log('[createBooksBill] response code:', res?.code, 'message:', res?.message)
  console.log('[createBooksBill] full response:', JSON.stringify(res, null, 2))
  return res
}

export async function updateBooksBill(billId, payload) {
  console.log('[updateBooksBill] billId:', billId)
  console.log('[updateBooksBill] payload:', JSON.stringify(payload, null, 2))
  const res = await booksAPI({ method: 'PUT', path: `bills/${billId}`, body: payload })
  console.log('[updateBooksBill] response code:', res?.code, 'message:', res?.message)
  console.log('[updateBooksBill] full response:', JSON.stringify(res, null, 2))
  return res
}
