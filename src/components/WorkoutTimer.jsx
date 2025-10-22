import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import "../styles/timer.css";

export default function WorkoutTimer({ duration = 60 }) {
  const [time, setTime] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    }

    if (time === 0 && isRunning) {
      setIsRunning(false);

      if (audioRef.current) {
        audioRef.current
          .play()
          .catch((err) => console.log("Audio play failed:", err));
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  return (
    <div className="timerContainer">
      <audio
        ref={audioRef}
        src="/sounds/buzzer-of-car-wash-107990.mp3"
        preload="auto"
      />
      <div className="timer">{time}s</div>
      <div className="buttonWrap">
        <button className="timerStart" onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          className="timerReset"
          onClick={() => {
            setTime(duration);
            setIsRunning(false);
          }}
        >
          <RotateCcw size={20} />
          Reset
        </button>
      </div>
    </div>
  );
}
