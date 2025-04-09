
// Change the return type to void for handleBulkStatusChange
const handleBulkStatusChange = async (ids: string[], newStatus: "active" | "inactive"): Promise<void> => {
  try {
    setIsActionLoading(true);
    
    const result = await checklistService.updateStatus(ids, newStatus);
    
    if (result.success) {
      toast.success(`${result.count} checklists updated successfully`);
      await refetch();
      setSelectedIds([]);
    } else {
      toast.error("Failed to update checklists");
    }
  } catch (error) {
    console.error("Error updating checklists:", error);
    toast.error("An error occurred while updating checklists");
  } finally {
    setIsActionLoading(false);
  }
};
