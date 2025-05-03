
import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Search, Loader2, Map } from "lucide-react";
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    coordinates ? { latitude: coordinates.latitude || 0, longitude: coordinates.longitude || 0 } : null
  );
  const [tempCoordinates, setTempCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
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
          const coords = {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
          };
          setMapCoordinates(coords);
          onCoordinatesChange?.(coords);
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
        const coords = { latitude, longitude };
        
        // Update coordinates
        setMapCoordinates(coords);
        onCoordinatesChange?.(coords);
        
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

  // Initialize map in the dialog
  useEffect(() => {
    if (!showMapDialog) return;

    // Wait for the next frame to ensure the dialog is rendered
    const timer = setTimeout(() => {
      try {
        // Check if the Leaflet script is already loaded
        if (!window.L) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          script.onload = initializeMap;
          
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          
          document.head.appendChild(link);
          document.body.appendChild(script);
        } else {
          initializeMap();
        }
      } catch (error) {
        console.error("Error loading Leaflet:", error);
        toast.error("Erro ao carregar o mapa");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [showMapDialog]);

  const initializeMap = () => {
    const L = window.L;
    if (!L || mapLoaded) return;

    try {
      const mapContainer = document.getElementById('map-container');
      if (!mapContainer) return;

      // Get center coordinates
      const center = mapCoordinates || { latitude: -23.5505, longitude: -46.6333 }; // São Paulo as default
      setTempCoordinates(mapCoordinates);

      // Initialize the map
      mapRef.current = L.map('map-container').setView([center.latitude, center.longitude], 13);
      
      // Add the tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Add a marker if we have coordinates
      if (center) {
        markerRef.current = L.marker([center.latitude, center.longitude], {
          draggable: true
        }).addTo(mapRef.current);

        // Update temporary coordinates when marker is dragged
        markerRef.current.on('dragend', function(e: any) {
          const marker = e.target;
          const position = marker.getLatLng();
          setTempCoordinates({
            latitude: position.lat,
            longitude: position.lng
          });
        });
      }

      // Add click handler to the map to update marker position
      mapRef.current.on('click', function(e: any) {
        const { lat, lng } = e.latlng;
        
        // Update or create marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], {
            draggable: true
          }).addTo(mapRef.current);
          
          // Add dragend event listener
          markerRef.current.on('dragend', function(e: any) {
            const marker = e.target;
            const position = marker.getLatLng();
            setTempCoordinates({
              latitude: position.lat,
              longitude: position.lng
            });
          });
        }
        
        // Update temporary coordinates
        setTempCoordinates({
          latitude: lat,
          longitude: lng
        });
      });

      setMapLoaded(true);
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Erro ao inicializar o mapa");
    }
  };

  // Clean up map when dialog closes
  const handleCloseMap = () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
      setMapLoaded(false);
    }
    setShowMapDialog(false);
  };

  // Save coordinates and get address when confirming map selection
  const handleConfirmLocation = async () => {
    if (!tempCoordinates) {
      toast.error("Selecione uma localização no mapa");
      return;
    }

    setMapCoordinates(tempCoordinates);
    onCoordinatesChange?.(tempCoordinates);

    // Try to get address from coordinates
    try {
      const { latitude, longitude } = tempCoordinates;
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
      const { latitude, longitude } = tempCoordinates;
      onChange(`Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`);
    }

    handleCloseMap();
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
            
            <div className="flex items-end gap-2">
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
                      <span className="sr-only md:not-sr-only md:ml-2">GPS</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Obter localização atual</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMapDialog(true)}
                      className="h-10"
                    >
                      <Map className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:ml-2">Mapa</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Selecionar no mapa</p>
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

      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Selecionar Localização no Mapa</DialogTitle>
          </DialogHeader>
          <div id="map-container" className="h-[400px] w-full rounded-md border"></div>
          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={handleCloseMap}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmLocation}>
                Confirmar Localização
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
