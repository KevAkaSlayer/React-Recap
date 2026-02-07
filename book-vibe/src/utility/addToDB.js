export const getStoredBook = () => {
  const data = localStorage.getItem("readList");
  if (data) {
    const bookData = JSON.parse(data);
    return bookData;
  } else {
    return [];
  }
};

const addToStoreDB = (id) => {
  const storedBookData = getStoredBook();
  
  if (storedBookData.includes(id)) {
    alert("Already Added to read list!");
  } else {
    alert("added to the readlist")
    storedBookData.push(id);
    const data = JSON.stringify(storedBookData);
    localStorage.setItem("readList", data);
    console.log(storedBookData);
  }
};

const deleteFromStoreDB = (id) => {
  const storedBookData = getStoredBook();
  const remainingBooks = storedBookData.filter((bookId) => bookId !== id);
  const data = JSON.stringify(remainingBooks);
  localStorage.setItem("readList", data);
}

export { addToStoreDB, deleteFromStoreDB };
