// components/DropDown.jsx
import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useSelectedClient } from "../components/CreateContext";
import "../styles/DropDown.css";

function DropDown() {
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const { selectedClientId, selectedClientName, clearSelectedClient } =
    useSelectedClient();

  // ✅ Fetch role from Firestore once
  useEffect(() => {
    const loadRole = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const snap = await getDoc(doc(db, "profiles", uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserRole(data.role || null);
        } else {
          console.warn("No profile found for user:", uid);
        }
      } catch (err) {
        console.error("Error fetching role:", err);
      }
    };
    loadRole();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // ✅ Firebase logout
      clearSelectedClient(); // ✅ reset context
      navigate("/SignUpPage", { replace: true }); // back to login
    } catch (e) {
      console.error("Sign out failed:", e);
      navigate("/SignUpPage", { replace: true });
    }
  };

  return (
    <div className="DropDownContainer">
      <Button
        className="DropDownButton"
        variant="contained"
        onClick={() => setOpen((v) => !v)}
      >
        Menu
      </Button>

      {open && (
        <ul className="List">
          {/* Trainers get Client List */}
          {userRole === "trainer" && (
            <li
              onClick={() => {
                navigate("/clientList");
                setOpen(false);
              }}
            >
              Client List
            </li>
          )}

          {/* Everyone gets Profile */}
          <li
            onClick={() => {
              navigate("/ProfileDisplay");
              setOpen(false);
            }}
          >
            Profile
          </li>

          {/* Trainers see selected client’s profile */}
          {userRole === "trainer" && (
            <li
              onClick={() => {
                if (selectedClientId) {
                  navigate(`/ProfileView/${selectedClientId}`);
                } else {
                  alert(
                    "⚠️ Please select a client first from your Client List."
                  );
                }
                setOpen(false);
              }}
              title={
                selectedClientName
                  ? `Viewing: ${selectedClientName}`
                  : "View profile"
              }
            >
              {selectedClientName ? `Client Info ` : "Profile View"}
            </li>
          )}

          {/* Clients see NotePad */}
          {userRole === "client" && (
            <li
              onClick={() => {
                navigate("/NotePad");
                setOpen(false);
              }}
            >
              Note Pad
            </li>
          )}

          {/* Logout */}
          <li
            onClick={async () => {
              setOpen(false);
              await handleLogout();
            }}
          >
            Logout
          </li>
        </ul>
      )}
    </div>
  );
}

export default DropDown;
