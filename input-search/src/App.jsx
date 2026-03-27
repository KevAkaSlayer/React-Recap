import { useEffect, useState } from "react";
import "./App.css";
import SearchBox from "./components/SearchBox";

const ZOHO = window.ZOHO;

const toDateTimeLocalValue = (dateTimeValue) => {
  if (!dateTimeValue || typeof dateTimeValue !== "string") {
    return "";
  }

  // `datetime-local` expects `YYYY-MM-DDTHH:mm`.
  const normalized = dateTimeValue.includes(" ")
    ? dateTimeValue.replace(" ", "T")
    : dateTimeValue;
  const isoMatch = normalized.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);

  if (isoMatch) {
    return isoMatch[1];
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  const day = `${parsed.getDate()}`.padStart(2, "0");
  const hour = `${parsed.getHours()}`.padStart(2, "0");
  const minute = `${parsed.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

function App() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [entity, setEntity] = useState("");
  const [entityId, setEntityId] = useState("");
  const [allAccount, setAllAccount] = useState([]);
  const [recordData, setRecordData] = useState([]);
  const [editRecord, setEditRecord] = useState({
    start_date_time: "",
  });

  useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", function (data) {
      console.log(data);
      setEntity(data?.Entity);
      setEntityId(data?.EntityId?.[0]);
      setZohoLoaded(true);
    });
    ZOHO.embeddedApp.init();
  }, []);
  useEffect(() => {
    if (entity && entityId && zohoLoaded) {
      const loadData = async () => {
        const getRecord = await ZOHO.CRM.API.getRecord({
          Entity: entity,
          RecordID: entityId,
        });
        setRecordData(getRecord);

        const getAccount = await ZOHO.CRM.API.getAllRecords({
          Entity: "Accounts",
          sort_order: "asc",
          per_page: 200,
          page: 1,
        });
        setAllAccount(getAccount?.data);
      };
      loadData();
    }
  }, [zohoLoaded, entity, entityId]);

  useEffect(() => {
    const dealStartDateTime = recordData?.data?.[0]?.Deal_Start_Date_Time;
    setEditRecord({
      start_date_time: toDateTimeLocalValue(dealStartDateTime),
    });
  }, [recordData]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setEditRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const search_param = e.target.search_param.value;
    const date_time = editRecord.start_date_time
      ? `${editRecord.start_date_time}:00+06:00`
      : "";

    var config = {
      Entity: entity,
      APIData: {
        id: entityId,
        Deal_Start_Date_Time: date_time,
      },
      Trigger: [],
    };
    try {
      const update_deal = await ZOHO.CRM.API.updateRecord(config);
    } catch (e) {
      console.log(e);
    }

    const query = `(Account_Name:starts_with:${search_param})`;
    const search_result = await ZOHO.CRM.API.searchRecord({
      Entity: "Accounts",
      Type: "criteria",
      Query: query,
      delay: false,
    });

    console.log(search_result?.data);
  };
  return (
    <>
      {zohoLoaded ? (
        <div className="mt-2 p-4">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="input"
              placeholder="type here"
              name="search_param"
            />
            <br />
            <input
              type="datetime-local"
              className="input"
              value={editRecord.start_date_time}
              name="start_date_time"
              onChange={handleOnChange}
            />
            <br />
            <SearchBox allAccount={allAccount} />
            <br />
            <button className="btn btn-netral" type="submit">
              search
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}

export default App;
