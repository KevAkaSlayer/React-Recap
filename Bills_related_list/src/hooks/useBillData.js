import { useState, useEffect } from 'react'
import { initSDK, getCRMVendor, getBooksItems, getBooksAccounts } from '../lib/zoho'

/**
 * Initialises the SDK, reads Books_Vendor_ID from the CRM Vendor record,
 * and loads Books items + expense accounts for line-item dropdowns.
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
      console.log('[useBillData] starting...')
      try {
        // 1. Init SDK and get the CRM Vendor ID from PageLoad context
        const pageData = await initSDK()
        console.log('[useBillData] PageLoad data:', pageData)

        // Related-list context → EntityId is a string
        // Button/ListView context → EntityId is an array
        const crmVendorId = Array.isArray(pageData?.EntityId)
          ? pageData.EntityId[0]
          : pageData?.EntityId

        console.log('[useBillData] crmVendorId:', crmVendorId)
        if (!crmVendorId) throw new Error('No vendor ID in widget context.')

        // 2. Fetch the CRM Vendor record
        const vendor = await getCRMVendor(crmVendorId)
        console.log('[useBillData] CRM vendor record:', vendor)
        console.log('[useBillData] CRM vendor ALL fields:', JSON.stringify(vendor, null, 2))
        if (!vendor) throw new Error('Vendor record not found in CRM.')

        const vendorName = vendor.Vendor_Name ?? ''
        // Books_Vendor_Id is the direct Zoho Books contact_id stored on the CRM record
        // Log all keys to identify the exact API field name
        console.log('[useBillData] vendor field keys:', Object.keys(vendor))
        const booksVendorId = vendor.Books_Vendor_ID ?? null

        console.log('[useBillData] vendorName:', vendorName)
        console.log('[useBillData] Books_Vendor_Id (resolved):', booksVendorId)

        if (!booksVendorId) {
          setState({
            vendorName,
            booksVendorId: null,
            items: [],
            loading: false,
            error:
              `The field "Books_Vendor_Id" is empty for vendor "${vendorName}". ` +
              `Please sync this vendor with Zoho Books so the field is populated.`,
          })
          return
        }

        // 3. Load Books items + expense accounts in parallel
        let booksItems = []
        let booksAccounts = []
        try {
          ;[booksItems, booksAccounts] = await Promise.all([
            getBooksItems(),
            getBooksAccounts(),
          ])
          console.log('[useBillData] items count:', booksItems.length)
          console.log('[useBillData] accounts count:', booksAccounts.length)
        } catch (err) {
          console.error('[useBillData] items/accounts load error (non-fatal):', err)
        }

        setState({
          vendorName,
          booksVendorId,
          items: booksItems,
          accounts: booksAccounts,
          loading: false,
          error: null,
        })
      } catch (err) {
        console.error('[useBillData] error:', err)
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message ?? 'Failed to load widget data.',
        }))
      }
    }

    load()
  }, [])

  return { ...state }
}
