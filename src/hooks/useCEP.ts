
import { useState } from "react";

export function useCEP() {
  const [address, setAddress] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddress = async (cep: string) => {
    // Clean up CEP, removing non-numeric characters
    const cleanCep = cep.replace(/\D/g, '');
    
    // Validate CEP length
    if (cleanCep.length !== 8) {
      setError("CEP inválido. O CEP deve ter 8 dígitos.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setError("CEP não encontrado");
        setAddress(null);
      } else {
        setAddress(data);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching CEP:", err);
      setError("Erro ao buscar endereço");
      setAddress(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    address,
    loading,
    error,
    fetchAddress
  };
}
