import { useState } from "react";
import { Bounce, toast } from "react-toastify";

const ZOHO = window.ZOHO;

function AddRecordButton({
  entity = "Leads",
  fields = [
    { key: "Company", label: "Company", required: true },
    { key: "Last_Name", label: "Last Name", required: true },
    { key: "First_Name", label: "First Name" },
    { key: "Email", label: "Email", type: "email" },
    { key: "Phone", label: "Phone" },
    { key: "Website", label: "Website" },
  ],
}) {
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(
    fields.reduce(function (accumulator, field) {
      accumulator[field.key] = "";
      return accumulator;
    }, {}),
  );
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(function (previous) {
      return {
        ...previous,
        [name]: value,
      };
    });
  };

  const resetForm = () => {
    setFormData(
      fields.reduce(function (accumulator, field) {
        accumulator[field.key] = "";
        return accumulator;
      }, {}),
    );
  };

  const handleOpenForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleCreateRecord = (event) => {
    event.preventDefault();

    if (!ZOHO?.CRM?.API?.insertRecord) {
      toast.error("Insert API unavailable", {
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
      return;
    }

    const apiData = Object.entries(formData).reduce(function (
      accumulator,
      [key, value],
    ) {
      if (typeof value === "string") {
        const trimmedValue = value.trim();
        if (trimmedValue) {
          accumulator[key] = trimmedValue;
        }
      }

      return accumulator;
    }, {});

    setIsCreating(true);

    ZOHO.CRM.API.insertRecord({
      Entity: entity,
      APIData: apiData,
      Trigger: [],
    })
      .then(function (data) {
        console.log("Insert response:", data);

        if (data?.data?.[0]?.code === "SUCCESS") {
          toast.success("Record added successfully", {
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
          setShowForm(false);
          resetForm();
          return;
        }

        toast.error("Failed to add record", {
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
      })
      .catch(function (error) {
        console.error("Insert error:", error);
        toast.error("Error while adding record", {
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
      })
      .finally(function () {
        setIsCreating(false);
      });
  };

  if (!showForm) {
    return (
      <button
        className="btn btn-ghost flex mt-3"
        type="button"
        onClick={handleOpenForm}
      >
        Add {entity} Record
      </button>
    );
  }

  return (
    <form onSubmit={handleCreateRecord} className="mt-4">
      <div className="flex flex-col gap-2 m-2">
        {fields.map(function (field) {
          return (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="label" htmlFor={field.key}>
                {field.label}
              </label>
              <input
                id={field.key}
                className="input"
                type={field.type || "text"}
                name={field.key}
                value={formData[field.key] || ""}
                onChange={handleInputChange}
                required={Boolean(field.required)}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 justify-center mt-3">
        <button className="btn btn-ghost" type="submit" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Record"}
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={handleCloseForm}
          disabled={isCreating}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AddRecordButton;
