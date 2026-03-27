import { useState, useEffect, useCallback } from 'react'
import { getBillsList } from '../lib/zoho'

/** Manages the list of Zoho Books bills for a given vendor. */
export function useBills(booksVendorId) {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!booksVendorId) return
    console.log('[useBills] refresh() for vendorId:', booksVendorId)
    setLoading(true)
    setError(null)
    try {
      const data = await getBillsList(booksVendorId)
      console.log('[useBills] loaded', data.length, 'bills')
      setBills(data)
    } catch (err) {
      console.error('[useBills] error:', err)
      setError(err.message ?? 'Failed to load bills.')
    } finally {
      setLoading(false)
    }
  }, [booksVendorId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { bills, loading, error, refresh }
}
