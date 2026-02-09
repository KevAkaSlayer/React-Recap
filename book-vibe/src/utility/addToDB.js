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
    alert("added to the readlist");
    storedBookData.push(id);
    const data = JSON.stringify(storedBookData);
    localStorage.setItem("readList", data);
    console.log(storedBookData);
  }
  return storedBookData;
};

const deleteFromStoreDB = (id) => {
  const storedBookData = getStoredBook();
  const remainingBooks = storedBookData.filter((bookId) => bookId !== id);
  const data = JSON.stringify(remainingBooks);
  localStorage.setItem("readList", data);
  return remainingBooks;
};

const getNotes = () => {
  const data = localStorage.getItem("noteList");
  if (data) {
    const noteData = JSON.parse(data);
    return noteData;
  } else {
    return [];
  }
};

const createNote = (note) => {
  const storedNotes = getNotes();
  storedNotes.push(note);
  console.log(storedNotes);
  const data = JSON.stringify(storedNotes);
  localStorage.setItem("noteList", data);
  return storedNotes;
};

const deleteNote = (title) => {
  const storedNotes = getNotes();
  const remainingNotes = storedNotes.filter((note) => note.title !== title);
  const data = JSON.stringify(remainingNotes);
  localStorage.setItem("noteList", data);
  return remainingNotes;
};

export { addToStoreDB, deleteFromStoreDB, createNote, getNotes, deleteNote };
