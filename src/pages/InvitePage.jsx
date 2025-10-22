import React from "react";
import { useParams } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

function InvitePage({ onLogin }) {
  const { token } = useParams(); // trainer id from /invite/:token
  return (
    <LoginPage
      onLogin={onLogin}
      inviteToken={token}
      showSignup={true} // show Sign Up + Login here
    />
  );
}

export default InvitePage;
