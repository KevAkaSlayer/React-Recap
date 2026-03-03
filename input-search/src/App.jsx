import { Suspense, useEffect, useState } from "react";
import "./App.css";
import { getAllRecords, searchResult } from "./services/zohoApi";
import InputForm from "./components/InputForm";

const ZOHO = window.ZOHO;

function App() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [entity, setEntity] = useState("");
  const [entityId, setEntityId] = useState("");
  const [query, setQuery] = useState("");
  const [searchedAccount, setSearchedAccount] = useState([]);

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
      const loadData = async () => {};
      loadData();
    }
  }, [zohoLoaded, entity, entityId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const param = e.target.param.value;
    const result = await ZOHO.CRM.API.searchRecord({
      Entity: "Accounts",
      Type: "criteria",
      Query: `(Account_Name:starts_with:${param})`,
      delay: false,
    });
    setSearchedAccount(result?.data);
    var func_name = "	new_test_function";
    var req_data = {
      arguments: JSON.stringify({
        deal_id: "4728790000031858001",
      }),
    };
    const function_ex = await ZOHO.CRM.FUNCTIONS.execute(func_name, req_data);
    const parsed_data = JSON.parse(function_ex?.details?.output);
    console.log(parsed_data);
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
