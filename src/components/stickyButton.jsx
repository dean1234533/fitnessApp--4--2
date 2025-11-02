import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollButton() {
  const [toBottom, setToBottom] = useState(true);
  const location = useLocation();

  const findScrollableElement = () => {
    // Wait for page to render
    setTimeout(() => {
      // Check if window is scrollable
      if (document.documentElement.scrollHeight > window.innerHeight) {
        return window;
      }
      
      // Find scrollable container
      const allElements = document.querySelectorAll('*');
      for (let el of allElements) {
        const style = getComputedStyle(el);
        if (el.scrollHeight > el.clientHeight && 
            (style.overflow === 'auto' || style.overflow === 'scroll' || 
             style.overflowY === 'auto' || style.overflowY === 'scroll')) {
          return el;
        }
      }
      
      return window;
    }, 100);
  };

  // Reset state when route changes
  useEffect(() => {
    setToBottom(true);
    findScrollableElement();
  }, [location.pathname]);

  const handleClick = () => {
    // Find scrollable element fresh each time
    let scrollableElement = window;
    
    // Check if window scrolls
    if (document.documentElement.scrollHeight > window.innerHeight) {
      scrollableElement = window;
    } else {
      // Find scrollable div
      const allElements = document.querySelectorAll('*');
      for (let el of allElements) {
        const style = getComputedStyle(el);
        if (el.scrollHeight > el.clientHeight && 
            (style.overflow === 'auto' || style.overflow === 'scroll' || 
             style.overflowY === 'auto' || style.overflowY === 'scroll')) {
          scrollableElement = el;
          break;
        }
      }
    }

    if (toBottom) {
      if (scrollableElement === window) {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      } else {
        scrollableElement.scrollTo({ top: scrollableElement.scrollHeight, behavior: "smooth" });
      }
      setTimeout(() => setToBottom(false), 200);
    } else {
      if (scrollableElement === window) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        scrollableElement.scrollTo({ top: 0, behavior: "smooth" });
      }
      setTimeout(() => setToBottom(true), 200);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: "fixed",
        zIndex: 9999,
        right: "20px",
        bottom: "20px",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        border: "2px solid white",
        color: "white",
        fontSize: "24px",
        cursor: "pointer",
        background: `#ab0303 url("https://www.transparenttextures.com/patterns/45-degree-fabric-light.png")`,
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
      }}
    >
      {toBottom ? "↓" : "↑"}
    </button>
  );
}
