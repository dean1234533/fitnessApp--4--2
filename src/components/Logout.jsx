import { useEffect } from "react";
import { auth } from "../utils/firebase"; // ✅ make sure this matches your project
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Logout({ onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        await signOut(auth); // ✅ Firebase logout
        onLogout?.(); // flip isAuthenticated=false in App.jsx
        navigate("/SignUpPage", { replace: true }); // ✅ go back to login page
      } catch (error) {
        console.error("Error signing out:", error);
        onLogout?.();
        navigate("/SignUpPage", { replace: true });
      }
    })();
  }, [navigate, onLogout]);

  return <p>Logging out…</p>;
}

export default Logout;
