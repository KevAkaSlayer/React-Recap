import { useState, useEffect, useCallback } from 'react'
import { getPurchaseOrdersList } from '../lib/zoho'

export function usePurchaseOrders(booksVendorId) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!booksVendorId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getPurchaseOrdersList(booksVendorId)
      setOrders(data)
    } catch (err) {
      console.error('[usePurchaseOrders] error:', err)
      setError(err.message ?? 'Failed to load purchase orders.')
    } finally {
      setLoading(false)
    }
  }, [booksVendorId])

  useEffect(() => { refresh() }, [refresh])

  return { orders, loading, error, refresh }
}