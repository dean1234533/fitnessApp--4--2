import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAD0WCFgywWlmx4SeNTa76r3uJTHPokYJ0",
  authDomain: "chat-d7678.firebaseapp.com",
  projectId: "chat-d7678",
  storageBucket: "chat-d7678.appspot.com", // ✅ must be .appspot.com
  messagingSenderId: "518504780660",
  appId: "1:518504780660:web:b9c048a6c39e811bef1221",
  measurementId: "G-0JJLCES2FM",
};

// prevent double init in hot reload
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export async function ensureFirebaseAuth() {
  if (!auth.currentUser) {
    const { user } = await signInAnonymously(auth);
    return user;
  }
  return auth.currentUser;
}
