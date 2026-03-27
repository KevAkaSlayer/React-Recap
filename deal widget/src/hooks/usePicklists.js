import { useState, useEffect } from 'react'
import { getEntityPicklists } from '../lib/zoho'

/**
 * Loads picklist values for multiple fields from the Zoho META API.
 *
 * @param {string} entity   - e.g. 'Deals', 'Quotes'
 * @param {string[]} fields - field api_names, e.g. ['Stage', 'Lead_Source']
 * @returns {{ picklists: Record<string, string[]>, loading: boolean }}
 */
export function usePicklists(entity, fields) {
  const [picklists, setPicklists] = useState({})
  const [loading, setLoading] = useState(true)

  // Stable key so the effect only re-runs when entity or field list actually changes
  const fieldKey = fields.join(',')

  useEffect(() => {
    if (!entity || !fields.length) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getEntityPicklists(entity, fields).then((result) => {
      if (!cancelled) {
        setPicklists(result)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, fieldKey])

  return { picklists, loading }
}