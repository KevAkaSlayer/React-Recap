import { useState, useEffect, useCallback } from 'react'
import { getDealQuotes, createQuote, updateQuote, delinkQuote, deleteQuote } from '../lib/zoho'

/** Zoho API resolves (never rejects) — check the response code to detect failure */
function isApiSuccess(response) {
  return response?.data?.[0]?.code === 'SUCCESS'
}

export function useQuotes(dealId) {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchQuotes = useCallback(async () => {
    if (!dealId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getDealQuotes(dealId)
      setQuotes(data)
    } catch (err) {
      console.error('[useQuotes] fetch error', err)
      setError('Failed to load quotes.')
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const saveQuote = useCallback(
    async (fields, quoteId = null) => {
      try {
        let response
        if (quoteId) {
          response = await updateQuote(quoteId, fields)
        } else {
          response = await createQuote(fields)
        }

        if (!isApiSuccess(response)) {
          const msg = response?.data?.[0]?.message ?? (quoteId ? 'Update failed.' : 'Create failed.')
          return { success: false, message: msg }
        }

        await fetchQuotes()
        return { success: true }
      } catch (err) {
        console.error('[useQuotes] save error', err)
        return { success: false, message: err?.message ?? 'Save failed.' }
      }
    },
    [fetchQuotes],
  )

  const removeQuote = useCallback(async (quoteId) => {
    try {
      // Try delink first (removes association but keeps the quote record)
      const delinkRes = await delinkQuote(quoteId)
      if (!isApiSuccess(delinkRes)) {
        // Fallback: delete the quote record entirely
        const deleteRes = await deleteQuote(quoteId)
        if (!isApiSuccess(deleteRes)) {
          const msg = deleteRes?.data?.[0]?.message ?? 'Failed to remove quote.'
          return { success: false, message: msg }
        }
      }

      await fetchQuotes()
      return { success: true }
    } catch (err) {
      console.error('[useQuotes] delink error', err)
      return { success: false, message: err?.message ?? 'Delink failed.' }
    }
  }, [fetchQuotes])

  return { quotes, loading, error, saveQuote, removeQuote, refetch: fetchQuotes }
}