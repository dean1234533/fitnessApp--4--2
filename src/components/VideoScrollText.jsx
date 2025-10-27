import React from "react";
import SwipeLeftIcon from '@mui/icons-material/SwipeLeft';
import "../styles/VideoScrollText.css";


export default function VideoScrollText(){
  return(
    <div className="VideoScrollText-container">
      <SwipeLeftIcon className="VideoScrollText" aria-label="Swipe left to view"  />
      <span>Swipe to View</span>
    </div>
  )
}