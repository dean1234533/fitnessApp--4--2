// components/useAuthSync.js
import { useEffect } from "react";
import { auth } from "../utils/firebaseConfig";
import { ensureSupabaseProfile } from "../components/profileStore";

/**
 * Subscribes to Firebase auth state.
 * Whenever a user logs in, ensure their Supabase profile row exists.
 */
export function useAuthSync() {
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      try {
        await ensureSupabaseProfile(user.uid);
      } catch (e) {
        console.error("ensureSupabaseProfile failed:", e);
      }
    });
    return () => unsub();
  }, []);
}
