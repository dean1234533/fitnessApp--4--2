import React, { useState, useEffect } from "react";

export default function ScrollButton() {
  const [toBottom, setToBottom] = useState(true);
  const [scrollableElement, setScrollableElement] = useState(null);

  useEffect(() => {
    // Find the scrollable element on mount
    const findScrollable = () => {
      // Check if window is scrollable
      if (document.documentElement.scrollHeight > window.innerHeight) {
        return window;
      }
      
      // Check body
      if (document.body.scrollHeight > document.body.clientHeight) {
        return document.body;
      }
      
      // Find any scrollable div
      const allElements = document.querySelectorAll('*');
      for (let el of allElements) {
        if (el.scrollHeight > el.clientHeight && 
            getComputedStyle(el).overflow !== 'hidden') {
          return el;
        }
      }
      
      return window;
    };

    setScrollableElement(findScrollable());
  }, []);

  const handleClick = () => {
    if (!scrollableElement) return;

    if (toBottom) {
      // Scroll to bottom
      if (scrollableElement === window) {
        window.scrollTo({ top: 999999, behavior: "smooth" });
      } else {
        scrollableElement.scrollTo({ top: scrollableElement.scrollHeight, behavior: "smooth" });
      }
      setTimeout(() => setToBottom(false), 100);
    } else {
      // Scroll to top
      if (scrollableElement === window) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        scrollableElement.scrollTo({ top: 0, behavior: "smooth" });
      }
      setTimeout(() => setToBottom(true), 100);
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
