
import { useRoutes } from "react-router-dom";
import "./App.css";
import routes from "./routes";
import { Toaster } from "sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import IdleTimeoutManager from "@/components/IdleTimeoutManager";
import AutoLogout from "@/components/AutoLogout";

export default function App() {
  const element = useRoutes(routes);
  
  return (
    <>
      <AutoLogout />
      <IdleTimeoutManager>
        {element}
      </IdleTimeoutManager>
      <Toaster position="top-right" richColors />
      <ShadcnToaster />
    </>
  );
}
