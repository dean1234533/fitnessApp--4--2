import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import { auth, db } from "../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "../styles/profileDisplayPage.css";

export default function ProfileDisplay({ profileUserId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log("No authenticated user");
        setLoading(false);
        return;
      }

      const targetUserId = profileUserId || currentUser.uid;
      console.log("Loading profile for:", targetUserId);

      try {
        const ref = doc(db, "profiles", targetUserId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          console.log("Profile not found in Firestore.");
          setProfile({});
        } else {
          const data = snap.data();
          console.log("Loaded profile:", data);
          setProfile(data);
          setIsOwnProfile(targetUserId === currentUser.uid);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setProfile({});
      }

      setLoading(false);
    };

    loadProfile();
  }, [profileUserId]);

  if (loading) {
    return (
      <div className="loading-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container">
      {/* Avatar Section */}
      <div className="avatar">
        <h1 className="profileH1">Profile</h1>
        <Avatar
          className="profileAvatar"
          alt={profile.name || "Profile Picture"}
          src={profile.profile_pic_url || "/default-avatar.png"}
        />
        <div className="name">{profile.name?.toUpperCase() || "NOT SET"}</div>
        <div className="Age">
          {(profile.age && profile.age.toString().trim()) || "Not set"} years old -{" "}
          {(profile.gender && profile.gender.trim()) || "Not set"}
        </div>
      </div>

      {/* Profile Details */}
      <div className="profile-details">
        {profile.role === "client" && (
          <>
            <div className="contactInfoContainer">
              <h3 className="contactInfo">Contact Info</h3>
            </div>
            <div className="phone">
              <strong>Phone</strong> <br />
              {(profile.phone && profile.phone.trim()) || "Not set"}
            </div>
            <div className="email">
              <strong>Email</strong>
              <br />
              {(profile.contact_email && profile.contact_email.trim()) ||
                profile.email ||
                "Not set"}
            </div>
          </>
        )}

        {profile.role === "trainer" && isOwnProfile && (
          <Button
            className="editProfile"
            variant="contained"
            onClick={() => navigate("/profile")}
          >
            Edit Profile
          </Button>
        )}

        {profile.role === "client" && (
          <>
            <div className="physicalStatsContainer">
              <h3 className="physicalStats">Physical Stats</h3>
            </div>

            <div className="profileInfo">
              <div className="weight">
                <strong>Weight</strong>
                <br />
                {(profile.body_weight && profile.body_weight.toString().trim()) ||
                  "Not set"}{" "}
                KG
              </div>
              <div className="bodyFat">
                <strong>Body Fat</strong>
                <br />
                {(profile.body_fat && profile.body_fat.toString().trim()) ||
                  "Not set"}{" "}
                %
              </div>
              <div className="height">
                <strong>Height</strong>
                <br />
                {(profile.height && profile.height.toString().trim()) ||
                  "Not set"}{" "}
                Cm
              </div>
            </div>

            <div className="fitnessProfileContainer">
              <h3 className="fitnessProfile">Fitness Profile</h3>
            </div>

            <div className="fitnessGoal">
              <strong>Fitness Goal</strong>
              <br />
              {(profile.fitness_goal && profile.fitness_goal.trim()) || "Not set"}
            </div>
            <div className="activityLevel">
              <strong>Activity Level</strong>
              <br />
              {(profile.daily_activity_level &&
                profile.daily_activity_level.trim()) || "Not set"}
            </div>

            {isOwnProfile && (
              <Button
                className="EditProfileButton"
                variant="contained"
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
   

