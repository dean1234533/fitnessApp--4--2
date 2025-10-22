// components/ClientList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../utils/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import { useSelectedClient } from "../components/CreateContext";
import "../styles/clientList.css";

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [me, setMe] = useState(null);
  const navigate = useNavigate();
  const { setSelectedClient } = useSelectedClient();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setMe(user.uid);

        // ✅ Fetch clients in Firestore where trainer_id == this trainer
        const q = query(
          collection(db, "profiles"),
          where("trainer_id", "==", user.uid),
          where("role", "==", "client")
        );

        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setClients(data);
      }
    });

    return () => unsub();
  }, []);

  if (!me) return <div>Loading...</div>;

  return (
    <div className="clientListContainer" style={{ padding: 20 }}>
      <h2 className="Title">My Clients</h2>
      {clients.length === 0 && <p>No clients linked yet.</p>}

      {clients.map((client) => (
        <div
          key={client.id}
          style={{
            marginBottom: 12,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            className="clientNames"
            variant="outlined"
            onClick={() => {
              // ✅ Save client in context
              setSelectedClient(client.id, client.name || client.email);

              // ✅ Navigate with the UID
              navigate(`/TrainerDashboard/${client.id}`);
            }}
          >
            <Avatar
              className="ButtonAvatar"
              src={client.profile_pic_url || "/default-avatar.png"}
              alt={client.name || client.email}
              style={{ marginRight: 12 }}
            >
              {!client.profile_pic_url &&
                (client.name || client.email)?.charAt(0).toUpperCase()}
            </Avatar>

            <strong style={{ color: "red" }}>
              {client.name || client.email}
            </strong>
          </Button>
        </div>
      ))}
    </div>
  );
}
