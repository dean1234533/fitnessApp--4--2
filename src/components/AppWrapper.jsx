// src/AppWrapper.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "./client";
import App from "./App";

export default function AppWrapper() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) console.error(error);
      setCurrentUser(user || null);
      setLoading(false);
    }
    load();

    // subscribe to auth changes (optional)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // if session present, refresh
        supabase.auth
          .getUser()
          .then(({ data: { user } }) => setCurrentUser(user || null));
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <p>Loading auth...</p>;
  return <App currentUser={currentUser} />;
}
