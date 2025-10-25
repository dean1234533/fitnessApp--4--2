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

function TrainerChat() {
  const { userId: routeClientId } = useParams();
  const [me, setMe] = useState(null);
  const [trainerId, setTrainerId] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [trainerName, setTrainerName] = useState("");
  const [clientName, setClientName] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user?.uid);
      setMe(user?.uid || null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function resolvePair() {
      if (!me) {
        console.log("No user logged in yet");
        return;
      }

      console.log("Resolving pair for user:", me);

      try {
        const mySnap = await getDoc(doc(db, "profiles", me));
        if (!mySnap.exists()) {
          console.error("Profile not found for user:", me);
          return;
        }
        const myProfile = mySnap.data();
        console.log("My profile:", myProfile);

        if (myProfile.role === "trainer") {
          setTrainerId(me);
          setTrainerName(myProfile.name || "Trainer");
          setClientId(routeClientId || null);

          if (routeClientId) {
            const clientSnap = await getDoc(doc(db, "profiles", routeClientId));
            if (clientSnap.exists()) {
              const cp = clientSnap.data();
              setClientName(cp.name || cp.email || "Client");
              console.log("Client found:", cp.name);
            } else {
              console.error("Client profile not found:", routeClientId);
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
              console.log("Trainer found:", tp.name);
            } else {
              console.error("Trainer profile not found:", myProfile.trainer_id);
            }
          } else {
            console.error("Client has no trainer_id assigned");
          }
        }
      } catch (error) {
        console.error("Error resolving pair:", error);
      }
    }
    resolvePair();
  }, [me, routeClientId]);

  const threadId = trainerId && clientId ? `${trainerId}_${clientId}` : null;

  useEffect(() => {
    if (!threadId) {
      console.log("No threadId yet", { trainerId, clientId });
      return;
    }

    console.log("Setting up message listener for thread:", threadId);

    const q = query(
      collection(db, "threads", threadId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const out = [];
        snap.forEach((d) => out.push({ id: d.id, ...d.data() }));
        console.log("Messages loaded:", out.length);
        setMessages(out);
      },
      (error) => {
        console.error("Error listening to messages:", error);
      }
    );

    if (trainerId && clientId) {
      setDoc(
        doc(db, "threads", threadId),
        { 
          participants: [trainerId, clientId], 
          updatedAt: serverTimestamp() 
        },
        { merge: true }
      ).then(() => {
        console.log("Thread document created/updated");
      }).catch((error) => {
        console.error("Error creating thread document:", error);
      });
    }

    return () => unsub();
  }, [threadId, trainerId, clientId]);

  async function send() {
    const trimmedText = text.trim();
    
    if (!trimmedText) {
      console.log("Empty message, not sending");
      return;
    }
    
    if (!me) {
      console.error("Cannot send: user not logged in");
      alert("You must be logged in to send messages");
      return;
    }
    
    if (!threadId) {
      console.error("Cannot send: no threadId", { trainerId, clientId });
      alert("Chat not ready. Please refresh the page.");
      return;
    }

    if (sending) {
      console.log("Already sending a message");
      return;
    }

    setSending(true);
    console.log("Sending message:", trimmedText);

    try {
      const messageData = {
        text: trimmedText,
        senderId: me,
        createdAt: serverTimestamp(),
      };

      console.log("Message data:", messageData);

      await addDoc(
        collection(db, "threads", threadId, "messages"), 
        messageData
      );

      console.log("Message sent successfully");
      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message: " + error.message);
    } finally {
      setSending(false);
    }
  }

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!me) {
    return <div style={{ padding: "20px", color: "white" }}>Loading chat…</div>;
  }
  
  if (!trainerId || !clientId) {
    return (
      <div style={{ padding: "20px", color: "white" }}>
        <p>No chat partner linked yet.</p>
        <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
          Debug: trainerId={trainerId || "null"}, clientId={clientId || "null"}
        </p>
      </div>
    );
  }

  return (
    <div className="chatContainer">
      <div className="chatHeader">
        <h3 style={{ margin: 0, color: "white" }}>
          {me === trainerId ? `Chat with ${clientName}` : `Chat with ${trainerName}`}
        </h3>
      </div>

      <div className="chatMessages">
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
            No messages yet. Start the conversation!
          </div>
        )}
        
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
                  maxWidth: "70%",
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type a message…"
          disabled={sending}
        />
        <Button
          className="sendButton"
          onClick={send}
          variant="contained"
          endIcon={<SendIcon />}
          disabled={sending || !text.trim()}
        >
          {sending ? "..." : "Send"}
        </Button>
      </div>
    </div>
  );
}

export default TrainerChat;
