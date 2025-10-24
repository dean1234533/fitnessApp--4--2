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

  // ✅ Fix: stabilize viewport height for iOS Safari
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);
    return () => window.removeEventListener("resize", setViewportHeight);
  }, []);

  // ✅ Fix: re-sync mode when navigating between /SignUpPage and /ManualSignUp
  useEffect(() => {
    setMode(showSignup ? "signup" : "login");
  }, [showSignup]);

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
        console.log("🔥 Trainers fetched:", list);
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
      let snap = await getDoc(ref);

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
        snap = await getDoc(ref);
      }

      const profile = snap.data();
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
            <label htmlFor="email">Email Address</label>
            <input
              className="loginInput"
              name="email"
              id="email"
              placeholder="your@email.com"
              type="email"
              required
            />
            <label htmlFor="password">Password</label>
            <input
              className="loginInput"
              name="password"
              id="password"
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
          <form className="loginForm" onSubmit={handleSignup}>
            <div className="roleToggle">
              <label>
                <p>Client</p>
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={role === "client"}
                  onChange={() => setRole("client")}
                />
              </label>
              <label style={{ marginLeft: 16 }}>
                <p>Trainer</p>
                <input
                  type="radio"
                  name="role"
                  value="trainer"
                  checked={role === "trainer"}
                  onChange={() => setRole("trainer")}
                />
              </label>
            </div>

            <label htmlFor="name">Full Name</label>
            <input
              className="loginInput"
              name="name"
              id="name"
              placeholder="Enter name"
              type="text"
              required
            />

            <label htmlFor="email">Email Address</label>
            <input
              className="loginInput"
              name="email"
              id="email"
              placeholder="your@email.com"
              type="email"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              className="loginInput"
              name="password"
              id="password"
              type="password"
              placeholder="Create a secure password"
              required
            />

            {role === "client" && (
              <div className="trainerSelectContainer">
                {!inviteToken || chooseManually ? (
                  <>
                    <label className="trainerSelectLabel">
                      Select Your Trainer
                    </label>
                    {loadingTrainers ? (
                      <p className="inviteNotice">Loading trainers…</p>
                    ) : trainers.length > 0 ? (
                      <select
                        className="trainerSelect"
                        value={selectedTrainerId}
                        onChange={(e) => setSelectedTrainerId(e.target.value)}
                        required
                      >
                        <option value="">— Choose a trainer... —</option>
                        {trainers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name?.trim() ? t.name : t.email}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="inviteNotice">
                        ⚠️ No trainers found. Make sure at least one trainer has
                        signed up.
                      </p>
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