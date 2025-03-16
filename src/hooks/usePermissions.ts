
import { useAuth } from "@/components/AuthProvider";

export function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    return true; // Grant all permissions to all users
  };
  
  return { hasPermission };
}
