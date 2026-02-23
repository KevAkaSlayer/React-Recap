import { useEffect, useState } from "react";
import "./App.css";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";


const ZOHO = window.ZOHO;

function App() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [entity, setEntity] = useState("");
  const [entityId, setEntityId] = useState("");
  const [recordData, setRecordData] = useState([]);
  const [updateStatus, setUpdateStatus] = useState("");
  const [relatedRecord, setRelatedRecord] = useState([]);

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
    if (zohoLoaded && entity && entityId) {
      ZOHO.CRM.API.getRecord({ Entity: entity, RecordID: entityId }).then(
        function (data) {
          setRecordData(data);
        },
      );
      ZOHO.CRM.UI.Resize({ height: "80%", width: "60%" }).then(function (data) {
        console.log(data);
      });
      ZOHO.CRM.API.getRelatedRecords({
        Entity: entity,
        RecordID: entityId,
        RelatedList: "Quotes",
        page: 1,
        per_page: 10,
      }).then(function (data) {
        setRelatedRecord(data);
      });
    }
  }, [zohoLoaded, entity, entityId]);

  console.log(relatedRecord);

  const deal_name = recordData?.data?.[0]?.Deal_Name;
  const account_name = recordData?.data?.[0]?.Account_Name;
  const email = recordData?.data?.[0]?.Email;
  const Status = recordData?.data?.[0]?.Status;
  const amount = recordData?.data?.[0]?.Amount;
  const website = recordData?.data?.[0]?.Website;

  const closeWindow = () => {
    if (ZOHO?.CRM?.UI?.Popup?.closeReload) {
      ZOHO.CRM.UI.Popup.closeReload();
      return;
    }
    if (ZOHO?.CRM?.UI?.Popup?.close) {
      ZOHO.CRM.UI.Popup.close();
      return;
    }
    window.close();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUpdateStatus("Updating...");
    const updated_deal_name = e.target.deal_name.value;
    const updated_account_name = e.target.account_name.value;
    const updated_email = e.target.email.value;
    const updated_amount = e.target.amount.value;
    const updated_status = e.target.status.value;
    const updated_website = e.target.website.value;
    const config = {
      Entity: entity,
      APIData: {
        id: entityId,
        Deal_Name: updated_deal_name,
        Account_Name: updated_account_name,
        Email: updated_email,
        Amount: updated_amount,
        Status: updated_status,
        Website: updated_website,
      },
      Trigger: [],
    };
    ZOHO.CRM.API.updateRecord(config)
      .then(function (data) {
        console.log("Update response:", data);
        if (data?.data?.[0]?.code === "SUCCESS") {
          setUpdateStatus("Record updated successfully!");
          toast.success("Successfully Updated", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
          ZOHO.CRM.API.getRecord({ Entity: entity, RecordID: entityId }).then(
            function (refreshedData) {
              setRecordData(refreshedData);
              setTimeout(() => setUpdateStatus(""), 2000);
              setTimeout(() => closeWindow(), 2000);
            },
          );
        } else {
          setUpdateStatus("Update failed. Please try again.");
          toast.error("Error", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
          setTimeout(() => setUpdateStatus(""), 2000);
        }
      })
      .catch(function (error) {
        console.error("Update error:", error);
        setUpdateStatus("Error updating record.");
        toast.error("Error", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        setTimeout(() => setUpdateStatus(""), 2000);
      });
  };
  const createQuote=()=>{
    console.log("clicked")
  }

  const handleEdit=(id)=>{
    console.log("clicked : ", id);
  }
  const handleDelete = (id) => {
    console.log(id)
    ZOHO.CRM.API.delinkRelatedRecord({
      Entity: entity,
      RecordID: entityId,
      RelatedList: "Quotes",
      RelatedRecordID: id,
    }).then(function (data) {
      if (data?.data?.[0]?.code === "SUCCESS") {
        toast.success("Successfully Deleted Quote", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        ZOHO.CRM.API.getRelatedRecords({
          Entity: entity,
          RecordID: entityId,
          RelatedList: "Quotes",
          page: 1,
          per_page: 10,
        }).then(function (data) {
          setRelatedRecord(data);
          setTimeout(() => closeWindow(), 2000);
        });
      }
    });
  };
  return (
    <>
      {zohoLoaded ? (
        <div className="App border-2 rounded-xl p-4">
          <h1>Deal Widget</h1>
          {updateStatus && (
            <div
              className={`alert ${updateStatus.includes("success") ? "" : updateStatus.includes("Error") || updateStatus.includes("failed") ? "" : "alert-info"} mb-4`}
            >
              {updateStatus}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <h2 className="flex mx-2">Deal Details Section</h2>
            <div className="flex gap-2 justify-around p-4 m-2 border-2 rounded-xl">
              <div className="flex flex-col gap-2 m-y-2">
                <label className="label">Deal Name</label>
                <input
                  className="input"
                  type="text"
                  name="deal_name"
                  defaultValue={deal_name}
                />
                <label className="label">Account Name</label>
                <input
                  className="input"
                  type="text"
                  name="account_name"
                  defaultValue={account_name}
                />
                <label className="label">Email</label>
                <input
                  className="input"
                  type="text"
                  name="email"
                  defaultValue={email}
                />
              </div>
              <div className="flex flex-col gap-2 m-y-2">
                <label className="label">Amount</label>
                <input
                  className="input"
                  type="text"
                  name="amount"
                  defaultValue={amount}
                />
                <label className="label">Status</label>
                <input
                  className="input"
                  type="text"
                  name="status"
                  defaultValue={Status}
                />
                <label className="label">Website</label>
                <input
                  className="input"
                  name="website"
                  type="text"
                  defaultValue={website}
                />
              </div>
            </div>
            <button className="btn btn-neutral flex m-2" type="submit">
              Update
            </button>
          </form>
          <div className="flex justify-between m-2">
            <h2>Related Quotes</h2>
            <button onClick={createQuote} className="btn btn-neutral">Create Quotes</button>
          </div>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Quote Name</TableCell>
                  <TableCell align="right">Account Name</TableCell>
                  <TableCell align="right">Stage</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relatedRecord?.data?.map((record) => (
                  <TableRow
                    key={record?.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {record?.Subject}
                    </TableCell>
                    <TableCell align="right">
                      {record?.Account_Name?.name}
                    </TableCell>
                    <TableCell align="right">{record?.Quote_Stage}</TableCell>
                    <TableCell align="right">{record?.Grand_Total}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <button onClick={()=>handleEdit(record?.id)} className="btn btn-sm">
                          <ModeEditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(record?.id)}
                          className="btn btn-sm"
                        >
                          <DeleteForeverIcon />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ) : (
        <div className="App">
          <h1>Loading...</h1>
        </div>
      )}
      <ToastContainer />
    </>
  );
}

export default App;
