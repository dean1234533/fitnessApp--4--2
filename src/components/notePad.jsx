import React, { useState, useEffect } from "react";
import { supabase } from "../client";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import "../styles/notePad.css";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditNoteIcon from "@mui/icons-material/EditNote";

export default function NotePad() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Problem fetching data:", error.message);
    } else {
      setNotes(data || []);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;

    const { error } = await supabase
      .from("notes")
      .insert([{ note: note.trim() }]);

    if (error) {
      console.error("Error adding note:", error.message);
    } else {
      setNote("");
      loadEntries();
    }
  };

  const editNote = async (id, currentNote) => {
    const newNote = prompt("Edit your note", currentNote);
    if (!newNote || !newNote.trim()) return;

    const { error } = await supabase
      .from("notes")
      .update({ note: newNote.trim() })
      .eq("id", id);

    if (error) {
      console.error("Error editing note:", error.message);
    } else {
      loadEntries();
    }
  };

  const deleteNote = async (id) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      console.error("Error deleting note:", error.message);
    } else {
      loadEntries();
    }
  };

  return (
    <div className="notePadContainer">
      <div className="notePad">
        <h1 className="notePadName">Note Pad</h1>

        <textarea
          className="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter your note here..."
        />

        <div className="notePadButtonContainer">
          <Button
            style={{  border: "2px solid white" }}
            className="notePadButton"
            variant="contained"
            onClick={addNote}
          >
            <AddIcon />
          </Button>
        </div>
      </div>

      <h2 className="notes">Notes</h2>

      {notes.length === 0 ? (
        <p>No notes yet. Add one above!</p>
      ) : (
        notes.map((n) => (
          <div className="savedNotes" key={n.id}>
            <p>{n.note}</p>
            <EditNoteIcon onClick={() => editNote(n.id, n.note)}>
              Edit
            </EditNoteIcon>
            <DeleteForeverIcon
              onClick={() => deleteNote(n.id)}
              style={{ marginLeft: "1rem" }}
            >
              Delete
            </DeleteForeverIcon>
          </div>
        ))
      )}
    </div>
  );
}
