export const getStoredBook =()=>{
    const data=localStorage.getItem("readList");
    if(data){
        const bookData=JSON.parse(data)
        return bookData;  
    }else {
        return [];
    }
}

const addToStoreDB =(id)=>{
    const storedBookData = getStoredBook();
    if(storedBookData.includes(id)){
        alert("This Book Already Exist")
    }else {
        storedBookData.push(id)
        const data = JSON.stringify(storedBookData)
        localStorage.setItem("readList", data)
        console.log(storedBookData)
    }
}

export {addToStoreDB}