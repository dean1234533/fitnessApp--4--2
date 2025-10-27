import React from "react";
import SwipeLeftIcon from '@mui/icons-material/SwipeLeft';
import "../styles/VideoScrollText.css";


export default function VideoScrollText(){
  return(
    <div className="VideoScrollTextContainer">
      <SwipeLeftIcon className="VideoScrollText" aria-label="Swipe left to view"  />
      <span className="Text">Swipe to View</span>
    </div>
  )
}