
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SessionCheckerProps {
  handleUserRedirect: (userId: string) => Promise<void>;
}

export const SessionChecker = ({ handleUserRedirect }: SessionCheckerProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking for existing session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          return;
        }
        
        if (data.session) {
          console.log("Active session found:", data.session.user.id);
          await handleUserRedirect(data.session.user.id);
        } else {
          console.log("No active session found");
        }
      } catch (err) {
        console.error("Error in checkSession:", err);
      }
    };
    checkSession();
  }, [navigate, handleUserRedirect]);

  return null;
};
