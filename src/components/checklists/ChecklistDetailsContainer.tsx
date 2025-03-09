
import { useChecklistEditing } from "@/hooks/checklist/useChecklistEditing";
import ChecklistHeader from "@/components/checklists/ChecklistHeader";
import ChecklistForm from "@/components/checklists/ChecklistForm";
import ChecklistItemsList from "@/components/checklists/ChecklistItemsList";
import AddChecklistItemForm from "@/components/checklists/AddChecklistItemForm";
import ChecklistNotFound from "@/components/checklists/ChecklistNotFound";
import ChecklistLoading from "@/components/checklists/ChecklistLoading";
import ChecklistProgress from "@/components/checklists/ChecklistProgress";
import { questionTypes } from "./constants/questionTypes";
import { useChecklistItemHandlers } from "./hooks/useChecklistItemHandlers";

interface ChecklistDetailsContainerProps {
  checklistId: string;
}

export default function ChecklistDetailsContainer({ checklistId }: ChecklistDetailsContainerProps) {
  const {
    checklist,
    setChecklist,
    items,
    setItems,
    users,
    isLoading,
    saving,
    handleSave,
    notFound
  } = useChecklistEditing(checklistId);

  const {
    handleItemChange,
    handleDeleteItem,
    handleAddItem
  } = useChecklistItemHandlers(checklistId, items, setItems);

  // Redireciona caso o checklist não seja encontrado
  if (notFound) {
    return <ChecklistNotFound />;
  }

  if (isLoading) {
    return <ChecklistLoading />;
  }

  if (!checklist) {
    return <ChecklistNotFound />;
  }

  // Calculate total items
  const totalItems = items.length;

  return (
    <div className="space-y-6">
      <ChecklistHeader
        checklist={checklist}
        saving={saving}
        onSave={handleSave}
      />

      {checklist && (
        <div className="grid gap-6">
          <ChecklistForm
            checklist={checklist}
            users={users}
            setChecklist={setChecklist}
          />

          <ChecklistProgress checklist={checklist} totalItems={totalItems} />

          <ChecklistItemsList
            items={items}
            onItemChange={handleItemChange}
            onDeleteItem={handleDeleteItem}
            questionTypes={questionTypes}
          />

          <AddChecklistItemForm
            checklistId={checklistId}
            onAddItem={handleAddItem}
            lastOrder={items.length > 0 ? Math.max(...items.map(i => i.ordem)) + 1 : 0}
            questionTypes={questionTypes}
          />
        </div>
      )}
    </div>
  );
}
