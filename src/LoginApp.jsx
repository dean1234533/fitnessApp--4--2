// src/LoginApp.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { auth } from "./utils/firebaseConfig";
import AppBars from "./components/AppBar";
import ClientDashboard from "./pages/ClientDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import ClientList from "./components/clientList";
import TrainerChat from "./components/TrainerChat";
import Profile from "./components/Profile";
import WorkOuts from "./pages/workoutsPage";
import FoodDiary from "./pages/foodDiary";
import FoodGenerator from "./components/foodGenerator";
import ProfileDisplay from "./pages/ProfileDisplay";
import ProfileView from "./pages/ProfileView";
import NotePad from "./components/notePad";
import { SelectedClientProvider } from "./components/CreateContext";
import Header from "./components/header";
import ScrollButton from "./components/stickyButton";
import { useAuthSync } from "./components/useAuthSync";

function LoginApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUserId, setCurrentUserId] = useState(null);

  // ✅ Ensure Supabase row exists for the logged-in user
  useAuthSync();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setCurrentUserId(user.uid);
      else navigate("/"); // back to landing/login
    });
    return () => unsub();
  }, [navigate]);

  // Pages where AppBars should be hidden
  const hideAppBarsOn = ["/clientList", "/trainer/clients"];
  const shouldShowAppBars = !hideAppBarsOn.includes(location.pathname);

  // Pages where ScrollButton should be hidden
  const hideScrollButtonOn = [
    "/clientList",
    "/ClientDashboard",
    "/FoodGenerator",
    "/profile",
    "/ProfileDisplay",
    "/ProfileView",
    "/trainer/clients",
  ];

  // Check both exact matches and dynamic paths like /TrainerDashboard/:clientId
  const shouldShowScrollButton = !hideScrollButtonOn.includes(location.pathname) &&
    !location.pathname.startsWith("/TrainerDashboard/") &&
    !location.pathname.startsWith("/ProfileView/")
    

  // Pages where Header should be hidden
  const hideHeaderOn = ["/ClientDashboard"];
  const shouldShowHeader =
    !hideHeaderOn.includes(location.pathname) &&
    !location.pathname.startsWith("/TrainerDashboard/");

  return (
    <SelectedClientProvider>
      {shouldShowScrollButton && <ScrollButton />}
      {shouldShowAppBars && <AppBars />}
      <div>
        {shouldShowHeader && <Header />}

        <Routes>
          {/* Dashboards */}
          <Route path="/ClientDashboard" element={<ClientDashboard />} />
          <Route
            path="/TrainerDashboard/:clientId"
            element={<TrainerDashboard />}
          />

          {/* Trainer viewing a specific client */}
          <Route
            path="/ClientDashboard/:clientId/dashboard"
            element={<ClientDashboard />}
          />

          {/* Client list and trainer routes */}
          <Route path="/clientList" element={<ClientList />} />
          <Route path="/trainer/clients" element={<ClientList />} />

          {/* Profile routes */}
          <Route path="/Profile" element={<Profile />} />
          <Route path="/ProfileView" element={<ProfileView />} />
          <Route path="/ProfileView/:clientId" element={<ProfileView />} />
          <Route
            path="/ProfileDisplay"
            element={<ProfileDisplay userRole="client" />}
          />

          {/* Workouts */}
          <Route
            path="/trainer/workoutsPage/:clientId"
            element={<WorkOuts userRole="trainer" />}
          />
          <Route
            path="/client/workoutsPage"
            element={<WorkOuts userRole="client" />}
          />
          <Route
            path="/workoutsPage"
            element={<WorkOuts userRole="trainer" />}
          />

          {/* Food Diary */}
          <Route
            path="/client/FoodDiary"
            element={<FoodDiary userRole="client" />}
          />
          <Route
            path="/trainer/FoodDiary/:clientId"
            element={<FoodDiary userRole="trainer" />}
          />
          <Route
            path="/FoodDiaryDisplay"
            element={<FoodDiary userRole="trainer" />}
          />

          {/* Chat */}
          <Route path="/TrainerChat" element={<TrainerChat />} />
          <Route path="/TrainerChat/:userId" element={<TrainerChat />} />

          {/* Other */}
          <Route path="/FoodGenerator" element={<FoodGenerator />} />
          <Route path="/NotePad" element={<NotePad />} />
        </Routes>
      </div>
    </SelectedClientProvider>
  );
}

export default LoginApp;
