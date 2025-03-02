
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/contexts/AuthContext";
import { Session, User } from "@supabase/supabase-js";

export const enhanceUserWithRoleAndTier = async (user: User): Promise<AuthUser> => {
  // Fetch additional user data from the users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role, tier")
    .eq("id", user.id)
    .maybeSingle();
  
  if (userError && userError.code !== "PGRST116") {
    console.error("Error fetching user data:", userError);
  }
  
  // Set a default tier if not present
  let userTier: "super_admin" | "company_admin" | "consultant" | "technician" = "technician";
  
  // If we have user data, use it
  if (userData) {
    userTier = userData.tier as "super_admin" | "company_admin" | "consultant" | "technician" || "technician";
  }
  
  // Ensure role is always either "admin" or "user"
  const userRole: "admin" | "user" = (userData?.role === "admin") ? "admin" : "user";
  
  // Merge the user data with session user
  return {
    ...user,
    role: userRole,
    tier: userTier
  };
};

export const handleInitialSetup = async (user: User): Promise<void> => {
  // For testing, set first user as super_admin if they don't have a tier
  try {
    console.log("Attempting to set user as super_admin");
    await supabase
      .from("users")
      .update({ tier: "super_admin" })
      .eq("id", user.id);
  } catch (error) {
    console.error("Could not set super_admin tier:", error);
  }
};
