import { Suspense, useEffect, useState } from "react";
import "./App.css";
import { getAllRecords, searchResult } from "./services/zohoApi";
import InputForm from "./components/InputForm";
import { format } from "date-fns";

const ZOHO = window.ZOHO;

function App() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [entity, setEntity] = useState("");
  const [entityId, setEntityId] = useState("");
  const [query, setQuery] = useState("");
  const [searchedAccount, setSearchedAccount] = useState([]);
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
      };
      loadData();
    }
  }, [zohoLoaded, entity, entityId]);

  let deal_start_date_time = recordData?.data?.[0]?.Deal_Start_Date_Time;
  console.log(deal_start_date_time);
  let date = deal_start_date_time?.slice(0, 10);
  let hour = parseInt(deal_start_date_time?.slice(11, 13));
  let min = deal_start_date_time?.slice(14, 16);
  let h = "AM";
  if (hour > 12) {
    hour = hour - 12;
    h = "PM";
    console.log(hour);
  }
  if (hour?.toString().length === 1) {
    hour = "0" + hour;
  }
  if (min?.length === 1) {
    min = "0" + min;
  }

  // if (date !== "undefined") {
  //   // date = format(date, "MM/dd/yyyy");
  // }

  console.log(date);
  const formated_date = date + " " + hour + ":" + min + " " + h;
  console.log(formated_date);
  const handleOnChange = (e) => {
    // const [name, value] = e.target;
    // setEditRecord((prev) => ({
    //   ...prev,
    //   [name]: value,
    // }));
  };
  console.log(editRecord);
  const handleSubmit = async (e) => {
    e.preventDefault();
    // const param = e.target.param.value;
    // const result = await ZOHO.CRM.API.searchRecord({
    //   Entity: "Accounts",
    //   Type: "criteria",
    //   Query: `(Account_Name:starts_with:${param})`,
    //   delay: false,
    // });
    // setSearchedAccount(result?.data);
    // console.log(searchedAccount);
    // var func_name = "	new_test_function";
    // var req_data = {
    //   arguments: JSON.stringify({
    //     search_param: searchedAccount,
    //   }),
    // };
    // const function_ex = await ZOHO.CRM.FUNCTIONS.execute(func_name, req_data);
    // const parsed_data = JSON.parse(function_ex?.details?.output);
    // console.log(parsed_data);
    const date_time = e.target.date_time.value + ":00+06:00";
    console.log(date_time);
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
      console.log(update_deal);
    } catch (e) {
      console.log(e);
    }

    console.log(date_time);
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
              name="param"
            />
            <input
              type="datetime-local"
              className="input"
              defaultValue="03/05/2026 09:30 PM"
              name="date_time"
            />
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
