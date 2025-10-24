// components/Profile.jsx
import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

import { auth, db } from "../utils/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { supabase } from "../client";
import UploadAvatar from "../components/UploadAvatar";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("client");
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    contact_email: "",
    body_weight: "",
    body_fat: "",
    height: "",
    fitness_goal: "",
    daily_activity_level: "",
    profile_pic_url: "",
  });

  // ✅ Load the current user from Supabase first, then Firestore data
  useEffect(() => {
    (async () => {
      setLoading(true);

      // Get Supabase user
      const {
        data: { user: supaUser },
        error,
      } = await supabase.auth.getUser();

      if (!supaUser || error) {
        console.warn("⚠️ No Supabase user found, falling back to Firebase");
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          alert("Please log in first.");
          setLoading(false);
          return;
        }
        setUser(firebaseUser);
      } else {
        setUser({ uid: supaUser.id, email: supaUser.email });
      }

      const uid = supaUser?.id || auth.currentUser?.uid;
      const email = supaUser?.email || auth.currentUser?.email;

      if (!uid || !email) {
        alert("Could not find logged-in user");
        setLoading(false);
        return;
      }

      // Load Firestore profile
      const ref = doc(db, "profiles", uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setRole(data.role || "client");
        setForm({
          name: data.name || "",
          age: data.age ?? "",
          gender: data.gender || "",
          phone: data.phone || "",
          contact_email: data.contact_email || email || "",
          body_weight: data.body_weight ?? "",
          body_fat: data.body_fat ?? "",
          height: data.height ?? "",
          fitness_goal: data.fitness_goal || "",
          daily_activity_level: data.daily_activity_level || "",
          profile_pic_url: data.profile_pic_url || "",
        });
      } else {
        // Auto-create minimal profile
        await setDoc(ref, {
          id: uid,
          email: email,
          role: "client",
          created_at: new Date().toISOString(),
        });
      }

      setLoading(false);
    })();
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAvatarChange(url) {
    setForm((prev) => ({ ...prev, profile_pic_url: url }));
  }

  // ✅ Save profile to Firestore (works for Supabase or Firebase users)
  async function onSave() {
    setLoading(true);

    const uid = user?.uid || auth.currentUser?.uid;
    const email = user?.email || auth.currentUser?.email;

    if (!uid) {
      alert("Please log in again");
      setLoading(false);
      return;
    }

    const payload = {
      role,
      ...form,
      email,
      age: form.age !== "" ? Number(form.age) : null,
      body_weight: form.body_weight !== "" ? Number(form.body_weight) : null,
      body_fat: form.body_fat !== "" ? Number(form.body_fat) : null,
      height: form.height !== "" ? Number(form.height) : null,
      updated_at: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "profiles", uid), payload, { merge: true });
      alert("Profile saved successfully!");
      navigate("/ProfileDisplay");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile");
    }
    setLoading(false);
  }

  if (loading) return <div style={{ color: "white" }}>Loading profile...</div>;

  return (
    <div className="profileFormContainer">
      <form className="profileForm" onSubmit={(e) => e.preventDefault()}>
        <div className="profilePicContainer">
          <h2>Edit Photo</h2>
          <UploadAvatar
            currentUrl={form.profile_pic_url}
            onUrlChange={handleAvatarChange}
          />
        </div>

        <h1>Edit Profile</h1>

<div className="contentContainer" >
        <label >
          Full Name
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            type="text"
          />
        </label>

        <label>
          Age
          <input
            name="age"
            value={form.age}
            onChange={onChange}
            type="number"
          />
        </label>

        <label>
          Gender
          <select
            className="gender"
            name="gender"
            value={form.gender}
            onChange={onChange}
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Phone
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            type="tel"
          />
        </label>

        <label>
          Email
          <input
            name="contact_email"
            value={form.contact_email}
            onChange={onChange}
            type="email"
          />
        </label>

        {role === "client" && (
          <>
            <label>
              Body Weight
              <input
                name="body_weight"
                value={form.body_weight}
                onChange={onChange}
                type="number"
              />
            </label>

            <label>
              Body Fat
              <input
                name="body_fat"
                value={form.body_fat}
                onChange={onChange}
                type="number"
              />
            </label>

            <label>
              Height
              <input
                name="height"
                value={form.height}
                onChange={onChange}
                type="number"
              />
            </label>

            <label>
              Fitness Goal
              <input
                name="fitness_goal"
                value={form.fitness_goal}
                onChange={onChange}
                type="text"
              />
            </label>

            <label>
              Daily Activity Level
              <select
                name="dailyActivityLevel"
                value={form.daily_activity_level}
                onChange={onChange}
              >
                <option value="">Select</option>
                <option>Sedentary</option>
                <option>Lightly Active</option>
                <option>Moderately Active</option>
                <option>Very Active</option>
              </select>
            </label>
           
          </> 
        )}
</div>
        <Button className="formButton" type="button" onClick={onSave}>
          Save Profile
        </Button>
      </form>
    </div>
  );
}