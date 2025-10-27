import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import "../styles/Workouts.css";
import { supabase } from "../client";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import WorkoutTimer from "../components/WorkoutTimer";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import VideoScrollText from "../components/videoScrollText";


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

  // ✅ FIXED: Proper YouTube embed URL conversion
  const makeEmbed = (url) => {
    if (!url) return "";

    try {
      let videoId = "";

      if (url.includes("v=")) {
        videoId = url.split("v=")[1].split("&")[0];
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      } else if (url.includes("/shorts/")) {
        videoId = url.split("/shorts/")[1].split("?")[0];
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    } catch {
      return "";
    }
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
          <div className="tableScrollWrapper">
            <table>
              
              <thead>
                <tr>
                  <th>Exercise Name</th>
                  <th>Sets</th>
                  <th>Reps</th>
                  <th>Duration</th>
                  <th>Video</th>
                  
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
                        <VideoPlayer url={ex.url} title={ex.name} />
                        
                      )}
                     
                    </td> 
                  </tr>
                  
                ))}
                
              </tbody>
            
            </table>
          </div>
           <SwipeLeftIcon className="VideoScrollText" aria-label="Swipe left to view" />
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

// ✅ NEW: Video Player Component with Mobile Touch Support
function VideoPlayer({ url, title }) {
  const handleVideoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Convert embed URL back to watch URL for better mobile experience
    const videoId = url.split("/embed/")[1]?.split("?")[0];
    const watchUrl = videoId 
      ? `https://www.youtube.com/watch?v=${videoId}`
      : url;
    window.open(watchUrl, '_blank');
  };

  return (
    <div 
      style={{
        position: 'relative',
        width: '160px',
        height: '90px',
        margin: '0 auto'
      }}
    >
      <iframe
        className="exerciseVideo"
        src={`${url}?playsinline=1&rel=0`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ pointerEvents: 'none' }}
      />
      <div
        onClick={handleVideoClick}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVideoClick(e);
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: 'pointer',
          zIndex: 10,
          WebkitTapHighlightColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Play button overlay */}
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(255, 0, 0, 0.9)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '14px solid white',
            borderTop: '9px solid transparent',
            borderBottom: '9px solid transparent',
            marginLeft: '3px'
          }} />
        </div>
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
      <div className="tableScrollWrapper">
        <table>
          <thead>
            <tr>
              <th>Exercise Name</th>
              <th>Sets</th>
              <th>Reps</th>
              <th>Duration</th>
              <th>Video</th>
            </tr>
          </thead>
          <tbody>
            {workout.exercises?.map((ex) => (
              <tr key={ex.id}>
                <td>{ex.name}</td>
                <td>{ex.sets}</td>
                <td>{ex.reps}</td>
                <td>
                  {ex.duration && <WorkoutTimer duration={ex.duration} />}
                </td>
                <td>
                  {ex.url && (
                    <VideoPlayer url={ex.url} title={ex.name} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          
        </table>
        
      </div>
        <SwipeLeftIcon className="VideoScrollText" aria-label="Swipe left to view" />
    </div>
  );
}

export default WorkOuts;