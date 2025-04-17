
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export type InspectionType = "internal" | "external" | "audit" | "routine";
export type InspectionPriority = "low" | "medium" | "high";

export interface StartInspectionFormData {
  companyId: string;
  companyData: any | null;
  responsibleId: string;
  responsibleData: any | null;
  checklistId: string;
  location: string;
  coordinates: { latitude: number; longitude: number } | null;
  notes: string;
  inspectionType: InspectionType;
  priority: InspectionPriority;
  scheduledDate: Date | undefined;
}

export function useStartInspection(checklistId?: string) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<StartInspectionFormData>({
    companyId: "",
    companyData: null,
    responsibleId: "",
    responsibleData: null,
    checklistId: checklistId || "",
    location: "",
    coordinates: null,
    notes: "",
    inspectionType: "routine",
    priority: "medium",
    scheduledDate: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [draftSaved, setDraftSaved] = useState<Date | null>(null);
  const [checklist, setChecklist] = useState<any>(null);
  const [checklistLoading, setChecklistLoading] = useState(false);

  const updateFormField = (field: keyof StartInspectionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const fetchChecklistInfo = useCallback(async () => {
    if (!checklistId) return;
    
    setChecklistLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("checklists")
        .select(`
          id, 
          title, 
          description,
          company_id,
          responsible_id
        `)
        .eq("id", checklistId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setChecklist(data);
        
        if (data.company_id) {
          updateFormField("companyId", data.company_id);
          fetchCompanyDetails(data.company_id);
        }
        
        if (data.responsible_id) {
          updateFormField("responsibleId", data.responsible_id);
          fetchResponsibleDetails(data.responsible_id);
        }
      }
    } catch (err) {
      console.error("Error fetching checklist:", err);
      toast.error("Não foi possível carregar os dados do checklist");
    } finally {
      setChecklistLoading(false);
    }
  }, [checklistId]);

  const fetchCompanyDetails = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        updateFormField("companyData", data);
        
        if (data.cnae) {
          if (data.address && !formData.location) {
            updateFormField("location", data.address);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  const fetchResponsibleDetails = async (responsibleId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", responsibleId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        updateFormField("responsibleData", data);
      }
    } catch (err) {
      console.error("Error fetching responsible details:", err);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.companyId) {
      errors.company = "Empresa é obrigatória";
    }
    
    if (formData.companyData?.cnae && !/^\d{2}\.\d{2}-\d$/.test(formData.companyData.cnae)) {
      errors.cnae = "CNAE deve estar no formato 00.00-0";
    }
    
    if (!formData.responsibleId) {
      errors.responsible = "Responsável é obrigatório";
    }
    
    if (!formData.location && !formData.coordinates) {
      errors.location = "Localização é obrigatória";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return false;
    }
    
    return true;
  };

  const saveInspection = async (status: 'draft' | 'pending' = 'pending') => {
    if (status === 'pending' && !validateForm()) {
      toast.error("Por favor, corrija os erros antes de prosseguir");
      return false;
    }

    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    setSubmitting(true);
    
    try {
      const locationData = formData.coordinates 
        ? { 
            text: formData.location || "", 
            latitude: formData.coordinates.latitude, 
            longitude: formData.coordinates.longitude 
          }
        : { text: formData.location };

      const inspectionData = {
        checklist_id: formData.checklistId,
        company_id: formData.companyId,
        responsible_id: formData.responsibleId,
        location: formData.location,
        scheduled_date: formData.scheduledDate ? formData.scheduledDate.toISOString() : null,
        metadata: {
          ...locationData,
          notes: formData.notes,
          startedFrom: "new_start_inspection_screen"
        },
        status: status,
        inspection_type: formData.inspectionType,
        priority: formData.priority,
        cnae: formData.companyData?.cnae || null,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from("inspections")
        .insert(inspectionData)
        .select("id")
        .single();

      if (error) throw error;
      
      if (data) {
        toast.success(status === 'draft' 
          ? "Rascunho salvo com sucesso" 
          : "Inspeção iniciada com sucesso");

        localStorage.removeItem('inspection_draft');
        
        return data.id;
      }
    } catch (err: any) {
      console.error("Error saving inspection:", err);
      toast.error(`Erro ao salvar inspeção: ${err.message}`);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const startInspection = async () => {
    const inspectionId = await saveInspection('pending');
    if (inspectionId) {
      // Modificação aqui: corrigir a rota para garantir que seja direcionado para a execução da inspeção
      navigate(`/inspections/${inspectionId}/view`);
      return true;
    }
    return false;
  };

  const saveAsDraft = async () => {
    const inspectionId = await saveInspection('draft');
    if (inspectionId) {
      navigate("/inspections");
      return true;
    }
    return false;
  };

  const saveLocalDraft = useCallback(() => {
    try {
      localStorage.setItem('inspection_draft', JSON.stringify(formData));
      setDraftSaved(new Date());
    } catch (err) {
      console.error("Error saving local draft:", err);
    }
  }, [formData]);

  const loadLocalDraft = useCallback(() => {
    try {
      const savedData = localStorage.getItem('inspection_draft');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        if (parsedData.scheduledDate) {
          parsedData.scheduledDate = new Date(parsedData.scheduledDate);
        }
        
        setFormData(parsedData);
        
        return true;
      }
    } catch (err) {
      console.error("Error loading local draft:", err);
    }
    
    return false;
  }, []);

  const cancelAndGoBack = () => {
    navigate("/inspections");
  };

  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      if (formData.companyId || formData.location || formData.notes) {
        saveLocalDraft();
      }
    }, 30000);

    return () => clearInterval(autosaveInterval);
  }, [formData, saveLocalDraft]);

  useEffect(() => {
    const hasDraft = loadLocalDraft();
    if (hasDraft) {
      toast.info("Rascunho anterior carregado", {
        description: "Seus dados preenchidos anteriormente foram restaurados",
        action: {
          label: "Descartar",
          onClick: () => {
            localStorage.removeItem('inspection_draft');
            window.location.reload();
          }
        }
      });
    }
  }, [loadLocalDraft]);

  useEffect(() => {
    if (checklistId) {
      fetchChecklistInfo();
    }
  }, [checklistId, fetchChecklistInfo]);

  const getCurrentLocation = async (): Promise<boolean> => {
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
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      updateFormField("coordinates", { latitude, longitude });
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'pt-BR' } }
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

  const getFormProgress = (): number => {
    let totalFields = 5;
    let completedFields = 0;
    
    if (formData.companyId) completedFields++;
    if (formData.companyData?.cnae && /^\d{2}\.\d{2}-\d$/.test(formData.companyData.cnae)) completedFields++;
    if (formData.responsibleId) completedFields++;
    if (formData.location || formData.coordinates) completedFields++;
    if (formData.inspectionType) completedFields++;
    
    return Math.floor((completedFields / totalFields) * 100);
  };

  const generateShareableLink = (inspectionId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/inspections/${inspectionId}/shared`;
  };

  return {
    formData,
    updateFormField,
    loading,
    submitting,
    formErrors,
    draftSaved,
    checklist,
    checklistLoading,
    validateForm,
    startInspection,
    saveAsDraft,
    cancelAndGoBack,
    getCurrentLocation,
    getFormProgress,
    generateShareableLink,
    fetchCompanyDetails,
    fetchResponsibleDetails
  };
}
