
import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase,
  ShieldCheck,
  Leaf,
  Activity,
  Wrench,
  HardHat,
  Building
} from "lucide-react";

interface ChecklistThemeBadgeProps {
  theme: string;
}

/**
 * Component for rendering checklist theme badge with appropriate icon
 */
export const ChecklistThemeBadge: React.FC<ChecklistThemeBadgeProps> = ({ theme }) => {
  // Convert theme to lowercase for comparison
  const themeKey = theme?.toLowerCase() || "";
  
  // Define theme configurations
  const themeConfig: Record<string, { icon: React.ReactNode, label: string, variant: string }> = {
    "segurança": { 
      icon: <ShieldCheck className="w-3 h-3 mr-1" />, 
      label: "Segurança", 
      variant: "outline" 
    },
    "meio ambiente": { 
      icon: <Leaf className="w-3 h-3 mr-1" />, 
      label: "Meio Ambiente", 
      variant: "outline" 
    },
    "saúde": { 
      icon: <Activity className="w-3 h-3 mr-1" />, 
      label: "Saúde", 
      variant: "outline" 
    },
    "manutenção": { 
      icon: <Wrench className="w-3 h-3 mr-1" />, 
      label: "Manutenção", 
      variant: "outline" 
    },
    "operação": { 
      icon: <HardHat className="w-3 h-3 mr-1" />, 
      label: "Operação", 
      variant: "outline" 
    },
    "administração": { 
      icon: <Building className="w-3 h-3 mr-1" />, 
      label: "Administração", 
      variant: "outline" 
    },
    "trabalho": { 
      icon: <Briefcase className="w-3 h-3 mr-1" />, 
      label: "Trabalho", 
      variant: "outline" 
    }
  };
  
  // Default configuration
  const defaultConfig = {
    icon: <Briefcase className="w-3 h-3 mr-1" />,
    label: theme || "Geral",
    variant: "outline"
  };
  
  // Get config for the theme or use default
  const config = Object.keys(themeConfig).find(key => themeKey.includes(key))
    ? themeConfig[Object.keys(themeConfig).find(key => themeKey.includes(key)) as string]
    : defaultConfig;
  
  return (
    <Badge variant={config.variant as any} className="flex items-center text-xs px-2 py-0 bg-slate-100 text-slate-700 hover:bg-slate-100">
      {config.icon}
      {config.label}
    </Badge>
  );
};
