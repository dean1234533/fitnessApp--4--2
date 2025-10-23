import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import "../styles/Workouts.css";
import { supabase } from "../client";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import WorkoutTimer from "../components/WorkoutTimer";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

function WorkOuts({ userRole }) {
  const auth = getAuth();
  const { clientId } = useParams();

  const [userId, setUserId] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [exercise, setExercise] = useState({
    name: "",
    sets: "",
    reps: "",
    duration: "",
    url: "",
  });

  // Load workouts on mount or role/client change
  useEffect(() => {
    const id = userRole === "client" ? auth.currentUser?.uid : clientId;
    if (!id) return;
    setUserId(id);
    fetchWorkouts(id);
  }, [userRole, clientId]);

  // Fetch workouts and exercises
  const fetchWorkouts = async (id) => {
    const { data, error } = await supabase
      .from("workouts")
      .select("id, name, exercises(id, name, sets, reps, duration, url)")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch workouts error:", error);
    } else {
      setWorkouts(data || []);
    }
  };

  // Save workout
  const saveWorkout = async () => {
    if (!workoutName || exercises.length === 0 || !userId) return;

    const { data: workout, error } = await supabase
      .from("workouts")
      .insert([{ name: workoutName, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error("Workout insert error:", error);
      return;
    }

    const { error: exError } = await supabase.from("exercises").insert(
      exercises.map((ex) => ({
        workout_id: workout.id,
        name: ex.name,
        sets: ex.sets ? Number(ex.sets) : null,
        reps: ex.reps ? Number(ex.reps) : null,
        duration: ex.duration ? Number(ex.duration) : null,
        url: ex.url,
      }))
    );

    if (exError) {
      console.error("Exercise insert error:", exError);
      return;
    }

    setWorkoutName("");
    setExercises([]);
    fetchWorkouts(userId);
  };

  // Delete workout
  const deleteWorkout = async (id) => {
    const { error } = await supabase
      .from("workouts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Delete workout error:", error);
      return;
    }

    fetchWorkouts(userId);
  };

  // Add local exercise
  const addExercise = () => {
    if (!exercise.name) return;
    setExercises([
      ...exercises,
      { ...exercise, url: exercise.url ? makeEmbed(exercise.url) : "" },
    ]);
    setExercise({ name: "", sets: "", reps: "", duration: "", url: "" });
  };

  // Convert YouTube link to embeddable format
  const makeEmbed = (url) => {
    if (url.includes("v="))
      return `https://www.youtube.com/embed/${url.split("v=")[1].split("&")[0]}`;
    if (url.includes("/shorts/"))
      return `https://www.youtube.com/embed/${url.split("/shorts/")[1].split("?")[0]}`;
    if (url.includes("youtu.be/"))
      return `https://www.youtube.com/embed/${url.split("youtu.be/")[1].split("?")[0]}`;
    return url;
  };

  return (
    <div className="workoutsPageContainer">
      {userRole === "trainer" && (
        <form className="workoutsForm" onSubmit={(e) => e.preventDefault()}>
          <h1 className="workoutsH1">
            {userRole === "trainer" ? "Client Workouts" : "My Workouts"}
          </h1>
          <input
            className="workoutInput"
            placeholder="Workout Name"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />
          <h2>Add Exercise</h2>
          {["name", "reps", "sets", "duration", "url"].map((field) => (
            <input
              key={field}
              className="exerciseInput"
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={exercise[field]}
              onChange={(e) =>
                setExercise({ ...exercise, [field]: e.target.value })
              }
            />
          ))}
          <Button
            className="addExerciseButton"
            onClick={addExercise}
            variant="outlined"
          >
            Add Exercise
          </Button>
          <Button
            className="saveWorkoutButton"
            onClick={saveWorkout}
            variant="contained"
          >
            Save Workout
          </Button>
        </form>
      )}

      {/* Exercises Preview */}
      {exercises.length > 0 && (
        <div className="DisplayExercise">
          <h2 className="ExercisesPreview">Exercises Preview</h2>
          <table>
            <thead>
              <tr>
                <th>Exercise Name</th>
                <th>Sets</th>
                <th>Reps</th>
                <th>Duration</th>
                <th>Url</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex, i) => (
                <tr key={i}>
                  <td>{ex.name}</td>
                  <td>{ex.sets}</td>
                  <td>{ex.reps}</td>
                  <td>
                    {ex.duration && <WorkoutTimer duration={ex.duration} />}
                  </td>
                  <td>
                    {ex.url && (
                      <div className="videoWrapper">
                        <iframe
                          src={ex.url}
                          title={ex.name}
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Saved Workouts */}
      <div className="DisplayWorkouts">
        <h2 className="savedWorkouts">Saved Workouts</h2>
        {workouts.length > 0 ? (
          workouts.map((w) => (
            <WorkoutCard key={w.id} workout={w} onDelete={deleteWorkout} />
          ))
        ) : (
          <p>No workouts found</p>
        )}
      </div>
    </div>
  );
}

// Workout Card Component
function WorkoutCard({ workout, onDelete }) {
  return (
    <div className="workoutCardContainer">
      <DeleteForeverIcon
        className="deleteWorkoutButton"
        onClick={() => onDelete(workout.id)}
      />
      <h3 className="workoutName">{workout.name}</h3>
      <table>
        <thead>
          <tr>
            <th>Exercise Name</th>
            <th>Duration</th>
            <th>Reps</th>
            <th>Secs</th>
            <th>Url</th>
          </tr>
        </thead>
        <tbody>
          {workout.exercises?.map((ex) => {
            const embedUrl = ex.url
              ? ex.url
                  .replace("watch?v=", "embed/")
                  .replace("youtu.be/", "youtube.com/embed/")
                  .replace("/shorts/", "/embed/")
              : "";

            return (
              <tr key={ex.id}>
                <td>{ex.name}</td>
                <td>{ex.sets}</td>
                <td>{ex.reps}</td>
                <td>
                  {ex.duration && <WorkoutTimer duration={ex.duration} />}
                </td>
                <td>
                  {embedUrl && (
                    <div className="videoWrapper">
                      <iframe
                        src={embedUrl}
                        title={ex.name}
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default WorkOuts;
