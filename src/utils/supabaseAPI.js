import { supabase } from "../client";

// Save or update profile
export async function upsertProfile(userId, profile) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      name: profile.Name,
      age: profile.Age,
      gender: profile.Gender,
      body_weight: profile.bodyWeight,
      body_fat: profile.bodyFat,
      height: profile.height,
      fitness_goal: profile.fitnessGoal,
      daily_activity_level: profile.dailyActivityLevel,
      profile_pic_url: profile.profilePic,
    })
    .select();

  if (error) throw error;
  return data[0];
}

// Fetch profile
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

// Upload profile picture
export async function uploadProfilePic(userId, file) {
  const filePath = `${userId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("profile_pics")
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("profile_pics").getPublicUrl(filePath);

  return data.publicUrl;
}
