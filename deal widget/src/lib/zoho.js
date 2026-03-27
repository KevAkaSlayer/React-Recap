/** Safe reference to the Zoho SDK injected via index.html */
export const ZOHO = window.ZOHO;

/** Close the widget popup without reloading */
export function closeWidget() {
  return ZOHO.CRM.UI.Popup.close()
}

/** Close the widget popup and reload the CRM record page */
export function closeWidgetAndReload() {
  return ZOHO.CRM.UI.Popup.closeReload()
}

/**
 * Initialise the embedded app and resolve with the PageLoad data.
 * Returns a promise so callers can await the entity context.
 */
export function initSDK() {
  return new Promise((resolve) => {
    ZOHO.embeddedApp.on("PageLoad", (data) => resolve(data));
    ZOHO.embeddedApp.init();
  });
}

/** Fetch a single Deal record by ID */
export function getDeal(recordId) {
  return ZOHO.CRM.API.getRecord({ Entity: "Deals", RecordID: recordId }).then(
    (res) => res?.data?.[0] ?? null,
  );
}

/** Update a Deal record with a partial payload */
export function updateDeal(recordId, fields) {
  return ZOHO.CRM.API.updateRecord({
    Entity: "Deals",
    APIData: { id: recordId, ...fields },
    Trigger: [],
  });
}

/** Fetch quotes related to a deal via the Quotes related list */
export function getDealQuotes(dealId) {
  return ZOHO.CRM.API.getRelatedRecords({
    Entity: 'Deals',
    RecordID: dealId,
    RelatedList: 'Quotes',
    page: 1,
    per_page: 100,
  }).then((res) => {
    if (!res || res.status === 'error' || !Array.isArray(res.data)) return []
    return res.data
  })
}

/** Create a new Quote record */
export function createQuote(fields) {
  return ZOHO.CRM.API.insertRecord({
    Entity: 'Quotes',
    APIData: fields,
    Trigger: [],
  })
}

/** Update an existing Quote record */
export function updateQuote(quoteId, fields) {
  return ZOHO.CRM.API.updateRecord({
    Entity: 'Quotes',
    APIData: { id: quoteId, ...fields },
    Trigger: [],
  })
}

/** Delink a quote from its deal by sending an empty object for Deal_Name */
export function delinkQuote(quoteId) {
  return ZOHO.CRM.API.updateRecord({
    Entity: 'Quotes',
    APIData: { id: quoteId, Deal_Name: {} },
    Trigger: [],
  })
}

/** Delete a Quote record permanently */
export function deleteQuote(quoteId) {
  return ZOHO.CRM.API.deleteRecord({
    Entity: 'Quotes',
    RecordID: quoteId,
  })
}

/**
 * Fetch picklist values for multiple fields in one META API call.
 * Returns { [fieldApiName]: string[] }
 */
export async function getEntityPicklists(entity, fieldApiNames) {
  const res = await ZOHO.CRM.META.getFields({ Entity: entity })
  const fields = res?.fields ?? []
  const result = {}
  for (const name of fieldApiNames) {
    const field = fields.find((f) => f.api_name === name)
    result[name] = field?.pick_list_values?.map((v) => v.actual_value) ?? []
  }
  return result
}

/**
 * Search CRM records by a keyword.
 * Falls back to getAllRecords (most recent 20) when query is empty.
 *
 * @param {'Accounts'|'Contacts'} entity
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchRecords(entity, query) {
  const term = query?.trim();

  if (!term) {
    const res = await ZOHO.CRM.API.getAllRecords({
      Entity: entity,
      sort_order: "desc",
      per_page: 200,
      page: 1,
    });
    return res?.data ?? [];
  }

  const res = await ZOHO.CRM.API.searchRecord({
    Entity: entity,
    Type: "word",
    Query: term,
  });
  // Zoho returns { status: 'error' } when no results match — treat as empty
  if (!res || res.status === "error" || !Array.isArray(res.data)) return [];
  return res.data;
}
