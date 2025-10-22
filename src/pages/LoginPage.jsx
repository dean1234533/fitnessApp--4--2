import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "@mui/material/Button";

// ✅ Corrected path — public files aren't imported directly
// Move `Login.css` into `src/styles/` or `src/` then import like this:
import "../styles/Login.css";

// ✅ Corrected folder name (should be components, not componants)
import Header from "../components/header";

// ✅ Firebase config path — from src/firebaseConfig.js
import { auth, db } from "../utils/firebaseConfig";

// ✅ Firebase auth & firestore imports
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
        console.error("Error loading trainer directory:", err);
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
          alert("Please select a trainer");
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
            phone: "",
            profile_pic_url: "",
            age: null,
            gender: "",
            body_weight: null,
            body_fat: null,
            height: null,
            fitness_goal: "",
            daily_activity_level: "",
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
            phone: "",
            profile_pic_url: "",
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
      <Header />
      {mode === "login" ? (
        <>
          <form className="loginForm" onSubmit={handleLogin}>
            <input
              className="loginInput"
              name="email"
              placeholder="Email"
              type="email"
              required
            />
            <input
              className="loginInput"
              name="password"
              type="password"
              placeholder="Password"
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
          <form className="loginForm" onSubmit={handleSignup}>
            <div className="roleToggle">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={role === "client"}
                  onChange={() => setRole("client")}
                />
                Client
              </label>
              <label style={{ marginLeft: 16 }}>
                <input
                  type="radio"
                  name="role"
                  value="trainer"
                  checked={role === "trainer"}
                  onChange={() => setRole("trainer")}
                />
                Trainer
              </label>
            </div>

            <input
              className="loginInput"
              name="name"
              placeholder="Full Name"
              type="text"
              required
            />
            <input
              className="loginInput"
              name="email"
              placeholder="Email"
              type="email"
              required
            />
            <input
              className="loginInput"
              name="password"
              type="password"
              placeholder="Password"
              required
            />

            {role === "client" && (
              <div className="trainerSelectContainer">
                {!inviteToken || chooseManually ? (
                  <>
                    <label className="trainerSelectLabel">Select Trainer</label>
                    {loadingTrainers ? (
                      <p className="inviteNotice">Loading trainers…</p>
                    ) : (
                      <select
                        className="trainerSelect"
                        value={selectedTrainerId}
                        onChange={(e) => setSelectedTrainerId(e.target.value)}
                        required
                      >
                        <option value="">— No trainer selected —</option>
                        {trainers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name?.trim() ? t.name : t.email}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                ) : (
                  <p className="inviteNotice">
                    Joining via invite — trainer will be linked automatically.
                  </p>
                )}
              </div>
            )}

            <Button className="submitButton" type="submit" variant="contained">
              Sign Up
            </Button>
          </form>

          <p className="switchText">
            Already have an account?{" "}
            <Button
              className="switchButton"
              type="button"
              onClick={() => setMode("login")}
              variant="text"
            >
              Login
            </Button>
          </p>
        </>
      )}
    </div>
  );
}

export default LoginPage;
