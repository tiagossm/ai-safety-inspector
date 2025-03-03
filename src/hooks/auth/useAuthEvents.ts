
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "./useAuthState";
import { useAuthSession } from "./useAuthSession";

export function useAuthEvents(
  setUser: (user: AuthUser | null) => void,
  setLoading: (loading: boolean) => void
) {
  const navigate = useNavigate();
  const { fetchUserData } = useAuthSession();

  useEffect(() => {
    let mounted = true;
    console.log("🔄 AuthProvider montado - Configurando eventos de autenticação");

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Estado de autenticação alterado:", event);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        console.log("✅ Evento SIGNED_IN recebido com usuário:", session.user.email);
        
        // Buscar dados adicionais
        const userData = await fetchUserData(session.user.id);
        
        // Combinar os dados com type assertion
        const enhancedUser = {
          ...session.user,
          ...userData
        } as AuthUser;
        
        setUser(enhancedUser);
        
        // Redirect based on user tier
        if (enhancedUser.tier === "super_admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } 
      else if (event === 'SIGNED_OUT') {
        console.log("ℹ️ Evento SIGNED_OUT recebido");
        setUser(null);
        navigate("/auth");
      } 
      else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        console.log(`ℹ️ Evento ${event} recebido`);
        // Update user data when token is refreshed or user is updated
        if (session?.user) {
          const userData = await fetchUserData(session.user.id);
          
          const enhancedUser = {
            ...session.user,
            ...userData
          } as AuthUser;
          
          setUser(enhancedUser);
        }
      }
      
      setLoading(false);
    });

    return () => {
      console.log("🔄 Limpando eventos de autenticação");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, setUser, setLoading, fetchUserData]);
}
