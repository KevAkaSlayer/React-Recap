import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import { deleteFromStoreDB, getStoredBook } from "../../utility/addToDB";
import { Link } from "react-router";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function ReadList() {
  const books = useLoaderData();
  const [readList, setReadList] = useState([]);
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const storedBookData = getStoredBook();
    const myReadList = Object.values(books).filter((book) =>
      storedBookData.includes(book.isbn_13),
    );
    setReadList(myReadList);
  }, []);

  const handleDelete = (id) => {
    alert("deleted successfully!");
    deleteFromStoreDB(id);
    const updatedReadList = readList.filter((book) => book.isbn_13 !== id);
    setReadList(updatedReadList);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Read List" {...a11yProps(0)} sx={{ color: "white" }} />
          {/* <Tab label="Wish List" {...a11yProps(1)} sx={{ color: "white" }} /> */}
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <div className="overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th></th>
                <th>Author</th>
                <th>Title</th>
                <th>Published Date</th>
              </tr>
            </thead>
            <tbody>
              {readList.map((book) => (
                <tr>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img src={book.cover_image} alt="book image" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{book.author}</div>
                        <div className="text-sm opacity-50">United States</div>
                      </div>
                    </div>
                  </td>
                  <td>{book.title}</td>
                  <td>{book.published_date}</td>
                  <th>
                    <Link to={`/book/${book.isbn_13}`}>
                      <button className="btn btn-ghost btn-xs">details</button>
                    </Link>
                  </th>
                  <th>
                    <button className="btn btn-sm" onClick={() => handleDelete(book.isbn_13)}>
                      <DeleteForeverIcon />
                    </button>
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        Wishlist
      </CustomTabPanel>
    </Box>
  );
}
