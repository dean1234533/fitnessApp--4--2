// ---------- SIGNUP ----------
async function handleSignup(e) {
  e.preventDefault();
  const email = e.currentTarget.email.value.trim();
  const password = e.currentTarget.password.value;
  const name = e.currentTarget.name?.value?.trim() || "";

  try {
    // ✅ Create Firebase user
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    if (role === "client") {
      // ✅ Get trainer selection
      const trainerId =
        chooseManually || !inviteToken
          ? selectedTrainerId
          : inviteToken || null;

      if (!trainerId) {
        alert("Please select a trainer before signing up.");
        return;
      }

      // ✅ Create client profile
      await setDoc(
        doc(db, "profiles", user.uid),
        {
          id: user.uid,
          role: "client",
          name,
          email: user.email,
          trainer_id: trainerId,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        },
        { merge: true } // 🔒 Safe overwrite
      );

      onLogin?.({ id: user.uid, role: "client", name, email: user.email });
      navigate("/Profile");
    } else {
      // ✅ Trainer signup
      await setDoc(
        doc(db, "profiles", user.uid),
        {
          id: user.uid,
          role: "trainer",
          name: name || user.email,
          email: user.email,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );

      // ✅ Add trainer to public directory
      await setDoc(
        doc(db, "trainerDirectory", user.uid),
        {
          name: name || user.email || "Trainer",
          email: user.email,
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );

      onLogin?.({ id: user.uid, role: "trainer", name, email: user.email });
      navigate("/Profile");
    }
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      alert("This email is already in use. Try logging in instead.");
    } else {
      alert(err.message);
    }
  }
}
