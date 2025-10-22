import { supabase } from "./client";

export async function linkClientToTrainer(clientId, trainerId) {
  const { error } = await supabase
    .from("profiles")
    .update({ trainer_id: trainerId })
    .eq("id", clientId);

  if (error) {
    console.error("Error linking client:", error);
  }
}
