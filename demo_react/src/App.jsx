import { useEffect, useState } from "react";
import "./App.css";
const ZOHO = window.ZOHO;
function App() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [entity, setEntity] = useState("");
  const [entityId, setEntityId] = useState("");
  const [userData, setUserData] = useState([]);
  const [updateStatus, setUpdateStatus] = useState("");

  useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", function (data) {
      console.log(data);
      setEntity(data?.Entity);
      setEntityId(data?.EntityId?.[0]);
      setZohoLoaded(true);
      //Custom Bussiness logic goes here
    });
    /*
     * initializing the widget.
     */
    ZOHO.embeddedApp.init();
  }, []);

  useEffect(() => {
    if (zohoLoaded && entity && entityId) {
      ZOHO.CRM.API.getRecord({ Entity: entity, RecordID: entityId }).then(
        function (data) {
          setUserData(data);
        },
      );
    }
  }, [zohoLoaded, entity, entityId]);
  console.log(userData);
  const first_name = userData?.data?.[0]?.First_Name;
  const last_name = userData?.data?.[0]?.Last_Name;
  const email = userData?.data?.[0]?.Email;
  const address = userData?.data?.[0]?.Address;
  const phone = userData?.data?.[0]?.Phone;
  const website = userData?.data?.[0]?.Website;

  const handleSubmit = (e) => {
    e.preventDefault();
    setUpdateStatus("Updating...");

    const updated_first_name = e.target.first_name.value;
    const updated_last_name = e.target.last_name.value;
    const updated_email = e.target.email.value;
    const updated_address = e.target.address.value;
    const updated_phone = e.target.phone.value;
    const updated_website = e.target.website.value;

    const config = {
      Entity: entity,
      APIData: {
        id: entityId,
        First_Name: updated_first_name,
        Last_Name: updated_last_name,
        Email: updated_email,
        Address: updated_address,
        Phone: updated_phone,
        Website: updated_website,
      },
      Trigger: [],
    };

    ZOHO.CRM.API.updateRecord(config)
      .then(function (data) {
        console.log("Update response:", data);
        if (data?.data?.[0]?.code === "SUCCESS") {
          setUpdateStatus("Record updated successfully!");
          ZOHO.CRM.API.getRecord({ Entity: entity, RecordID: entityId }).then(
            function (refreshedData) {
              setUserData(refreshedData);
              setTimeout(() => setUpdateStatus(""), 2000);
            },
          );
        } else {
          setUpdateStatus("Update failed. Please try again.");
          setTimeout(() => setUpdateStatus(""), 2000);
        }
      })
      .catch(function (error) {
        console.error("Update error:", error);
        setUpdateStatus("Error updating record.");
        setTimeout(() => setUpdateStatus(""), 2000);
      });
  };

  return (
    <>
      {zohoLoaded ? (
        <div className="App">
          <h1>Zoho CRM Embedded App</h1>
          <p>Entity: {entity}</p>
          <p>Entity ID: {entityId}</p>
          {updateStatus && (
            <div
              className={`alert ${updateStatus.includes("success") ? "alert-success" : updateStatus.includes("Error") || updateStatus.includes("failed") ? "alert-error" : "alert-info"} mb-4`}
            >
              {updateStatus}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 m-2">
              <label className="label">First Name</label>
              <input
                className="input"
                type="text"
                name="first_name"
                defaultValue={first_name}
              />
              <label className="label">Last Name</label>
              <input
                className="input"
                type="text"
                name="last_name"
                defaultValue={last_name}
              />
              <label className="label">Email </label>
              <input
                className="input"
                type="text"
                name="email"
                defaultValue={email}
              />
              <label className="label">Address </label>
              <input
                className="input"
                type="text"
                name="address"
                defaultValue={address}
              />
              <label className="label">Phone </label>
              <input
                className="input"
                type="text"
                name="phone"
                defaultValue={phone}
              />
              <label className="label">Website </label>
              <input
                className="input"
                name="website"
                type="text"
                defaultValue={website}
              />
            </div>
            <button className="btn btn-ghost flex" type="submit">
              Submit
            </button>
          </form>
        </div>
      ) : (
        <div className="App">
          <h1>Loading Zoho CRM Embedded App...</h1>
        </div>
      )}
    </>
  );
}

export default App;
