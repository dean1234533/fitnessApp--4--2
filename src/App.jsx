import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // ✅ remove BrowserRouter here
import { supabase } from "./client";
import "./styles/App.css"; 

import LoginPage from "./pages/LoginPage";
import LoginApp from "./LoginApp";
import InvitePage from "./pages/InvitePage";
import ResetPassword from "./pages/ResetPassword"; // ✅ keep this

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data?.session);
      setCheckingSession(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setIsAuthenticated(!!session)
    );
    return () => listener?.subscription?.unsubscribe();
  }, []);

  if (checkingSession) return null;

  return (
    <Routes>
      {/* MAIN: Login only */}
      <Route
        path="/SignUpPage"
        element={
          <LoginPage
            onLogin={() => setIsAuthenticated(true)}
            showSignup={false}
          />
        }
      />

      {/* INVITE LINK: Sign Up + Login (auto-links client to trainer) */}
      <Route
        path="/invite/:token"
        element={<InvitePage onLogin={() => setIsAuthenticated(true)} />}
      />

      {/* MANUAL SIGN UP (fallback when no invite) */}
      <Route
        path="/ManualSignUp"
        element={
          <LoginPage
            onLogin={() => setIsAuthenticated(true)}
            showSignup={true}
          />
        }
      />

      {/* PASSWORD RESET LANDING (from email link) */}
      <Route path="/reset" element={<ResetPassword />} />

      {/* PROTECTED APP */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <LoginApp onLogout={() => setIsAuthenticated(false)} />
          ) : (
            <Navigate to="/SignUpPage" replace />
          )
        }
      />
    </Routes>
  );
}
