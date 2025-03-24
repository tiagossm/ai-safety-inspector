
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Loader2, SparkleIcon } from "lucide-react";

interface SubChecklistAIGeneratorProps {
  parentQuestion: ChecklistQuestion;
  onSubChecklistCreated: (subChecklistId: string) => void;
}

export function SubChecklistAIGenerator({
  parentQuestion,
  onSubChecklistCreated
}: SubChecklistAIGeneratorProps) {
  const [prompt, setPrompt] = useState(`Generate a detailed sub-checklist for the following question: "${parentQuestion.text}"`);
  const [questionCount, setQuestionCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    setGenerating(true);
    setPreviewData(null);
    
    try {
      // Call the sub-checklist generator edge function
      const { data, error } = await supabase.functions.invoke('generate-sub-checklist', {
        body: {
          prompt,
          parentQuestionId: parentQuestion.id,
          parentQuestionText: parentQuestion.text,
          questionCount,
        }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "Failed to generate sub-checklist");
      }
      
      setPreviewData(data);
      toast.success("Sub-checklist generated successfully");
    } catch (error) {
      console.error("Error generating sub-checklist:", error);
      toast.error("Failed to generate sub-checklist");
    } finally {
      setGenerating(false);
    }
  };
  
  const handleSave = async () => {
    if (!previewData) {
      toast.error("Please generate a sub-checklist first");
      return;
    }
    
    setGenerating(true);
    
    try {
      // Save the sub-checklist to the database
      const { data, error } = await supabase.functions.invoke('save-sub-checklist', {
        body: {
          subChecklist: previewData.subChecklist,
          parentQuestionId: parentQuestion.id,
        }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "Failed to save sub-checklist");
      }
      
      toast.success("Sub-checklist saved successfully");
      onSubChecklistCreated(data.subChecklistId);
    } catch (error) {
      console.error("Error saving sub-checklist:", error);
      toast.error("Failed to save sub-checklist");
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ai-prompt">AI Prompt</Label>
        <Textarea
          id="ai-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what kind of sub-checklist you want to generate"
          rows={3}
        />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-1/3">
          <Label htmlFor="question-count">Number of Questions</Label>
          <Input
            id="question-count"
            type="number"
            min={1}
            max={20}
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
          />
        </div>
        
        <Button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="mt-6"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <SparkleIcon className="mr-2 h-4 w-4" />
              Generate Sub-Checklist
            </>
          )}
        </Button>
      </div>
      
      {previewData && (
        <>
          <Separator />
          
          <div className="rounded-lg border p-4 bg-slate-50">
            <h3 className="font-medium text-lg mb-2">{previewData.subChecklist.title}</h3>
            {previewData.subChecklist.description && (
              <p className="text-sm text-gray-600 mb-4">{previewData.subChecklist.description}</p>
            )}
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Generated Questions:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {previewData.subChecklist.questions.map((question: any, index: number) => (
                  <li key={index} className="text-sm">
                    {question.text}
                    <span className="text-xs text-gray-500 ml-1">
                      ({question.responseType})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={generating}
            >
              Save Sub-Checklist
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
