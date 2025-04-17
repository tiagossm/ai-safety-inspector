
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider"; // Import the auth context to get the user ID

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
  const { user } = useAuth(); // Get the current user from auth context
  
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

  // Funções auxiliares para atualizar o estado
  const updateFormField = (field: keyof StartInspectionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando ele for alterado
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Carrega dados do checklist
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
        
        // Se o checklist já tem empresa e responsável definidos, pré-preencher
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

  // Busca detalhes da empresa
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
        
        // Atualizar automaticamente o CNAE e localização
        if (data.cnae) {
          // Manter o campo CNAE atualizado
          if (data.address && !formData.location) {
            updateFormField("location", data.address);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };
  
  // Busca detalhes do responsável
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

  // Validação do formulário
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

  // Salvar inspeção
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
      // Combinar localização manual com coordenadas GPS
      const locationData = formData.coordinates 
        ? { 
            text: formData.location || "", 
            latitude: formData.coordinates.latitude, 
            longitude: formData.coordinates.longitude 
          }
        : { text: formData.location };

      // Dados para inserção da inspeção
      const inspectionData = {
        checklist_id: formData.checklistId,
        company_id: formData.companyId,
        responsible_id: formData.responsibleId,
        location: formData.location,
        scheduled_date: formData.scheduledDate,
        metadata: {
          ...locationData,
          notes: formData.notes,
          startedFrom: "new_start_inspection_screen"
        },
        status: status,
        inspection_type: formData.inspectionType,
        priority: formData.priority,
        cnae: formData.companyData?.cnae || null,
        user_id: user.id // Add the user_id field which is required by the database
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

        // Removendo rascunho do localStorage
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

  // Iniciar inspeção
  const startInspection = async () => {
    const inspectionId = await saveInspection('pending');
    if (inspectionId) {
      navigate(`/inspections/${inspectionId}/view`);
      return true;
    }
    return false;
  };

  // Salvar como rascunho
  const saveAsDraft = async () => {
    const inspectionId = await saveInspection('draft');
    if (inspectionId) {
      navigate("/inspections");
      return true;
    }
    return false;
  };

  // Salvar rascunho local
  const saveLocalDraft = useCallback(() => {
    try {
      localStorage.setItem('inspection_draft', JSON.stringify(formData));
      setDraftSaved(new Date());
    } catch (err) {
      console.error("Error saving local draft:", err);
    }
  }, [formData]);

  // Carregar rascunho local
  const loadLocalDraft = useCallback(() => {
    try {
      const savedData = localStorage.getItem('inspection_draft');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Converter string de data para objeto Date
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

  // Cancelar e voltar
  const cancelAndGoBack = () => {
    navigate("/inspections");
  };

  // Efeito para salvar rascunho local periodicamente
  useEffect(() => {
    // Salva a cada 30 segundos se houver mudanças
    const autosaveInterval = setInterval(() => {
      if (formData.companyId || formData.location || formData.notes) {
        saveLocalDraft();
      }
    }, 30000);

    return () => clearInterval(autosaveInterval);
  }, [formData, saveLocalDraft]);

  // Efeito para carregar rascunho na inicialização
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

  // Efeito para carregar informações do checklist
  useEffect(() => {
    if (checklistId) {
      fetchChecklistInfo();
    }
  }, [checklistId, fetchChecklistInfo]);

  // Lidar com geolocalização
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
      
      // Tentar fazer geocodificação reversa para obter o endereço
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
        // Não mostra erro ao usuário, apenas registra no console
        // e mantém as coordenadas
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

  // Calcular progresso do formulário
  const getFormProgress = (): number => {
    let totalFields = 5; // campos obrigatórios: empresa, responsável, localização, tipo, prioridade
    let completedFields = 0;
    
    if (formData.companyId) completedFields++;
    if (formData.companyData?.cnae && /^\d{2}\.\d{2}-\d$/.test(formData.companyData.cnae)) completedFields++;
    if (formData.responsibleId) completedFields++;
    if (formData.location || formData.coordinates) completedFields++;
    if (formData.inspectionType) completedFields++;
    
    return Math.floor((completedFields / totalFields) * 100);
  };

  // Compartilhar inspeção (para ser implementado com a funcionalidade de compartilhamento)
  const generateShareableLink = (inspectionId: string) => {
    // A implementação real envolveria geração de token JWT
    // Por enquanto, apenas cria uma URL básica
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
