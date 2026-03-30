import { useState, useEffect } from 'react'
import { initSDK, getCRMVendor, getBooksItems, getBooksAccounts } from '../lib/zoho'

/**
 * Initialises the SDK, reads Books_Vendor_ID from the CRM Vendor record,
 * and loads Books items + accounts for the bill form.
 */
export function useBillData() {
  const [state, setState] = useState({
    vendorName: '',
    booksVendorId: null,
    items: [],
    accounts: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function load() {
      try {
        // 1. Init SDK → get CRM Vendor ID
        const pageData = await initSDK()
        const crmVendorId = Array.isArray(pageData?.EntityId)
          ? pageData.EntityId[0]
          : pageData?.EntityId

        if (!crmVendorId) throw new Error('No vendor ID in widget context.')

        // 2. Fetch CRM Vendor → read Books_Vendor_ID
        const vendor = await getCRMVendor(crmVendorId)
        if (!vendor) throw new Error('Vendor record not found in CRM.')

        const vendorName = vendor.Vendor_Name ?? ''
        const booksVendorId = vendor.Books_Vendor_ID ?? null

        if (!booksVendorId) {
          setState({
            vendorName,
            booksVendorId: null,
            items: [],
            accounts: [],
            loading: false,
            error: `"Books_Vendor_ID" is empty for "${vendorName}". Please sync this vendor with Zoho Books.`,
          })
          return
        }

        // 3. Load Books items + accounts in parallel
        let items = []
        let accounts = []
        try {
          ;[items, accounts] = await Promise.all([getBooksItems(), getBooksAccounts()])
        } catch (err) {
          console.error('[useBillData] items/accounts load error (non-fatal):', err)
        }

        setState({ vendorName, booksVendorId, items, accounts, loading: false, error: null })
      } catch (err) {
        console.error('[useBillData] error:', err)
        setState((prev) => ({ ...prev, loading: false, error: err.message ?? 'Failed to load widget data.' }))
      }
    }

    load()
  }, [])

  return state
}