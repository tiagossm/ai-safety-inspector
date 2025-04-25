
import React, { useRef, useEffect, useState } from "react";
import { MapPin, Navigation, CircleHelp, Search, XCircle, MapPinIcon } from "lucide-react";
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
import { Card } from "@/components/ui/card";

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        event: {
          addListener: (instance: any, event: string, handler: Function) => void;
        };
      };
    };
  }
}

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (coords: { latitude: number; longitude: number; } | null) => void;
  coordinates?: { latitude?: number; longitude?: number; } | null;
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
  const [cep, setCep] = useState("");
  const [showMiniMap, setShowMiniMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const miniMapInstanceRef = useRef<any>(null);
  const miniMarkerRef = useRef<any>(null);
  
  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        loadOpenStreetMap();
      }
    }
  }, [showMap, coordinates]);

  useEffect(() => {
    if (coordinates?.latitude && coordinates?.longitude && miniMapRef.current && !miniMapInstanceRef.current) {
      if (window.google && window.google.maps) {
        initializeMiniMap();
      } else {
        setShowMiniMap(false); // Don't show mini map if Google Maps not available
      }
    }
  }, [coordinates, showMiniMap]);

  // Show mini map when we have coordinates
  useEffect(() => {
    if (coordinates?.latitude && coordinates?.longitude) {
      setShowMiniMap(true);
    }
  }, [coordinates]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;
    
    const initialPosition = coordinates && 
                          typeof coordinates.latitude === 'number' && 
                          typeof coordinates.longitude === 'number' 
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
    
    window.google.maps.event.addListener(markerRef.current, 'dragend', () => {
      const position = markerRef.current.getPosition();
      if (position) {
        const newCoords = { 
          latitude: position.lat(), 
          longitude: position.lng() 
        };
        onCoordinatesChange?.(newCoords);
        updateAddressFromCoordinates(newCoords.latitude, newCoords.longitude);
      }
    });
  };

  const initializeMiniMap = () => {
    if (!miniMapRef.current || !window.google || !coordinates) return;

    const position = { 
      lat: coordinates.latitude as number, 
      lng: coordinates.longitude as number 
    };

    miniMapInstanceRef.current = new window.google.maps.Map(miniMapRef.current, {
      center: position,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: false,
      draggable: false
    });
    
    miniMarkerRef.current = new window.google.maps.Marker({
      position: position,
      map: miniMapInstanceRef.current,
      draggable: false,
      title: "Localização da inspeção"
    });
  };

  const loadOpenStreetMap = async () => {
    try {
      console.log("Carregando OpenStreetMap como fallback");
      toast.warning("Mapa simplificado carregado. Algumas funcionalidades podem estar limitadas.");
      
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
      
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        onCoordinatesChange?.({ latitude, longitude });
        updateAddressFromCoordinates(latitude, longitude);
        
        if (mapInstanceRef.current && markerRef.current) {
          const latlng = { lat: latitude, lng: longitude };
          mapInstanceRef.current.setCenter(latlng);
          markerRef.current.setPosition(latlng);
        }
        
        toast.success("Localização atual detectada");
        setShowMiniMap(true);
      }
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
      onChange(`Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`);
    }
  };

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
          
          if (!isNaN(latitude) && !isNaN(longitude)) {
            onCoordinatesChange?.({ latitude, longitude });
            
            if (mapInstanceRef.current && markerRef.current) {
              const latlng = { lat: latitude, lng: longitude };
              mapInstanceRef.current.setCenter(latlng);
              markerRef.current.setPosition(latlng);
            }
            
            toast.success("Localização encontrada");
            setShowMiniMap(true);
          } else {
            toast.warning("Coordenadas inválidas recebidas");
          }
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

  const searchCEP = async (cep: string) => {
    if (!cep || cep.length !== 9) return;
    
    setIsLoading(true);
    
    try {
      const cleanCep = cep.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (!data.erro) {
          // Format the address from ViaCEP
          const formattedAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, ${data.cep}`;
          onChange(formattedAddress);
          
          // Search for coordinates of the address
          await searchAddress();
        } else {
          toast.error("CEP não encontrado");
        }
      }
    } catch (err) {
      console.error("CEP search error:", err);
      toast.error("Erro ao buscar CEP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Format CEP as 12345-678
    const formatted = value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
      
    setCep(formatted);
  };

  const clearLocation = () => {
    onChange("");
    onCoordinatesChange?.(null);
    setCep("");
    setShowMiniMap(false);
  };

  return (
    <div className="relative">
      <div className="flex flex-col space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input
            value={cep}
            onChange={handleCEPChange}
            placeholder="CEP (12345-678)"
            className="md:col-span-1"
            disabled={disabled || isLoading}
            onBlur={() => cep.length === 9 && searchCEP(cep)}
          />
          
          <div className="md:col-span-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isLoading || disabled}
              className="flex-1"
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
                  className="flex-1"
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
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Carregando mapa...
                  </div>
                </div>
                <div className="p-2 flex justify-between">
                  <span className="text-xs text-gray-500">
                    {coordinates && typeof coordinates.latitude === 'number' && typeof coordinates.longitude === 'number'
                      ? `Lat: ${coordinates.latitude.toFixed(6)}, Long: ${coordinates.longitude.toFixed(6)}` 
                      : 'Nenhuma coordenada selecionada'}
                  </span>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
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
          </div>
          
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
                  Digite um CEP para busca automática, use o GPS para detectar sua localização atual,
                  ou selecione a localização diretamente no mapa.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Mini map preview */}
      {showMiniMap && coordinates && typeof coordinates.latitude === 'number' && typeof coordinates.longitude === 'number' && (
        <Card className="mt-2 overflow-hidden">
          <div className="flex items-center p-2 bg-gray-50 border-b">
            <MapPinIcon className="h-3 w-3 mr-1 text-red-600" />
            <span className="text-xs text-muted-foreground">
              Lat: {coordinates.latitude.toFixed(6)}, Long: {coordinates.longitude.toFixed(6)}
            </span>
          </div>
          <div 
            ref={miniMapRef}
            className="h-[120px] w-full"
          ></div>
        </Card>
      )}
      
      {coordinates && typeof coordinates.latitude === 'number' && typeof coordinates.longitude === 'number' && !showMiniMap && (
        <div className="mt-1 text-xs text-muted-foreground">
          Coordenadas: Lat {coordinates.latitude.toFixed(6)}, Long {coordinates.longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
}
