import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    if (!email) {
      setMessage("⚠️ Please enter your email");
      return;
    }

    const auth = getAuth();
    try {
      // 👇 Add Action URL (must match Authorized Domain + Firebase template setting)
      await sendPasswordResetEmail(auth, email, {
        url: "https://chat-d7678.firebaseapp.com/__/auth/action",
      });

      setMessage("✅ Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error(error);
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto bg-white shadow rounded">
      <h2 className="text-lg font-bold mb-4">Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-3"
      />

      <button
        onClick={handleReset}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Reset Password
      </button>

      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
