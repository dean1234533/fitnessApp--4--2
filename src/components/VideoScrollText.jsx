import React from "react";
import SwipeLeftIcon from '@mui/icons-material/SwipeLeft';
import "../styles/VideoScrollText.css";


export default function VideoScrollText(){
  return(
    <div className="VideoScrollText-container">
      <SwipeLeftIcon className="VideoScrollText" />
      <span>Swipe to View</span>
    </div>
  )
}