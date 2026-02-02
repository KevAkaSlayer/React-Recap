import { use } from "react";
import { useState } from "react";
import Country from "./Country";
export default function Countries({ countriesPromise }) {
  const [visitedCount, setVisitedCount] = useState([])  
  const countries = use(countriesPromise);
  const handleVisitedCount=(country)=>{
    const newVisitedCountries = [...visitedCount,country]
    setVisitedCount(newVisitedCountries)
  }
  return (
    <div>
      <h1>Countries : {countries.length}</h1>
      <h3>visited countries : {visitedCount.length}</h3>
      {
        countries.map(country=><Country key={country.cca2} country = {country} handleVisitedCount = {handleVisitedCount}></Country>)
      }
    </div>
  );
}
