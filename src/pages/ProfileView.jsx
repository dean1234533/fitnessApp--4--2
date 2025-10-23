// components/ProfileView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useSelectedClient } from "../components/CreateContext";
import "../styles/ClientInfo.css";

const show = (v) => (v === null || v === undefined || v === "" ? "Not set" : v);

export default function ProfileView() {
  const { clientId: clientIdParam } = useParams();
  const { selectedClientId } = useSelectedClient();
  const navigate = useNavigate();

  const [authReady, setAuthReady] = useState(false);
  const [currentUid, setCurrentUid] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Wait for Firebase auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUid(u?.uid ?? null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // ✅ Which profile to load
  const targetUserId = useMemo(() => {
    const resolved = clientIdParam || selectedClientId || currentUid || null;
    console.log("🔍 ProfileView targetUserId:", resolved);
    return resolved;
  }, [clientIdParam, selectedClientId, currentUid]);

  // ✅ Load profile from Firestore
  useEffect(() => {
    const load = async () => {
      if (!authReady || !targetUserId) return;

      console.log("📂 Fetching profile for:", targetUserId);
      const ref = doc(db, "profiles", targetUserId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        console.log("✅ Profile found:", snap.data());
        setProfile(snap.data());
      } else {
        console.warn("⚠️ No profile doc for:", targetUserId);
        setProfile(null);
      }
      setLoading(false);
    };
    load();
  }, [authReady, targetUserId]);

  if (loading) return <p>Loading profile…</p>;
  if (!profile) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h3>⚠️ No profile found for this user: {targetUserId}</h3>
        <Button
          variant="contained"
          onClick={() => navigate("/clientList")}
          sx={{ mt: 2 }}
        >
          Back to Client List
        </Button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 600, marginTop: "0 auto" }}>
      <div
        className="PicContainer "
        style={{ textAlign: "center", marginBottom: 16 }}
      >
        <Avatar
          className="ProfilePic  "
          alt={profile.name ?? "Profile Picture"}
          src={profile.profile_pic_url ?? "/default-avatar.png"}
          sx={{ width: 140, height: 140, margin: "0 auto" }}
        />
        <h1 className="profileName  " style={{ margin: "12px 0" }}>
          {show(profile.name)}
        </h1>
        <p className="profileInfo">
          {show(profile.age)} years old — {show(profile.gender)}
        </p>
      </div>
      <h2 className="contactInfo">Contact Info</h2>
      <div className="infoContainer">
        <p className="fitnessInfo">
          <strong>Phone </strong>
          <br />
          📞 {show(profile.phone)}
        </p>
        <p className="fitnessInfo">
          <strong>Email </strong>
          <br />
          📧 {show(profile.email)}
        </p>
      </div>
      <h2 className="PhysicalStats">Physical Stats</h2>
      <div className="infoContainer">
        <p className="fitnessInfo">
          <strong>Body Weight </strong>
          <br />
          {show(profile.body_weight)}
        </p>
        <p className="fitnessInfo">
          <strong>Height </strong>
          <br />
          {show(profile.height)}
        </p>
        <p className="fitnessInfo">
          <strong>Body Fat </strong>
          <br />
          {show(profile.body_fat)}
        </p>
      </div>
      <h2 className="fitnessProfile">Fitness Profile</h2>
      <div className="infoContainer">
        <p className="fitnessInfo">
          <strong>Activity Level </strong>
          <br />
          {show(profile.daily_activity_level)}
        </p>
        <p className="fitnessInfo " style={{ marginBottom: "20px" }}>
          <strong>Fitness Goal </strong>
          <br />
          {show(profile.fitness_goal)}
        </p>
      </div>
    </div>
  );
}
