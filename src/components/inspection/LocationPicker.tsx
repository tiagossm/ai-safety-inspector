
import React, { useRef, useEffect, useState } from "react";
import { MapPin, Navigation, CircleHelp, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (coords: { latitude: number; longitude: number } | null) => void;
  coordinates?: { latitude: number; longitude: number } | null;
  disabled?: boolean;
}

export function LocationPicker({
  value,
  onChange,
  onCoordinatesChange,
  coordinates,
  disabled
}: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  // Carregar o mapa quando o popover é aberto
  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      // Verificar se a API do Google Maps está disponível
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        // Fallback para OpenStreetMap via Leaflet
        loadOpenStreetMap();
      }
    }
  }, [showMap, coordinates]);

  // Inicializa o mapa do Google
  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;
    
    const initialPosition = coordinates 
      ? { lat: coordinates.latitude, lng: coordinates.longitude }
      : { lat: -23.5505, lng: -46.6333 }; // São Paulo como padrão
    
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: initialPosition,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });
    
    markerRef.current = new window.google.maps.Marker({
      position: initialPosition,
      map: mapInstanceRef.current,
      draggable: true,
      title: "Localização da inspeção"
    });
    
    // Atualizar coordenadas quando o marcador for arrastado
    window.google.maps.event.addListener(markerRef.current, 'dragend', () => {
      const position = markerRef.current.getPosition();
      const newCoords = { 
        latitude: position.lat(), 
        longitude: position.lng() 
      };
      onCoordinatesChange?.(newCoords);
      updateAddressFromCoordinates(newCoords.latitude, newCoords.longitude);
    });
  };

  // Fallback para OpenStreetMap se Google Maps não estiver disponível
  const loadOpenStreetMap = async () => {
    try {
      // Em um cenário real, carregaríamos o Leaflet aqui
      console.log("Carregando OpenStreetMap como fallback");
      toast.warning("Mapa simplificado carregado. Algumas funcionalidades podem estar limitadas.");
      
      // Placeholder para o mapa (em produção, carregaríamos o Leaflet)
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; height: 100%;">
            <p>Mapa simplificado</p>
            <p>Latitude: ${coordinates?.latitude || '-'}</p>
            <p>Longitude: ${coordinates?.longitude || '-'}</p>
          </div>
        `;
      }
    } catch (err) {
      console.error("Failed to load OpenStreetMap fallback:", err);
      toast.error("Não foi possível carregar o mapa");
    }
  };

  // Buscar localização atual
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada neste navegador");
      return;
    }

    setIsLoading(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      onCoordinatesChange?.({ latitude, longitude });
      updateAddressFromCoordinates(latitude, longitude);
      
      // Atualizar mapa, se ativo
      if (mapInstanceRef.current && markerRef.current) {
        const latlng = { lat: latitude, lng: longitude };
        mapInstanceRef.current.setCenter(latlng);
        markerRef.current.setPosition(latlng);
      }
      
      toast.success("Localização atual detectada");
    } catch (err: any) {
      console.error("Geolocation error:", err);
      
      if (err.code === 1) {
        toast.error("Permissão para localização negada");
      } else if (err.code === 2) {
        toast.error("Localização indisponível");
      } else if (err.code === 3) {
        toast.error("Tempo esgotado ao tentar obter localização");
      } else {
        toast.error(`Erro ao obter localização: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar endereço a partir de coordenadas
  const updateAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'pt-BR' } }
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.display_name;
        onChange(address);
      }
    } catch (err) {
      console.error("Error in reverse geocoding:", err);
      // Apenas atualiza com as coordenadas em caso de erro
      onChange(`Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`);
    }
  };

  // Pesquisar endereço
  const searchAddress = async () => {
    if (!value.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=1`,
        { headers: { 'Accept-Language': 'pt-BR' } }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          const result = data[0];
          const latitude = parseFloat(result.lat);
          const longitude = parseFloat(result.lon);
          
          onCoordinatesChange?.({ latitude, longitude });
          
          // Atualizar mapa, se ativo
          if (mapInstanceRef.current && markerRef.current) {
            const latlng = { lat: latitude, lng: longitude };
            mapInstanceRef.current.setCenter(latlng);
            markerRef.current.setPosition(latlng);
          }
          
          toast.success("Localização encontrada");
        } else {
          toast.warning("Endereço não encontrado");
        }
      }
    } catch (err) {
      console.error("Address search error:", err);
      toast.error("Erro ao buscar endereço");
    } finally {
      setIsLoading(false);
    }
  };

  // Limpar localização
  const clearLocation = () => {
    onChange("");
    onCoordinatesChange?.(null);
  };

  return (
    <div className="relative">
      <div className="flex flex-col space-y-2">
        <div className="flex gap-2">
          {value ? (
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Endereço ou descrição do local"
              className="min-h-[80px] flex-grow"
              disabled={disabled}
            />
          ) : (
            <Input 
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Endereço ou descrição do local"
              className="flex-grow"
              disabled={disabled}
            />
          )}
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isLoading || disabled}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Usar GPS
            </Button>
            
            <Popover open={showMap} onOpenChange={setShowMap}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={disabled}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {coordinates ? "Ver no Mapa" : "Selecionar no Mapa"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="p-2 border-b">
                  <h4 className="text-sm font-medium">Localização no Mapa</h4>
                </div>
                <div 
                  ref={mapRef} 
                  className="w-full h-[200px] bg-gray-100"
                >
                  {/* O mapa será renderizado aqui */}
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Carregando mapa...
                  </div>
                </div>
                <div className="p-2 flex justify-between">
                  <span className="text-xs text-gray-500">
                    {coordinates 
                      ? `Lat: ${coordinates.latitude.toFixed(6)}, Long: ${coordinates.longitude.toFixed(6)}` 
                      : 'Nenhuma coordenada selecionada'}
                  </span>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={searchAddress}
              disabled={!value.trim() || isLoading || disabled}
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            
            {value && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={clearLocation}
                disabled={disabled}
              >
                <XCircle className="w-4 h-4" />
                <span className="sr-only">Limpar</span>
              </Button>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="rounded-full w-6 h-6 p-0"
                  >
                    <CircleHelp className="w-4 h-4" />
                    <span className="sr-only">Ajuda</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">
                    Digite um endereço ou use o GPS para detectar sua localização atual.
                    Você também pode selecionar a localização diretamente no mapa.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {coordinates && (
        <div className="mt-1 text-xs text-muted-foreground">
          Coordenadas: Lat {coordinates.latitude.toFixed(6)}, Long {coordinates.longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
}
