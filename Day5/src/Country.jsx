import React, { useState } from "react";
import "./country.css";
export default function Country({ country, handleVisitedCount }) {
  const [visited, setVisited] = useState(false);

  const handleVisited = () => {
    setVisited(!visited);
    handleVisitedCount(country);
  };
  return (
    <div className={`country ${visited && "country-visited"}`}>
      <h1>Country Name : {country.name.common}</h1>
      <img className="flag" src={country.flags.png} alt="" />
      <button onClick={handleVisited}>
        {visited ? "visited" : "not visited"}
      </button>
    </div>
  );
}
