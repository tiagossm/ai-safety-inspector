
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/contexts/AuthContext";
import { Session, User } from "@supabase/supabase-js";

export const enhanceUserWithRoleAndTier = async (user: User): Promise<AuthUser> => {
  // Fetch additional user data from the users table
  console.log("Fetching user data for", user.id);
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role, tier")
    .eq("id", user.id)
    .maybeSingle();
  
  if (userError) {
    console.error("Error fetching user data:", userError);
    if (userError.code !== "PGRST116") {
      throw userError;
    }
  }
  
  // Set a default tier if not present
  let userTier: "super_admin" | "company_admin" | "consultant" | "technician" = "technician";
  
  // If we have user data, use it
  if (userData) {
    console.log("Found user data:", userData);
    userTier = userData.tier as "super_admin" | "company_admin" | "consultant" | "technician" || "technician";
  } else {
    console.log("No user data found, using default values");
  }
  
  // Ensure role is always either "admin" or "user"
  const userRole: "admin" | "user" = (userData?.role === "admin") ? "admin" : "user";
  
  // Merge the user data with session user
  console.log("Enhanced user with role:", userRole, "and tier:", userTier);
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
    const { error } = await supabase
      .from("users")
      .update({ tier: "super_admin" })
      .eq("id", user.id);
      
    if (error) {
      console.error("Error setting super_admin tier:", error);
      throw error;
    }
    console.log("Successfully set user as super_admin");
  } catch (error) {
    console.error("Could not set super_admin tier:", error);
    throw error;
  }
};
