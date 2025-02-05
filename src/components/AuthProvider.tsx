import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useToast } from "./ui/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          if (mounted) {
            setUser(null);
            setLoading(false);
            navigate("/auth");
          }
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
          navigate("/auth");
        }
      }
    };

    checkSession();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (mounted) {
        if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null);
          toast({
            title: "Login realizado com sucesso",
            description: "Bem-vindo de volta!",
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate("/auth");
          toast({
            title: "Logout realizado",
            description: "Até logo!",
          });
        } else if (event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);
        } else if (event === 'USER_UPDATED') {
          setUser(session?.user ?? null);
        }
        
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}