
import { useAuth } from "@/components/AuthProvider";

interface SecurityPolicy {
  super_admin: string[];
  company_admin: string[];
  consultant: string[];
  technician: string[];
}

// Define security policies
const securityPolicies: SecurityPolicy = {
  super_admin: ['*'], // Super admin can access everything
  company_admin: [
    'read:company', 
    'write:company', 
    'read:users',
    'write:users',
    'read:checklists',
    'write:checklists',
    'read:inspections',
    'write:inspections',
    'read:reports',
    'write:reports'
  ],
  consultant: [
    'read:assigned_companies',
    'read:checklists',
    'write:checklists',
    'read:inspections',
    'write:inspections',
    'read:reports'
  ],
  technician: [
    'read:checklists',
    'execute:inspections'
  ]
};

export function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.tier) return false;
    
    // Super admin has all permissions
    if (user.tier === 'super_admin') return true;
    
    // Check if user's role has the specific permission
    const userPermissions = securityPolicies[user.tier];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };
  
  return { hasPermission };
}
