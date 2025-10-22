import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Missing Supabase environment variables. Check your .env file!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("✅ Supabase initialized:", supabase);

// -------------------- FUNCTIONS --------------------

// ✅ Get user profile
export async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  } catch (error) {
    console.error("Error getting profile:", error);
    return null;
  }
}

// ✅ Save or update user profile
export async function upsertProfile(userId, profileData) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        user_id: userId,
        name: profileData.Name,
        age: profileData.Age,
        gender: profileData.Gender,
        body_weight: profileData.bodyWeight,
        body_fat: profileData.bodyFat,
        height: profileData.height,
        fitness_goal: profileData.fitnessGoal,
        daily_activity_level: profileData.dailyActivityLevel,
        profile_pic_url: profileData.profilePic,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Error saving profile: " + error.message);
    return null;
  }
}

// ✅ Upload profile picture
export async function uploadProfilePic(userId, file) {
  try {
    const fileName = `${userId}-${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from("profile-pics")
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-pics").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    alert("Error uploading image: " + error.message);
    return null;
  }
}