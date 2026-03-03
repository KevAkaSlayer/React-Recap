const ZOHO = window.ZOHO;

export const searchResult = (entity, query) => {
  ZOHO.CRM.API.searchRecord({
    Entity: entity,
    Type: "criteria",
    Query: `(Account_Name:starts_with:${query})`,
    delay: false,
  });
};

export const getAllRecords = (entity, page = 1, perPage = 200) =>
  ZOHO.CRM.API.getAllRecords({ Entity: entity, page, per_page: perPage });
