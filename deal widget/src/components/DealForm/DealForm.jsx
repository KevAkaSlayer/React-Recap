import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Label } from '../ui/Label'
import { Input, Textarea } from '../ui/Input'
import { Select } from '../ui/Select'
import { LookupField } from '../ui/LookupField'
import { InfoPill } from './InfoPill'
import { DEAL_FIELDS, READ_ONLY_FIELDS } from './fieldConfig'
import { QuoteSection } from '../Quote/QuoteSection'
import { usePicklists } from '../../hooks/usePicklists'

const DEAL_PICKLIST_FIELDS = DEAL_FIELDS
  .filter((f) => f.picklistKey)
  .map((f) => f.picklistKey)

/** How long the success toast is visible before the widget closes */
const SAVE_CLOSE_DELAY_MS = 1500

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialValues(deal) {
  return DEAL_FIELDS.reduce((acc, field) => {
    const raw = deal?.[field.key]
    if (field.type === 'lookup') {
      acc[field.key] = raw?.id ? { id: raw.id, name: raw.name ?? '' } : null
    } else {
      acc[field.key] = raw ?? ''
    }
    return acc
  }, {})
}

function buildPayload(values) {
  return DEAL_FIELDS.reduce((acc, field) => {
    const val = values[field.key]
    acc[field.key] = field.type === 'lookup'
      ? (val?.id ? { id: val.id } : null)
      : val
    return acc
  }, {})
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DealForm({ deal, saving, onSave, formRef, onSaveSuccess }) {
  const [values, setValues] = useState(() => buildInitialValues(deal))
  const [errors, setErrors] = useState({})
  const { picklists } = usePicklists('Deals', DEAL_PICKLIST_FIELDS)

  useEffect(() => {
    setValues(buildInitialValues(deal))
  }, [deal])

  function handleChange(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate() {
    const next = {}
    DEAL_FIELDS.filter((f) => f.required).forEach((f) => {
      const val = values[f.key]
      const empty = f.type === 'lookup' ? !val?.id : !val?.toString().trim()
      if (empty) next[f.key] = `${f.label} is required.`
    })
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      toast.error('Please fix the highlighted fields.')
      return
    }

    const result = await onSave(buildPayload(values))
    if (result.success) {
      toast.success('Deal updated successfully!')
      setTimeout(() => onSaveSuccess?.(), SAVE_CLOSE_DELAY_MS)
    } else {
      toast.error(result.message ?? 'Something went wrong.')
    }
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        {/* Owner read-only pill strip */}
        {READ_ONLY_FIELDS.some((f) => deal?.[f.key]) && (
          <div className="flex flex-wrap gap-4 mb-6 p-3 rounded-xl bg-slate-50 border border-slate-100">
            {READ_ONLY_FIELDS.map(({ key, label, resolve }) => {
              const value = resolve ? resolve(deal?.[key]) : deal?.[key]
              if (!value) return null
              return <InfoPill key={key} label={label} value={value} />
            })}
          </div>
        )}

        {/* Field grid with section dividers */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-5">
          {DEAL_FIELDS.map((field) => (
            <SectionedField key={field.key} field={field}>
              <Label htmlFor={field.key} required={field.required}>
                {field.label}
              </Label>
              <FieldInput
                field={field}
                value={values[field.key]}
                options={field.picklistKey ? (picklists[field.picklistKey] ?? []) : field.options}
                disabled={saving}
                hasError={!!errors[field.key]}
                onChange={(v) => handleChange(field.key, v)}
              />
              {errors[field.key] && (
                <p className="mt-1 text-xs text-rose-500">{errors[field.key]}</p>
              )}
            </SectionedField>
          ))}
        </div>
      </form>

      <QuoteSection deal={deal} />
    </>
  )
}

// ── Section divider wrapper ───────────────────────────────────────────────────

function SectionedField({ field, children }) {
  return (
    <>
      {field.sectionLabel && (
        <div className="col-span-2 flex items-center gap-3 pt-3 first:pt-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            {field.sectionLabel}
          </span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
      )}
      <div className={field.colSpan === 2 ? 'col-span-2' : 'col-span-1'}>
        {children}
      </div>
    </>
  )
}

// ── Field router ──────────────────────────────────────────────────────────────

function FieldInput({ field, value, options, disabled, hasError, onChange }) {
  if (field.type === 'lookup') {
    return (
      <LookupField
        id={field.key}
        entity={field.entity}
        displayKey={field.displayKey}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={field.placeholder}
        hasError={hasError}
      />
    )
  }

  const sharedProps = {
    id: field.key,
    disabled,
    value: value ?? '',
    onChange: (e) => onChange(e.target.value),
  }

  if (field.type === 'select') {
    return <Select {...sharedProps} options={options ?? []} placeholder="— Select —" hasError={hasError} />
  }
  if (field.type === 'textarea') {
    return <Textarea {...sharedProps} rows={field.rows} placeholder={field.placeholder} hasError={hasError} />
  }
  return (
    <Input
      {...sharedProps}
      type={field.type}
      placeholder={field.placeholder}
      min={field.min}
      max={field.max}
      hasError={hasError}
    />
  )
}