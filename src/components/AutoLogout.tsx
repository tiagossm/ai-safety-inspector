
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AutoLogout() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Function to handle user leaving the page
    const handleBeforeUnload = () => {
      // This synchronously logs the user out when tab/browser is closed
      // Store a flag in localStorage so we know to logout on next visit
      localStorage.setItem('pendingLogout', 'true');
    };

    // Function to check and handle pending logout
    const checkPendingLogout = async () => {
      const pendingLogout = localStorage.getItem('pendingLogout');
      
      if (pendingLogout === 'true') {
        console.log("Pending logout detected, signing out user");
        localStorage.removeItem('pendingLogout');
        
        try {
          await supabase.auth.signOut();
          navigate("/auth");
        } catch (error) {
          console.error("Error during auto-logout:", error);
        }
      }
    };

    // Check for pending logout when component mounts
    checkPendingLogout();

    // Add beforeunload event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate]);

  return null; // This component doesn't render anything
}
