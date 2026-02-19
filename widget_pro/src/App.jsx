
import { useEffect, useState } from 'react';
import './App.css';
const ZOHO = window.ZOHO;

 export default function App() {
ZOHO.embeddedApp.on("PageLoad",function(data)
{
	ZOHO.CRM.API.getAllRecords({Entity:"Leads",sort_order:"asc",per_page:2,page:1})
  .then(function(data){
    console.log(data)
  })
})

ZOHO.embeddedApp.init();

      

  return (
    <div>
      <h1>Zoho CRM</h1>
    </div>
  );
 };