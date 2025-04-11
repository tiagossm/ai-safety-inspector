
import React from "react";
import { 
  InspectionHeader, 
  InspectionHeaderProps 
} from "./InspectionHeader";
import { 
  GroupsSidebar, 
  GroupsSidebarProps 
} from "./GroupsSidebar";
import { QuestionsPanel } from "../QuestionsPanel";
import { SaveIndicator } from "./SaveIndicator";
import { InspectionFooterActions } from "./InspectionFooterActions";

interface InspectionLayoutProps extends 
  InspectionHeaderProps,
  Pick<GroupsSidebarProps, 'groups' | 'currentGroupId' | 'setCurrentGroupId' | 'stats'> {
  loading: boolean;
  questions: any[];
  responses: Record<string, any>;
  subChecklists: Record<string, any>;
  onResponseChange: (questionId: string, data: any) => void;
  onSaveSubChecklistResponses: (questionId: string, responses: Record<string, any>) => Promise<void>;
  autoSave: boolean;
  saving: boolean;
  lastSaved: Date | null;
  setAutoSave: (value: boolean) => void;
  onSaveProgress: () => Promise<void>;
  onCompleteInspection: () => Promise<void>;
  onReopenInspection: () => Promise<void>;
  onViewActionPlan?: () => Promise<void>;
  onGenerateReport?: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export function InspectionLayout({
  loading,
  inspection,
  company,
  responsible,
  questions,
  responses,
  groups,
  subChecklists,
  currentGroupId,
  stats,
  saving,
  autoSave,
  lastSaved,
  setCurrentGroupId,
  setAutoSave,
  onResponseChange,
  onSaveProgress,
  onCompleteInspection,
  onReopenInspection,
  onSaveSubChecklistResponses,
  onViewActionPlan,
  onGenerateReport,
  refreshData
}: InspectionLayoutProps) {
  // Filter questions for current group
  const filteredQuestions = currentGroupId
    ? questions.filter(q => q.groupId === currentGroupId)
    : [];
  
  return (
    <div className="flex flex-col h-full">
      <InspectionHeader
        inspection={inspection}
        company={company}
        responsible={responsible}
        saving={saving}
        autoSave={autoSave}
        setAutoSave={setAutoSave}
        onSaveProgress={onSaveProgress}
        onCompleteInspection={onCompleteInspection}
        onReopenInspection={onReopenInspection}
        onViewActionPlan={onViewActionPlan}
        onGenerateReport={onGenerateReport}
        refreshData={refreshData}
        stats={stats}
      />
      
      <div className="flex flex-1 overflow-hidden mt-4">
        <GroupsSidebar
          groups={groups}
          currentGroupId={currentGroupId}
          setCurrentGroupId={setCurrentGroupId}
          stats={stats}
        />
        
        <div className="flex-1 overflow-auto px-4">
          <QuestionsPanel
            loading={loading}
            currentGroupId={currentGroupId}
            filteredQuestions={filteredQuestions}
            questions={questions}
            responses={responses}
            groups={groups}
            onResponseChange={onResponseChange}
            onSaveSubChecklistResponses={onSaveSubChecklistResponses}
            subChecklists={subChecklists}
          />
        </div>
      </div>
      
      <InspectionFooterActions
        inspection={inspection}
        saving={saving}
        onSaveProgress={onSaveProgress}
        onCompleteInspection={onCompleteInspection}
        stats={stats}
      />
      
      {/* Save indicator */}
      <SaveIndicator 
        saving={saving}
        lastSaved={lastSaved}
        autoSave={autoSave}
      />
    </div>
  );
}
