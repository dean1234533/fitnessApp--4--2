// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "@mui/material/Button";
import "../styles/Login.css";
import Header from "../components/header";
import { auth, db } from "../utils/firebaseConfig";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

function LoginPage({ onLogin, inviteToken, showSignup = false }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(showSignup ? "signup" : "login");
  const [role, setRole] = useState("client");
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [chooseManually, setChooseManually] = useState(false);

  useEffect(() => {
    setMode(showSignup ? "signup" : "login");
  }, [showSignup]);

  // ✅ Prevent page drift when keyboard opens on iOS
  useEffect(() => {
    const fixScroll = () => window.scrollTo(0, 0);
    window.addEventListener("focusin", fixScroll);
    window.addEventListener("focusout", fixScroll);
    return () => {
      window.removeEventListener("focusin", fixScroll);
      window.removeEventListener("focusout", fixScroll);
    };
  }, []);

  // -------- Load Trainers ----------
  useEffect(() => {
    const needDropdown =
      mode === "signup" &&
      role === "client" &&
      (!inviteToken || chooseManually);

    async function fetchTrainers() {
      setLoadingTrainers(true);
      try {
        const snap = await getDocs(collection(db, "trainerDirectory"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTrainers(list);
      } catch (err) {
        console.error("❌ Error loading trainer directory:", err);
        alert(
          "Could not load trainers. Check Firestore rules and collection name (trainerDirectory)."
        );
        setTrainers([]);
      } finally {
        setLoadingTrainers(false);
      }
    }

    if (needDropdown) fetchTrainers();
  }, [mode, role, inviteToken, chooseManually]);

  // ---------- LOGIN ----------
  async function handleLogin(e) {
    e.preventDefault();
    const email = e.currentTarget.email.value.trim();
    const password = e.currentTarget.password.value;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      const ref = doc(db, "profiles", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(
          ref,
          {
            id: user.uid,
            email: user.email || "",
            name: "",
            role: "client",
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          },
          { merge: true }
        );
      }

      const profile = (await getDoc(ref)).data();
      onLogin?.(profile);

      if (profile.role === "trainer") return navigate("/clientList");
      return navigate("/ClientDashboard");
    } catch (err) {
      alert(err.message);
    }
  }

  // ---------- SIGNUP ----------
  async function handleSignup(e) {
    e.preventDefault();
    const email = e.currentTarget.email.value.trim();
    const password = e.currentTarget.password.value;
    const name = e.currentTarget.name?.value?.trim() || "";

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      if (role === "client") {
        const trainerId =
          chooseManually || !inviteToken
            ? selectedTrainerId
            : inviteToken || null;

        if (!trainerId) {
          alert("Please select a trainer before signing up.");
          return;
        }

        await setDoc(
          doc(db, "profiles", user.uid),
          {
            id: user.uid,
            role: "client",
            name,
            email: user.email || "",
            trainer_id: trainerId,
            contact_email: user.email || "",
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          },
          { merge: true }
        );

        onLogin?.({
          id: user.uid,
          role: "client",
          name,
          email: user.email || "",
        });
        navigate("/Profile");
      } else {
        await setDoc(
          doc(db, "profiles", user.uid),
          {
            id: user.uid,
            role: "trainer",
            name,
            email: user.email || "",
            contact_email: user.email || "",
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          },
          { merge: true }
        );

        await setDoc(
          doc(db, "trainerDirectory", user.uid),
          {
            name: name || user.email || "Trainer",
            email: user.email || "",
            updated_at: serverTimestamp(),
          },
          { merge: true }
        );

        onLogin?.({
          id: user.uid,
          role: "trainer",
          name,
          email: user.email || "",
        });
        navigate("/Profile");
      }
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="loginFormContainer">
      <div className="secondImg">
        <img src="/../images/IMG_4346.PNG" alt="logo" />
      </div>

      {mode === "login" ? (
        <>
          <form className="loginForm" onSubmit={handleLogin}>
            <p>Email Address</p>
            <input
              className="loginInput"
              name="email"
              placeholder="your@email.com"
              type="email"
              required
            />
            <p>Password</p>
            <input
              className="loginInput"
              name="password"
              type="password"
              placeholder="Create a secure password"
              required
            />
            <Button className="submitButton" type="submit" variant="contained">
              Login
            </Button>
          </form>

          <p className="resetLink">
            <button
              type="button"
              className="forgotPasswordButton"
              onClick={async () => {
                const email = prompt("Enter your email to reset your password:");
                if (!email) return;
                try {
                  await sendPasswordResetEmail(auth, email, {
                    url: `${window.location.origin}/reset`,
                  });
                  alert("Password reset email sent.");
                } catch (err) {
                  alert(err.message);
                }
              }}
            >
              Forgot password?
            </button>
          </p>

          {!showSignup && (
            <p className="switchText">
              <Link className="linkButton" to="/ManualSignUp">
                Create an account and pick your trainer
              </Link>
            </p>
          )}
        </>
      ) : (
        <>
          {/* Signup form */}
        </>
      )}
    </div>
  );
}

export default LoginPage;