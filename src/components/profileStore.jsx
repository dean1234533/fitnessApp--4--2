// components/profileStore.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { supabase } from "../client";

/**
 * Ensure a row exists in Supabase `profiles` for uid.
 * If missing/incomplete, pull from Firestore `profiles/{uid}` and upsert.
 * Returns the final Supabase profile object.
 */
export async function ensureSupabaseProfile(uid) {
  // 1) Read Supabase
  let { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid);

  const existing = Array.isArray(data) ? data[0] : null;
  if (existing?.id) return existing; // already good

  // 2) Fallback: read Firestore to hydrate
  const snap = await getDoc(doc(db, "profiles", uid));
  const fs = snap.exists() ? snap.data() : {};

  // Compose minimal profile
  const profile = {
    id: uid,
    role: fs.role || "client",
    name: fs.name || "",
    email: fs.contact_email || fs.email || "",
    trainer_id: fs.trainer_id || null,
    profile_pic_url: fs.profile_pic_url || null,
  };

  // 3) Upsert to Supabase
  const up = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select();

  if (up.error) {
    console.error("Supabase upsert error:", up.error);
    return profile; // return best-effort so UI doesn't crash
  }

  // 4) Optionally ensure Firestore also has the same (keeps old code paths happy)
  if (!snap.exists()) {
    await setDoc(doc(db, "profiles", uid), profile, { merge: true });
  }

  return Array.isArray(up.data) ? up.data[0] : profile;
}

/**
 * Make sure a client's row has trainer_id.
 * Call this after client signup, or when linking.
 */
export async function linkClientToTrainer(clientId, trainerId) {
  if (!clientId || !trainerId) return;
  const { error } = await supabase
    .from("profiles")
    .update({ trainer_id: trainerId })
    .eq("id", clientId);
  if (error) console.error("linkClientToTrainer error:", error);

  // Also update Firestore for backward compatibility
  await setDoc(
    doc(db, "profiles", clientId),
    { trainer_id: trainerId },
    { merge: true }
  );
}
