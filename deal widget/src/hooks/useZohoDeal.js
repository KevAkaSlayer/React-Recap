import { useEffect, useState, useCallback } from 'react'
import { initSDK, getDeal, updateDeal } from '../lib/zoho'

export function useZohoDeal() {
  const [deal, setDeal] = useState(null)
  const [recordId, setRecordId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    initSDK()
      .then((data) => {
        const id = data?.EntityId?.[0]
        setRecordId(id)
        return getDeal(id)
      })
      .then((record) => setDeal(record))
      .catch((err) => {
        console.error('[useZohoDeal] init error', err)
        setError('Failed to load deal data.')
      })
      .finally(() => setLoading(false))
  }, [])

  const saveDeal = useCallback(
    async (fields) => {
      setSaving(true)
      try {
        const response = await updateDeal(recordId, fields)

        if (response?.data?.[0]?.code !== 'SUCCESS') {
          const msg = response?.data?.[0]?.message ?? 'Update failed.'
          console.error('[saveDeal] API failure:', response)
          return { success: false, message: msg }
        }

        setDeal((prev) => ({ ...prev, ...fields }))
        return { success: true }
      } catch (err) {
        console.error('[saveDeal] thrown error:', err)
        return { success: false, message: err?.message ?? 'Update failed.' }
      } finally {
        setSaving(false)
      }
    },
    [recordId],
  )

  return { deal, loading, saving, error, saveDeal }
}