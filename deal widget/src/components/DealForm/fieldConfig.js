/** Maps Zoho API field names → form field configuration */
export const DEAL_FIELDS = [
  // ── Deal Information ──────────────────────────────────────────────────────
  {
    key: 'Deal_Name',
    label: 'Deal Name',
    type: 'text',
    required: true,
    placeholder: 'Enter deal name',
    colSpan: 2,
    sectionLabel: 'Deal Information',
  },
  {
    key: 'Account_Name',
    label: 'Account Name',
    type: 'lookup',
    entity: 'Accounts',
    displayKey: 'Account_Name',
    placeholder: 'Search accounts…',
  },
  {
    key: 'Contact_Name',
    label: 'Contact Name',
    type: 'lookup',
    entity: 'Contacts',
    displayKey: 'Full_Name',
    placeholder: 'Search contacts…',
  },
  // ── Sales Details ─────────────────────────────────────────────────────────
  {
    key: 'Stage',
    label: 'Stage',
    type: 'select',
    required: true,
    picklistKey: 'Stage',
    sectionLabel: 'Sales Details',
  },
  {
    key: 'Closing_Date',
    label: 'Closing Date',
    type: 'date',
    required: true,
  },
  {
    key: 'Amount',
    label: 'Amount ($)',
    type: 'number',
    placeholder: '0.00',
  },
  {
    key: 'Probability',
    label: 'Probability (%)',
    type: 'number',
    placeholder: '0',
    min: 0,
    max: 100,
  },
  {
    key: 'Type',
    label: 'Deal Type',
    type: 'select',
    picklistKey: 'Type',
  },
  {
    key: 'Lead_Source',
    label: 'Lead Source',
    type: 'select',
    picklistKey: 'Lead_Source',
  },
  // ── Notes ─────────────────────────────────────────────────────────────────
  {
    key: 'Description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Add notes about this deal…',
    colSpan: 2,
    rows: 3,
    sectionLabel: 'Notes',
  },
]

/**
 * Read-only display fields shown as info pills above the form.
 */
export const READ_ONLY_FIELDS = [
  { key: 'Owner', label: 'Owner', resolve: (v) => v?.name },
]