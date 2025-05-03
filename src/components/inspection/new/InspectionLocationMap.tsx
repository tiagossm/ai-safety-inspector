
import React, { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InspectionLocationMapProps {
  onLocationSelect: (address: string, coordinates?: {lat: number, lng: number}) => void;
  initialAddress?: string;
  initialCoordinates?: {lat: number, lng: number} | null;
}

export function InspectionLocationMap({ 
  onLocationSelect,
  initialAddress,
  initialCoordinates
}: InspectionLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Initialize map when component mounts
  useEffect(() => {
    const initializeMap = async () => {
      if (mapContainer.current && !map.current) {
        try {
          setLoading(true);
          
          // Check if window.L exists (Leaflet)
          if (!window.L) {
            // Load Leaflet CSS
            const linkEl = document.createElement('link');
            linkEl.rel = 'stylesheet';
            linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            linkEl.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            linkEl.crossOrigin = '';
            document.head.appendChild(linkEl);
            
            // Load Leaflet JS
            const scriptEl = document.createElement('script');
            scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            scriptEl.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            scriptEl.crossOrigin = '';
            document.head.appendChild(scriptEl);
            
            // Wait for script to load
            await new Promise<void>((resolve) => {
              scriptEl.onload = () => resolve();
            });
          }
          
          // Initialize map
          const defaultCoords = initialCoordinates || {lat: -23.5505, lng: -46.6333}; // São Paulo as default
          map.current = window.L.map(mapContainer.current).setView([defaultCoords.lat, defaultCoords.lng], 13);
          
          // Add tile layer (OpenStreetMap)
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map.current);
          
          // Add marker if we have coordinates
          if (initialCoordinates) {
            marker.current = window.L.marker([initialCoordinates.lat, initialCoordinates.lng], {
              draggable: true
            }).addTo(map.current);
            
            // Update address on marker drag
            marker.current.on('dragend', handleMarkerDragEnd);
          }
          
          // Handle map click to place marker
          map.current.on('click', handleMapClick);
          
          setMapLoaded(true);
          
          // If we have an initial address but no coordinates, try to geocode it
          if (initialAddress && !initialCoordinates) {
            geocodeAddress(initialAddress);
          }
        } catch (error) {
          console.error("Error initializing map:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    
    // Remove existing marker if any
    if (marker.current) {
      map.current.removeLayer(marker.current);
    }
    
    // Add new marker
    marker.current = window.L.marker([lat, lng], {
      draggable: true
    }).addTo(map.current);
    
    // Add drag event
    marker.current.on('dragend', handleMarkerDragEnd);
    
    // Reverse geocode to get address
    reverseGeocode(lat, lng);
  };

  const handleMarkerDragEnd = () => {
    if (marker.current) {
      const position = marker.current.getLatLng();
      reverseGeocode(position.lat, position.lng);
    }
  };

  const geocodeAddress = async (address: string) => {
    try {
      setLoading(true);
      
      // Use Nominatim for geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        
        // Update map view
        map.current.setView([lat, lon], 15);
        
        // Add marker
        if (marker.current) {
          map.current.removeLayer(marker.current);
        }
        
        marker.current = window.L.marker([lat, lon], {
          draggable: true
        }).addTo(map.current);
        
        // Add drag event
        marker.current.on('dragend', handleMarkerDragEnd);
        
        // Update selected location
        onLocationSelect(display_name, { lat: parseFloat(lat), lng: parseFloat(lon) });
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      
      // Use Nominatim for reverse geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      
      if (data && data.display_name) {
        // Update selected location
        onLocationSelect(data.display_name, { lat, lng });
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      geocodeAddress(searchQuery);
    }
  };

  return (
    <div className="relative h-full">
      <div className="absolute top-2 left-2 right-2 z-[1000] bg-background/95 p-2 rounded-md shadow">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <Input
            placeholder="Buscar endereço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>
      </div>
      
      {loading && !mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      <div ref={mapContainer} className="h-full w-full" />
      
      {mapLoaded && (
        <div className="absolute bottom-2 left-2 right-2 z-[1000] text-xs text-center">
          Clique no mapa para definir a localização ou arraste o marcador
        </div>
      )}
    </div>
  );
}
