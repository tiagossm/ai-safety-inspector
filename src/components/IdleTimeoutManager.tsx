
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface IdleTimeoutManagerProps {
  timeout?: number; // Tempo em minutos
  children: React.ReactNode;
}

const IdleTimeoutManager = ({ 
  timeout = 30, // 30 minutos de inatividade por padrão
  children 
}: IdleTimeoutManagerProps) => {
  const navigate = useNavigate();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [warningShown, setWarningShown] = useState<boolean>(false);

  const handleActivity = () => {
    setLastActivity(Date.now());
    setWarningShown(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.info("Sessão expirada por inatividade", {
        description: "Você foi desconectado por inatividade."
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  useEffect(() => {
    // Registrar eventos de atividade do usuário
    const activityEvents = [
      "mousedown", "mousemove", "keydown", 
      "scroll", "touchstart", "click"
    ];

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Verificar inatividade a cada minuto
    const checkInterval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = (now - lastActivity) / (1000 * 60); // Converter para minutos
      
      // Se estiver inativo por mais tempo que o timeout
      if (inactiveTime > timeout) {
        handleLogout();
        clearInterval(checkInterval);
      } 
      // Avisar 2 minutos antes
      else if (inactiveTime > (timeout - 2) && !warningShown) {
        toast.info("Aviso de inatividade", {
          description: "Você será desconectado em 2 minutos por inatividade."
        });
        setWarningShown(true);
      }
    }, 60000); // Verificar a cada minuto

    return () => {
      // Limpar event listeners
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(checkInterval);
    };
  }, [lastActivity, timeout, navigate, warningShown]);

  return <>{children}</>;
};

export default IdleTimeoutManager;
