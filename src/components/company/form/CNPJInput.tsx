
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CNPJInputProps {
  cnpj: string;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function CNPJInput({ cnpj, loading, onChange, onBlur }: CNPJInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="cnpj">CNPJ da Empresa</Label>
      <Input
        id="cnpj"
        placeholder="00.000.000/0000-00"
        value={cnpj}
        onChange={onChange}
        onBlur={onBlur}
        maxLength={18}
        disabled={loading}
        required
      />
    </div>
  );
}
