
import { useState } from "react";

interface Address {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export function useCEP() {
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddress = async (cep: string) => {
    // Clean up the CEP format
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      setError('CEP deve conter 8 dígitos');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setError('CEP não encontrado');
        setAddress(null);
      } else {
        setAddress(data);
      }
    } catch (err) {
      setError('Erro ao buscar o endereço');
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
