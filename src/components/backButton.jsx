import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <div style={{ marginLeft: "20px", marginTop: "20px", cursor: "pointer" }}>
      <ArrowBackIcon onClick={() => navigate(-1)}></ArrowBackIcon>
    </div>
  );
}
