
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Database } from "@/integrations/supabase/types";

type ApprovalStatus = Database["public"]["Enums"]["approval_status"];

export function useEnhancedInspectionForm(checklistId: string | undefined) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const [companyId, setCompanyId] = useState<string>("");
  const [companyData, setCompanyData] = useState<any>(null);
  const [recentCompanies, setRecentCompanies] = useState<any[]>([]);
  const [recentLocations, setRecentLocations] = useState<any[]>([]);
  
  const [responsibleId, setResponsibleId] = useState<string>("");
  const [responsibleData, setResponsibleData] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [locationMethod, setLocationMethod] = useState<'address' | 'map'>('address');
  const [location, setLocation] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [inspectionType, setInspectionType] = useState<string>("internal");
  const [priority, setPriority] = useState<string>("medium");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdInspectionId, setCreatedInspectionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("company");
  const [progress, setProgress] = useState<number>(0);

  const hasFetched = useRef(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Check for session storage for already submitted inspections
  useEffect(() => {
    if (!checklistId) return;
    
    const formSubmissionKey = `inspection_submitted_${checklistId}`;
    const wasSubmitted = sessionStorage.getItem(formSubmissionKey) === "true";
    const savedId = sessionStorage.getItem("last_created_inspection_id");
    
    if (wasSubmitted && savedId) {
      console.log(`This inspection was already created (ID: ${savedId}). Redirecting...`);
      setCreatedInspectionId(savedId);
      setHasSubmitted(true);
      navigate(`/inspections/${savedId}/view`, { replace: true });
    }
  }, [checklistId, navigate]);

  // Fetch checklist data and initialize
  useEffect(() => {
    if (!checklistId) {
      toast.error("ID do checklist não fornecido");
      navigate("/inspections");
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchChecklist = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("checklists")
          .select("id, title, description, total_questions, company_id, checklist_itens(id)")
          .eq("id", checklistId)
          .single();

        if (error || !data) {
          toast.error("Checklist não encontrado ou erro ao buscar dados");
          navigate("/inspections");
          return;
        }

        setChecklist(data);

        if (data.company_id) {
          const { data: companyData } = await supabase
            .from("companies")
            .select("id, fantasy_name, address, cnae")
            .eq("id", data.company_id)
            .single();

          if (companyData) {
            setCompanyId(companyData.id);
            setCompanyData(companyData);
            setLocation(companyData.address || "");
          }
        }
        
        // Fetch recent companies and locations
        fetchRecentData();
      } catch (error) {
        console.error("Erro ao buscar checklist:", error);
        toast.error("Erro ao carregar checklist");
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
    
    // Setup auto-save
    setupAutoSave();
    
    // Cleanup
    return () => {
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }
    };
  }, [checklistId, navigate]);

  // Calculate progress
  useEffect(() => {
    let completedSteps = 0;
    const totalRequiredSteps = 2; // Company and Responsible are required
    
    if (companyId && companyData) completedSteps++;
    if (responsibleId) completedSteps++;
    
    setProgress(Math.round((completedSteps / totalRequiredSteps) * 100));
  }, [companyId, companyData, responsibleId]);

  // Update location when company data changes
  useEffect(() => {
    if (companyData?.address) {
      setLocation(companyData.address);
    }
  }, [companyData]);

  const setupAutoSave = () => {
    // Auto-save every 30 seconds
    autoSaveTimer.current = setInterval(() => {
      if ((companyId || location || notes) && !submitting && !hasSubmitted) {
        saveDraft();
      }
    }, 30000);
  };

  const fetchRecentData = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch recent companies used by this user
      const { data: recentCompData } = await supabase
        .from("inspections")
        .select("company_id, companies(id, fantasy_name, cnae)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentCompData) {
        const uniqueCompanies = recentCompData
          .filter(item => item.companies)
          .map(item => item.companies)
          .filter((company, index, self) => 
            index === self.findIndex(c => c.id === company.id)
          );
        
        setRecentCompanies(uniqueCompanies);
      }

      // Fetch recent locations used by this user
      const { data: recentLocData } = await supabase
        .from("inspections")
        .select("location")
        .eq("user_id", user.id)
        .not("location", "is", null)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentLocData) {
        const uniqueLocations = recentLocData
          .filter(item => item.location)
          .map(item => ({ address: item.location }))
          .filter((loc, index, self) => 
            index === self.findIndex(l => l.address === loc.address)
          );
        
        setRecentLocations(uniqueLocations);
      }
    } catch (error) {
      console.error("Error fetching recent data:", error);
    }
  };
  
  const saveDraft = async () => {
    // Only save if we have a user ID and some data to save
    if (!user?.id || (!companyId && !location && !notes)) return;

    // Implement draft saving logic
    try {
      const draftKey = `inspection_draft_${checklistId || "new"}`;
      const draftData = {
        companyId,
        companyData,
        responsibleId,
        responsibleData,
        location,
        coordinates,
        notes,
        inspectionType,
        priority,
        scheduledDate: scheduledDate ? scheduledDate.toISOString() : null,
        lastSaved: new Date().toISOString()
      };
      
      // Save to localStorage (could be enhanced to save to database)
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      
      setDraftSaved(true);
      
      // Reset draft saved indicator after 3 seconds
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };
  
  const loadDraft = () => {
    try {
      const draftKey = `inspection_draft_${checklistId || "new"}`;
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        
        // Restore data from draft
        if (draftData.companyId) setCompanyId(draftData.companyId);
        if (draftData.companyData) setCompanyData(draftData.companyData);
        if (draftData.responsibleId) setResponsibleId(draftData.responsibleId);
        if (draftData.responsibleData) setResponsibleData(draftData.responsibleData);
        if (draftData.location) setLocation(draftData.location);
        if (draftData.coordinates) setCoordinates(draftData.coordinates);
        if (draftData.notes) setNotes(draftData.notes);
        if (draftData.inspectionType) setInspectionType(draftData.inspectionType);
        if (draftData.priority) setPriority(draftData.priority);
        if (draftData.scheduledDate) setScheduledDate(new Date(draftData.scheduledDate));
        
        toast.success("Rascunho carregado com sucesso");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error loading draft:", error);
      return false;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!companyId) newErrors.company = "Selecione uma empresa";
    if (!companyData?.cnae) newErrors.cnae = "CNAE é obrigatório";
    else if (!/^\d{2}\.\d{2}-\d$/.test(companyData.cnae)) newErrors.cnae = "CNAE deve estar no formato 00.00-0";
    if (!responsibleId && !responsibleData) newErrors.responsible = "Selecione um responsável";
    if (!checklistId || !/^[0-9a-f\-]{36}$/i.test(checklistId)) newErrors.checklist = "ID do checklist inválido";
    if (companyId && !/^[0-9a-f\-]{36}$/i.test(companyId)) newErrors.company = "ID da empresa inválido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return companyId && companyData?.cnae && /^\d{2}\.\d{2}-\d$/.test(companyData.cnae);
  };

  const formatCNAE = (cnae: string) => {
    const numericOnly = cnae.replace(/[^\d]/g, '');
    if (numericOnly.length >= 5) {
      return `${numericOnly.substring(0, 2)}.${numericOnly.substring(2, 4)}-${numericOnly.substring(4, 5)}`;
    }
    return cnae;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Check for existing inspection in session storage
    const formSubmissionKey = `inspection_submitted_${checklistId}`;
    const wasSubmitted = sessionStorage.getItem(formSubmissionKey) === "true";
    const savedId = sessionStorage.getItem("last_created_inspection_id");
    
    if (wasSubmitted && savedId) {
      console.log(`This inspection was already created (ID: ${savedId}). Redirecting...`);
      navigate(`/inspections/${savedId}/view`, { replace: true });
      return true;
    }

    // Or check component state
    if (hasSubmitted || createdInspectionId) {
      console.log("Form already submitted, preventing duplicate submission");
      if (createdInspectionId) {
        navigate(`/inspections/${createdInspectionId}/view`, { replace: true });
      }
      return false;
    }

    if (!validateForm()) {
      toast.error("Preencha todos os campos obrigatórios");
      return false;
    }
    
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      setSubmitting(true);
      setHasSubmitted(true);

      const formattedCNAE = formatCNAE(companyData.cnae);
      const formattedDate = scheduledDate ? scheduledDate.toISOString() : null;
      
      // Prepare location data
      const locationData = coordinates ? {
        location,
        geolocation: `${coordinates.lat},${coordinates.lng}`
      } : { location };

      const inspectionData = {
        checklist_id: checklistId,
        user_id: user.id,
        company_id: companyId,
        cnae: formattedCNAE,
        status: "pending",
        approval_status: "pending" as ApprovalStatus,
        responsible_id: responsibleId || null,
        scheduled_date: formattedDate,
        ...locationData,
        inspection_type: inspectionType || "internal",
        priority: priority || "medium",
        metadata: {
          notes: notes || "",
          responsible_data: responsibleId ? null : responsibleData,
        },
        checklist: {
          title: checklist.title,
          description: checklist.description || "",
          total_questions: Array.isArray(checklist?.checklist_itens) ? checklist.checklist_itens.length : 0
        }
      };

      const { data: inspection, error } = await supabase
        .from("inspections")
        .insert(inspectionData)
        .select("id, status, created_at, updated_at")
        .single();

      if (error) throw error;

      // Save inspection ID to session storage to prevent duplicate submissions
      if (inspection?.id) {
        sessionStorage.setItem(formSubmissionKey, "true");
        sessionStorage.setItem("last_created_inspection_id", inspection.id);
        setCreatedInspectionId(inspection.id);
        
        // Remove draft after successful submission
        localStorage.removeItem(`inspection_draft_${checklistId || "new"}`);
      }

      toast.success("Inspeção criada com sucesso!");
      console.log(`Navigating to inspection ${inspection.id} view page`);
      
      // Use replace to prevent back navigation to form
      navigate(`/inspections/${inspection.id}/view`, { replace: true });
      return true;

    } catch (error: any) {
      console.error("Error creating inspection:", error);
      toast.error(`Erro ao criar inspeção: ${error.message}`);
      setHasSubmitted(false);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompanySelect = (id: string, data: any) => {
    setCompanyId(id);
    setCompanyData(data);
    if (data.address) setLocation(data.address);
    if (data.cnae && /^\d{2}\.\d{2}-\d$/.test(data.cnae)) {
      setErrors(prev => ({ ...prev, cnae: "" }));
    }
    
    setActiveTab("responsible");
  };

  const handleResponsibleSelect = (id: string, data: any) => {
    setResponsibleId(id);
    setResponsibleData(data);
    setErrors(prev => ({ ...prev, responsible: "" }));
    
    setActiveTab("details");
  };
  
  const handleLocationSelect = (address: string, coords?: {lat: number, lng: number}) => {
    setLocation(address);
    if (coords) {
      setCoordinates(coords);
    }
  };

  return {
    // State
    checklist,
    loading,
    submitting,
    companyId,
    companyData,
    responsibleId,
    responsibleData,
    scheduledDate,
    location,
    notes,
    inspectionType,
    priority,
    errors,
    createdInspectionId,
    activeTab,
    progress,
    draftSaved,
    locationMethod,
    coordinates,
    recentCompanies,
    recentLocations,
    
    // Setters
    setCompanyData,
    setLocation,
    setNotes,
    setInspectionType,
    setPriority,
    setScheduledDate,
    setActiveTab,
    setLocationMethod,
    setCoordinates,
    
    // Handlers
    handleCompanySelect,
    handleResponsibleSelect,
    handleLocationSelect,
    handleSubmit,
    saveDraft,
    loadDraft,
    isFormValid,
    validateForm
  };
}
