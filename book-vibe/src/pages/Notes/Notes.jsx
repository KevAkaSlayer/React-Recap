import { useEffect, useState } from "react";
import { createNote, deleteNote, getNotes } from "../../utility/addToDB";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    setNotes(getNotes());
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const note = e.target.note.value;
    if (!title.trim() || !note.trim()) {
      alert("Please enter both a title and a note.");
      return;
    }
    const newNote = {
      title,
      note,
    };
    const updatedNotes = createNote(newNote);
    setNotes(updatedNotes);
    e.target.reset();
    alert("Note created successfully!");
  };
  const handleDelete = (title) => {
    deleteNote(title);
    const updatedNotes = notes.filter((note) => note.title !== title);
    setNotes(updatedNotes);
  };

  const handleEdit = (title) => {
    const noteToEdit = notes.find((note) => note.title === title);
    const newNoteContent = prompt("Edit your note:", noteToEdit.note);
    if (newNoteContent !== null) {
        const updatedNote = { ...noteToEdit, note: newNoteContent };
        deleteNote(title);
        const updatedNotes = createNote(updatedNote);
        setNotes(updatedNotes);
        alert("Note updated successfully!");
    }
  };


  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="hero bg-base-200">
          <div className="hero-content flex-col lg:flex-row-reverse">
            <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
              <div className="card-body">
                <fieldset className="fieldset">
                  <label className="label">Title</label>
                  <input
                    type="text"
                    className="input"
                    name="title"
                    placeholder="Title"
                  />
                  <label className="label">Create Note</label>
                  <textarea
                    className="textarea"
                    name="note"
                    placeholder="Create Note"
                  ></textarea>
                  <button className="btn">
                    <input type="submit" value="Create" />
                  </button>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </form>
      <div className="grid grid-cols-1 md: grid-cols-3 gap-3 p-3">
        {notes.map((note) => (
          <div className="card bg-neutral text-neutral-content w-96">
            <div className="card-body items-center text-center">
              <h2 className="card-title">{note.title}</h2>
              <p>{note.note}</p>
              <div className="card-actions justify-end">
                <button onClick={()=> handleEdit(note.title)} className="btn btn-primary">Edit</button>
                <button
                  onClick={() => handleDelete(note.title)}
                  className="btn btn-ghost"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
