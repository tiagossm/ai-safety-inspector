
import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (coords: { latitude: number; longitude: number } | null) => void;
  coordinates?: { latitude?: number; longitude?: number } | null;
  disabled?: boolean;
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export function LocationPicker({
  value,
  onChange,
  onCoordinatesChange,
  coordinates,
  disabled = false,
}: LocationPickerProps) {
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [cep, setCep] = useState("");
  const [addressDetails, setAddressDetails] = useState<ViaCepResponse | null>(null);
  
  // Format CEP input (99999-999)
  const formatCep = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.substring(0, 5)}-${numbers.substring(5, 8)}`;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCep(e.target.value);
    setCep(formattedCep);
  };

  const fetchAddressByCep = async () => {
    if (cep.length < 8) {
      toast.error("CEP inválido. Insira um CEP com 8 dígitos.");
      return;
    }

    setIsLoadingCep(true);
    try {
      const cleanCep = cep.replace(/\D/g, "");
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: ViaCepResponse = await response.json();
      
      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setAddressDetails(data);
      
      // Format full address
      const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, ${data.cep}`;
      onChange(address);
      
      // Try to get coordinates from this address using Nominatim OpenStreetMap API
      try {
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
        );
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData && geocodeData.length > 0) {
          const { lat, lon } = geocodeData[0];
          onCoordinatesChange?.({
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
          });
        }
      } catch (geoError) {
        console.error("Error getting coordinates from address:", geoError);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      toast.error("Erro ao buscar CEP");
    } finally {
      setIsLoadingCep(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não é suportada pelo seu navegador");
      return;
    }

    setIsLoadingGps(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update coordinates
        onCoordinatesChange?.({ latitude, longitude });
        
        // Try to get address from coordinates using Nominatim OpenStreetMap API
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            onChange(data.display_name);
          } else {
            onChange(`Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`);
          }
        } catch (error) {
          console.error("Error getting address from coordinates:", error);
          onChange(`Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`);
        } finally {
          setIsLoadingGps(false);
        }
      },
      (error) => {
        console.error("Error getting current location:", error);
        toast.error("Erro ao obter localização atual");
        setIsLoadingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="location">Localização</Label>
        <div className="flex flex-col space-y-2 mt-1.5">
          <Input
            id="location"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Digite o endereço completo"
            disabled={disabled}
            className="flex-1"
          />
        </div>
      </div>
      
      {!disabled && (
        <>
          <div className="flex space-x-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="cep">CEP</Label>
              <div className="flex">
                <Input
                  id="cep"
                  value={cep}
                  onChange={handleCepChange}
                  placeholder="00000-000"
                  className="rounded-r-none"
                />
                <Button 
                  type="button" 
                  onClick={fetchAddressByCep}
                  className="rounded-l-none" 
                  disabled={isLoadingCep || cep.length < 8}
                  variant="secondary"
                >
                  {isLoadingCep ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Buscar
                </Button>
              </div>
            </div>
            
            <div className="flex items-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={isLoadingGps}
                      className="h-10"
                    >
                      {isLoadingGps ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Navigation className="h-4 w-4" />
                      )}
                      <span className="ml-2">Usar GPS</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Obter localização atual</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {addressDetails && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <p><strong>Endereço:</strong> {addressDetails.logradouro}</p>
              <p><strong>Bairro:</strong> {addressDetails.bairro}</p>
              <p><strong>Cidade:</strong> {addressDetails.localidade} - {addressDetails.uf}</p>
            </div>
          )}
        </>
      )}
      
      {coordinates && (
        <div className="text-xs text-muted-foreground">
          Coordenadas: {coordinates.latitude?.toFixed(6)}, {coordinates.longitude?.toFixed(6)}
        </div>
      )}
    </div>
  );
}
