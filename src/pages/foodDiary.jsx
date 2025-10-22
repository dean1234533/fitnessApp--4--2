// componants/FoodDiary.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import "../styles/FoodDiaryForm.css";
import { supabase } from "../client";
import { auth } from "../utils/firebaseConfig";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

function FoodDiary({ userRole }) {
  const { clientId } = useParams(); // available when trainer navigates
  const [foods, setFoods] = useState("");
  const [water, setWater] = useState("");
  const [eatTime, setEatTime] = useState("");
  const [entries, setEntries] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadEntries();
  }, [clientId, userRole]);

  // Load diary entries
  const loadEntries = async () => {
    let userId;

    if (userRole === "client") {
      userId = auth.currentUser?.uid; // logged-in client
    } else if (userRole === "trainer" && clientId) {
      userId = clientId; // trainer viewing client’s diary
    }

    if (!userId) return;

    const { data, error } = await supabase
      .from("diary")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false });

    if (error) {
      console.error("Load error:", error);
      setErrorMsg(error.message);
      return;
    }
    setEntries(data || []);
  };

  // Save entry (only clients)
  const save = async () => {
    if (userRole !== "client") return; // trainers cannot save

    setErrorMsg("");
    if (!foods || !water || !eatTime) {
      setErrorMsg("Please fill all fields before saving.");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    const { error } = await supabase.from("diary").insert([
      {
        user_id: user.uid,
        food_name: foods,
        water_intake: water,
        eat_time: eatTime,
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
      setErrorMsg(error.message);
      return;
    }

    setFoods("");
    setWater("");
    setEatTime("");
    loadEntries();
  };

  // Delete entry (only clients)
  const deleteEntry = async (id) => {
    if (userRole !== "client") return; // trainers cannot delete

    const user = auth.currentUser;
    if (!user) return;

    const { error } = await supabase
      .from("diary")
      .delete()
      .eq("id", id)
      .eq("user_id", user.uid);

    if (error) {
      console.error("Delete error:", error);
      setErrorMsg(error.message);
      return;
    }
    loadEntries();
  };

  return (
    <div className="App">
      <div className="DiaryContainer">
        <h2 className="foodDiaryH2">
          {userRole === "trainer" ? "Client Food Diary" : "My Food Diary"}
        </h2>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

        {/* Show form only for clients */}
        {userRole === "client" && (
          <>
            <select
              className="mealSelect"
              value={eatTime}
              onChange={(e) => setEatTime(e.target.value)}
            >
              <option value="">Select Meal Time</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>

            <input
              className="DiaryInput"
              type="text"
              placeholder="Enter Food Name"
              value={foods}
              onChange={(e) => setFoods(e.target.value)}
            />

            <input
              className="DiaryInput"
              type="text"
              placeholder="Enter Water Intake (e.g., 1L)"
              value={water}
              onChange={(e) => setWater(e.target.value)}
            />

            <Button
              className="DiaryButton"
              onClick={save}
              variant="contained"
              sx={{ marginTop: "10px",padding: {lg:"14px",md:"12px", sm:"8px"}, }}
            >
              Add Entry
            </Button>
          </>
        )}

        {/* Entries */}
        <div className="DiaryEntries">
          {entries.length > 0 ? (
            entries.map((item) => (
              <div key={item.id} className="DiaryEntry">
                <h2 className="mealType">{item.eat_time}</h2>
                <p className="foodItem">
                  <strong>Food Item</strong>
                  <br /> <div>{item.food_name}</div>
                </p>
                <p className="waterIntake">
                  <strong>Water Intake</strong>
                  <br />
                  <div>{item.water_intake} L</div>
                </p>
                <p className="timeStamp">
                  {item.time_stamp
                    ? new Date(item.time_stamp).toLocaleString()
                    : "—"}
                </p>

                {/* Only clients can delete */}
                {userRole === "client" && (
                  <DeleteIcon
                    sx={{ cursor: "pointer", color: "#f44336" }}
                    onClick={() => deleteEntry(item.id)}
                  />
                )}
              </div>
            ))
          ) : (
            <p>No entries found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodDiary;
