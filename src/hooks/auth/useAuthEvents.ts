import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "./useAuthState";
import { useAuthSession } from "./useAuthSession";

// Cache de usuário para eventos TOKEN_REFRESHED
let cachedUserData: Partial<AuthUser> | null = null;

export function useAuthEvents(
  setUser: (user: AuthUser | null) => void,
  setLoading: (loading: boolean) => void
) {
  const navigate = useNavigate();
  const { fetchUserData } = useAuthSession();

  useEffect(() => {
    let mounted = true;
    console.log("🔄 AuthProvider montado - Configurando eventos de autenticação");

    // **🔹 Restaurar sessão salva no localStorage**
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      console.log("✅ Sessão restaurada do localStorage");
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }

    // **🔹 Monitorar mudanças na autenticação**
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Estado de autenticação alterado:", event);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        console.log("✅ Evento SIGNED_IN recebido com usuário:", session.user.email);
        
        // Resetar cache
        cachedUserData = null;

        // Buscar dados adicionais do usuário
        const userData = await fetchUserData(session.user.id);
        const enhancedUser = {
          ...session.user,
          ...userData
        } as AuthUser;
        
        setUser(enhancedUser);
        localStorage.setItem("authUser", JSON.stringify(enhancedUser)); // **Salvar no localStorage**

        // **🔹 Redirecionar com base no tipo de usuário**
        if (enhancedUser.tier === "super_admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } 

      else if (event === 'SIGNED_OUT') {
        console.log("ℹ️ Evento SIGNED_OUT recebido");
        cachedUserData = null;
        setUser(null);
        localStorage.removeItem("authUser"); // **Remover do localStorage**
        navigate("/auth");
      } 

      else if (event === 'TOKEN_REFRESHED') {
        console.log("ℹ️ Token atualizado - Verificando cache");

        if (session?.user) {
          if (cachedUserData) {
            setUser({
              ...session.user,
              ...cachedUserData
            } as AuthUser);
            localStorage.setItem("authUser", JSON.stringify(session.user)); // **Atualizar localStorage**
          } else {
            const userData = await fetchUserData(session.user.id);
            cachedUserData = userData;

            const enhancedUser = {
              ...session.user,
              ...userData
            } as AuthUser;
            
            setUser(enhancedUser);
            localStorage.setItem("authUser", JSON.stringify(enhancedUser)); // **Armazenar sessão**
          }
        }
      }

      else if (event === 'USER_UPDATED') {
        console.log("ℹ️ Evento USER_UPDATED recebido");
        cachedUserData = null;
        
        if (session?.user) {
          const userData = await fetchUserData(session.user.id);
          
          const enhancedUser = {
            ...session.user,
            ...userData
          } as AuthUser;
          
          setUser(enhancedUser);
          localStorage.setItem("authUser", JSON.stringify(enhancedUser)); // **Atualizar dados do usuário**
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
