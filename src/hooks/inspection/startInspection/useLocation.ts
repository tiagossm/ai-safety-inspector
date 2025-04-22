
import { useState } from "react";
import { toast } from "sonner";

export function useLocation(updateFormField: any) {
  const [loading, setLoading] = useState(false);
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada neste navegador");
      return false;
    }
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      const { latitude, longitude } = position.coords;
      updateFormField("coordinates", { latitude, longitude });
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          { headers: { "Accept-Language": "pt-BR" } },
        );
        if (response.ok) {
          const data = await response.json();
          const address = data.display_name;
          updateFormField("location", address);
        }
      } catch (err) {
        console.error("Error in reverse geocoding:", err);
        toast.error("Erro ao obter localização");
      }
      toast.success("Localização atual detectada");
      return true;
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
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { getCurrentLocation, loading };
}
