// components/TrainerChat.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../utils/firebaseConfig";
import SendIcon from "@mui/icons-material/Send";
import Button from "@mui/material/Button";
import "../styles/Chat.css";

export default function TrainerChat() {
  const { userId: routeClientId } = useParams();
  const [me, setMe] = useState(null);
  const [trainerId, setTrainerId] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [trainerName, setTrainerName] = useState("");
  const [clientName, setClientName] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // Track logged-in user
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setMe(user?.uid || null);
    });
    return () => unsub();
  }, []);

  // Resolve trainer/client roles
  useEffect(() => {
    async function resolvePair() {
      if (!me) return;

      const mySnap = await getDoc(doc(db, "profiles", me));
      if (!mySnap.exists()) return;
      const myProfile = mySnap.data();

      if (myProfile.role === "trainer") {
        setTrainerId(me);
        setTrainerName(myProfile.name || "Trainer");
        setClientId(routeClientId || null);

        if (routeClientId) {
          const clientSnap = await getDoc(doc(db, "profiles", routeClientId));
          if (clientSnap.exists()) {
            const cp = clientSnap.data();
            setClientName(cp.name || cp.email || "Client");
          }
        }
      } else {
        setClientId(me);
        setClientName(myProfile.name || "Client");
        if (myProfile.trainer_id) {
          setTrainerId(myProfile.trainer_id);
          const trainerSnap = await getDoc(
            doc(db, "profiles", myProfile.trainer_id)
          );
          if (trainerSnap.exists()) {
            const tp = trainerSnap.data();
            setTrainerName(tp.name || tp.email || "Trainer");
          }
        }
      }
    }
    resolvePair();
  }, [me, routeClientId]);

  // Thread ID
  const threadId = trainerId && clientId ? `${trainerId}_${clientId}` : null;

  // Listen for messages
  useEffect(() => {
    if (!threadId) return;

    const q = query(
      collection(db, "threads", threadId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const out = [];
      snap.forEach((d) => out.push({ id: d.id, ...d.data() }));
      setMessages(out);
    });

    if (trainerId && clientId) {
      setDoc(
        doc(db, "threads", threadId),
        { participants: [trainerId, clientId], updatedAt: serverTimestamp() },
        { merge: true }
      );
    }

    return () => unsub();
  }, [threadId, trainerId, clientId]);

  async function send() {
    if (!text.trim() || !me || !threadId) return;

    await addDoc(collection(db, "threads", threadId, "messages"), {
      text: text.trim(),
      senderId: me,
      createdAt: serverTimestamp(),
    });

    setText("");
  }

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!me) return <div>Loading chat…</div>;
  if (!trainerId || !clientId) return <div>No chat partner linked yet.</div>;

  return (
    <div className="chatContainer">
      <div className="chatHeader"></div>

      <div className="chatMessages">
        {messages.map((m) => {
          const isTrainerMessage = m.senderId === trainerId;

          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: isTrainerMessage ? "flex-start" : "flex-end",
                padding: "4px 8px",
    
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  maxWidth: "100%",
                  padding: "10px 14px",
                  borderRadius: "16px",
                  backgroundColor: isTrainerMessage ? "white" : "#272829",
                  color: isTrainerMessage ? "black" : "white",
                  border: isTrainerMessage ? "2px solid" : "2px solid white",
                  boxShadow: "0px 1px 2px rgba(0,0,0,0.2)",
                }}
              >
                <div>{m.text}</div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    opacity: 0.6,
                    marginTop: "4px",
                    textAlign: "right",
                  }}
                >
                  {formatTime(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chatInputContainer">
        <input
          className="chatInput"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
        />
        <Button
          className="sendButton"
          onClick={send}
          variant="contained"
          endIcon={<SendIcon />}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
