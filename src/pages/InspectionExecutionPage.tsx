import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Building, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clipboard,
  CornerDownRight
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InspectionQuestion } from "@/components/inspection/InspectionQuestion";
import { InspectionDetails } from "@/types/newChecklist";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { initializeInspectionsSchema } from "@/utils/initializeDatabase";

type PriorityType = "low" | "medium" | "high";
type StatusType = "pending" | "in_progress" | "completed";

export default function InspectionExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inspection, setInspection] = useState<InspectionDetails | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [groups, setGroups] = useState<any[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  
  useEffect(() => {
    // Initialize the schema first to ensure all tables and columns exist
    initializeInspectionsSchema().then(() => {
      if (id) {
        fetchInspectionData();
      }
    });
  }, [id]);
  
  const fetchInspectionData = async () => {
    setLoading(true);
    try {
      // Fetch inspection details
      const { data: inspectionData, error: inspectionError } = await supabase
        .from("inspections")
        .select("*, checklists(*)")
        .eq("id", id)
        .single();
      
      if (inspectionError) throw inspectionError;
      if (!inspectionData) throw new Error("Inspection not found");
      
      // Parse the checklist JSON data if it exists and is a string
      let checklistData = null;
      if (inspectionData.checklist) {
        try {
          // If it's a string, try to parse it
          if (typeof inspectionData.checklist === 'string') {
            checklistData = JSON.parse(inspectionData.checklist);
          } else {
            // Otherwise, assume it's already an object
            checklistData = inspectionData.checklist;
          }
        } catch (e) {
          console.error("Error parsing checklist JSON:", e);
        }
      }
      
      // Map the inspection data to our type
      const inspectionDetails: InspectionDetails = {
        id: inspectionData.id,
        // Use the title from parsed checklist data, checklists relation, or default
        title: checklistData?.title || 
               (inspectionData.checklists ? inspectionData.checklists.title : "Untitled Inspection"),
        // Similarly for description
        description: checklistData?.description || 
                    (inspectionData.checklists ? inspectionData.checklists.description : undefined),
        checklistId: inspectionData.checklist_id,
        companyId: inspectionData.company_id,
        locationName: inspectionData.location || "",
        responsibleId: inspectionData.responsible_id,
        scheduledDate: inspectionData.scheduled_date,
        priority: (inspectionData.priority || "medium") as PriorityType,
        status: (inspectionData.status === "Pendente" ? "pending" : 
                inspectionData.status === "Em Andamento" ? "in_progress" : "completed") as StatusType,
        createdAt: inspectionData.created_at,
        // Use created_at if updated_at is not available
        updatedAt: inspectionData.created_at
      };
      
      setInspection(inspectionDetails);
      
      // Fetch related company
      if (inspectionData.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("id, name, city")
          .eq("id", inspectionData.company_id)
          .single();
        
        setCompany(companyData);
      }
      
      // Fetch responsible user
      if (inspectionData.responsible_id) {
        const { data: userData } = await supabase
          .from("users")
          .select("id, name, email")
          .eq("id", inspectionData.responsible_id)
          .single();
        
        setResponsible(userData);
      }
      
      // Fetch checklist questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("checklist_itens")
        .select(`
          id,
          pergunta,
          tipo_resposta,
          obrigatorio,
          opcoes,
          hint,
          weight,
          parent_item_id,
          condition_value,
          permite_foto,
          permite_video,
          permite_audio,
          ordem,
          sub_checklist_id
        `)
        .eq("checklist_id", inspectionData.checklist_id)
        .order("ordem", { ascending: true });
      
      if (questionsError) throw questionsError;
      
      // Process questions and extract groups
      const groupsMap = new Map();
      const processedQuestions = questionsData.map((q: any) => {
        let groupId = null;
        let groupTitle = null;
        
        // Try to extract group info from hint
        if (q.hint) {
          try {
            if (q.hint.includes('groupId')) {
              const groupInfo = JSON.parse(q.hint);
              groupId = groupInfo.groupId;
              groupTitle = groupInfo.groupTitle;
              
              if (groupId && groupTitle && !groupsMap.has(groupId)) {
                groupsMap.set(groupId, {
                  id: groupId,
                  title: groupTitle,
                  order: groupsMap.size
                });
              }
            }
          } catch (e) {
            // Not a JSON with group info
            console.warn("Error parsing group info:", e);
          }
        }
        
        return {
          id: q.id,
          text: q.pergunta,
          responseType: q.tipo_resposta,
          isRequired: q.obrigatorio,
          options: Array.isArray(q.opcoes) ? q.opcoes.map((opt: any) => String(opt)) : [],
          hint: q.hint,
          weight: q.weight || 1,
          groupId,
          parentQuestionId: q.parent_item_id,
          conditionValue: q.condition_value,
          allowsPhoto: q.permite_foto,
          allowsVideo: q.permite_video,
          allowsAudio: q.permite_audio,
          order: q.ordem,
          hasSubChecklist: !!q.sub_checklist_id,
          subChecklistId: q.sub_checklist_id
        };
      });
      
      setQuestions(processedQuestions);
      
      // Convert groups map to array
      const groupsArray = Array.from(groupsMap.values());
      setGroups(groupsArray);
      
      // Set default active group
      if (groupsArray.length > 0) {
        setCurrentGroupId(groupsArray[0].id);
      }
      
      // Fetch existing responses
      const { data: responsesData, error: responsesError } = await supabase
        .from("inspection_responses")
        .select("*")
        .eq("inspection_id", id);
      
      if (!responsesError && responsesData) {
        const responsesMap: Record<string, any> = {};
        responsesData.forEach((response: any) => {
          responsesMap[response.question_id] = {
            value: response.answer,
            comment: response.notes,
            actionPlan: response.action_plan,
            attachments: response.media_urls || []
          };
        });
        setResponses(responsesMap);
      }
    } catch (error) {
      console.error("Error fetching inspection data:", error);
      toast.error("Failed to load inspection data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleResponseChange = (questionId: string, data: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...data
      }
    }));
  };
  
  const handleSaveInspection = async () => {
    setSaving(true);
    
    try {
      // Prepare the responses for insertion/update
      const responseEntries = Object.entries(responses).map(([questionId, data]) => ({
        inspection_id: id,
        question_id: questionId,
        answer: data.value || "",
        notes: data.comment,
        action_plan: data.actionPlan,
        media_urls: data.attachments
      }));
      
      // Check if any required questions are missing answers
      const requiredQuestions = questions.filter(q => q.isRequired);
      const unansweredRequired = requiredQuestions.filter(q => 
        !responses[q.id] || responses[q.id].value === undefined || responses[q.id].value === null || responses[q.id].value === ""
      );
      
      if (unansweredRequired.length > 0) {
        toast.warning(`There are ${unansweredRequired.length} required questions without answers.`);
        // Continue saving anyway
      }
      
      // Delete existing responses
      const { error: deleteError } = await supabase
        .from("inspection_responses")
        .delete()
        .eq("inspection_id", id);
      
      if (deleteError) throw deleteError;
      
      // Insert new responses (if any)
      if (responseEntries.length > 0) {
        const { error: insertError } = await supabase
          .from("inspection_responses")
          .insert(responseEntries);
        
        if (insertError) throw insertError;
      }
      
      // Update inspection status based on completion
      const totalRequired = requiredQuestions.length;
      const answeredRequired = requiredQuestions.filter(q => 
        responses[q.id] && responses[q.id].value !== undefined && responses[q.id].value !== null && responses[q.id].value !== ""
      ).length;
      
      let newStatus: StatusType = "pending";
      
      if (answeredRequired === totalRequired) {
        newStatus = "completed";
      } else if (answeredRequired > 0) {
        newStatus = "in_progress";
      }
      
      const { error: updateError } = await supabase
        .from("inspections")
        .update({ 
          status: newStatus === "pending" ? "Pendente" : 
                 newStatus === "in_progress" ? "Em Andamento" : "Concluído",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      
      if (updateError) throw updateError;
      
      toast.success("Inspection saved successfully");
      
      // Update the local inspection status
      setInspection(prev => prev ? {
        ...prev,
        status: newStatus,
        updatedAt: new Date().toISOString()
      } : null);
    } catch (error) {
      console.error("Error saving inspection:", error);
      toast.error("Failed to save inspection");
    } finally {
      setSaving(false);
    }
  };
  
  const getFilteredQuestions = () => {
    if (!currentGroupId) {
      // Show questions without a group
      return questions.filter(q => !q.groupId);
    }
    
    return questions.filter(q => q.groupId === currentGroupId);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };
  
  const getCompletionStats = () => {
    const total = questions.length;
    const answered = Object.keys(responses).length;
    const percentage = total ? Math.round((answered / total) * 100) : 0;
    
    return {
      total,
      answered,
      percentage
    };
  };
  
  const filteredQuestions = getFilteredQuestions();
  const stats = getCompletionStats();
  
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold">
            {loading ? <Skeleton className="h-8 w-64" /> : inspection?.title}
          </h1>
          {loading ? <Skeleton className="h-4 w-48 mt-1" /> : 
            inspection?.description && <p className="text-muted-foreground">{inspection.description}</p>
          }
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Inspection Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status:</span>
                    {inspection?.status && getStatusBadge(inspection.status)}
                  </div>
                  
                  {inspection?.priority && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Priority:</span>
                      {getPriorityBadge(inspection.priority)}
                    </div>
                  )}
                  
                  {company && (
                    <div className="flex items-start gap-2">
                      <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Company</p>
                        <p className="text-sm text-muted-foreground">{company.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {inspection?.locationName && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{inspection.locationName}</p>
                      </div>
                    </div>
                  )}
                  
                  {responsible && (
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Responsible</p>
                        <p className="text-sm text-muted-foreground">{responsible.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {inspection?.scheduledDate && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Scheduled Date</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(inspection.scheduledDate), "PPP")}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Completion</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress:</span>
                    <span className="text-sm font-medium">{stats.percentage}%</span>
                  </div>
                  
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    {stats.answered} of {stats.total} questions answered
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {groups.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Question Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {groups.map(group => (
                    <Button
                      key={group.id}
                      variant={currentGroupId === group.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setCurrentGroupId(group.id)}
                    >
                      <Clipboard className="h-4 w-4 mr-2" />
                      <span className="truncate">{group.title}</span>
                    </Button>
                  ))}
                  
                  {/* Option to view ungrouped questions */}
                  <Button
                    variant={currentGroupId === null ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentGroupId(null)}
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    <span>Ungrouped Questions</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Button
            className="w-full"
            disabled={saving}
            onClick={handleSaveInspection}
          >
            {saving ? "Saving..." : "Save Inspection"}
          </Button>
        </div>
        
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {currentGroupId ? 
                    groups.find(g => g.id === currentGroupId)?.title || "Questions" : 
                    "Questions"}
                </CardTitle>
                
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-gray-50">
                    {filteredQuestions.length} Questions
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No questions in this section</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                  <div className="space-y-4">
                    {filteredQuestions.map((question, index) => (
                      <InspectionQuestion
                        key={question.id}
                        question={question}
                        index={index}
                        response={responses[question.id]}
                        onResponseChange={(data) => handleResponseChange(question.id, data)}
                        allQuestions={questions}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
