import React, { useEffect, useState } from "react";
import { auth, db } from "../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Avatar from "@mui/material/Avatar";
import "../styles/Card.css";

export default function UserAvatar({ className }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "profiles", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = { id: docSnap.id, ...docSnap.data() };
          setUser(userData);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return;
  <div>...loading</div>;

  if (!user) return;
  <div>User not login in</div>;

  return (
    <Avatar
      className={className || "ButtonAvatar"}
      src={user.profile_pic_url || "/default-avatar.png"}
      alt={user.name || user.email}
    >
      {!user.profile_pic_url &&
        (user.name || user.email)?.charAt(0).toUpperCase()}
    </Avatar>
  );
}
