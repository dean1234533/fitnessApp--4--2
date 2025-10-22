// components/UploadAvatar.jsx
import React, { useState } from "react";
import { auth, db } from "../utils/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CircularProgress from "@mui/material/CircularProgress";
import "../styles/Profile.css";

export default function UploadAvatar({ currentUrl, onUrlChange }) {
  const [uploading, setUploading] = useState(false);
  const [localUrl, setLocalUrl] = useState(currentUrl);

  // Convert image to Base64
  function convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleFileChange(e) {
    console.log("=== UPLOAD STARTED ===");

    const file = e.target.files?.[0];
    console.log("File selected:", file?.name, file?.size);

    if (!file) {
      console.log("No file selected");
      return;
    }

    // Check file size (limit to 1MB for Firestore efficiency)
    if (file.size > 1024 * 1024) {
      alert("Image too large! Please choose an image under 1MB.");
      return;
    }

    const user = auth.currentUser;
    console.log("Current user:", user?.uid);

    if (!user) {
      alert("Please log in first");
      return;
    }

    setUploading(true);

    try {
      console.log("Converting to Base64...");
      const base64String = await convertToBase64(file);
      console.log("Conversion complete, length:", base64String.length);

      // Update local preview immediately
      setLocalUrl(base64String);

      // Update parent component state
      if (onUrlChange) {
        console.log("Updating parent component...");
        onUrlChange(base64String);
      }

      // Save to Firestore
      console.log("Saving to Firestore...");
      await setDoc(
        doc(db, "profiles", user.uid),
        { profile_pic_url: base64String },
        { merge: true }
      );
      console.log("Saved to Firestore successfully!");

      alert("✓ Avatar uploaded successfully!");
    } catch (err) {
      console.error("❌ ERROR:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      console.log("=== UPLOAD COMPLETE ===");
    }
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Avatar
        className="profilePic"
        src={localUrl || currentUrl || undefined}
        alt="Profile Picture"
        sx={{ width: 120, height: 120 }}
      >
        {!(localUrl || currentUrl) &&
          auth.currentUser?.email?.[0]?.toUpperCase()}
      </Avatar>

      <IconButton
        color="primary"
        aria-label="upload picture"
        component="label"
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          backgroundColor: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          "&:hover": { backgroundColor: "#f0f0f0" },
        }}
        disabled={uploading}
      >
        <input
          hidden
          accept="image/*"
          type="file"
          onChange={handleFileChange}
        />
        <PhotoCamera />
      </IconButton>

      {uploading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.7)",
            borderRadius: "50%",
            gap: "8px",
          }}
        >
          <CircularProgress size={30} sx={{ color: "white" }} />
          <span style={{ color: "white", fontSize: "11px" }}>Uploading...</span>
        </div>
      )}
    </div>
  );
}
