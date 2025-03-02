import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export const SessionChecker = () => {
  const navigate = useNavigate();

  const handleUserRedirect = async (user: any) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.company_id) {
      navigate("/setup-company");
    } else {
      profile.role === "super_admin" 
        ? navigate("/admin/dashboard") 
        : navigate("/dashboard");
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) await handleUserRedirect(session.user);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) await handleUserRedirect(session.user);
      }
    );

    checkSession();
    return () => subscription?.unsubscribe();
  }, [handleUserRedirect]);

  return null;
};