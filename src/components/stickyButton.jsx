import React, { useState } from "react";

export default function ScrollButton() {
  const [toBottom, setToBottom] = useState(true);

  const handleClick = () => {
    window.scrollTo({
      top: toBottom ? document.body.scrollHeight : 0,
      behavior: "smooth",
    });

    setToBottom(!toBottom);
  };
  return (
    <button
      onClick={handleClick}
      style={{
        position: "fixed",
        zIndex: "1000",
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
      }}
    >
      {toBottom ? "↓" : "↑"}
    </button>
  );
}
