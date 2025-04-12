
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface InputSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string; // Added className prop
}

export function InputSearch({ value, onChange, placeholder = "Search...", className }: InputSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-8 ${className}`}
      />
    </div>
  );
}
