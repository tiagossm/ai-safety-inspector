
import { useState } from "react";

export function useChecklistTabs() {
  const [activeTab, setActiveTab] = useState("manual");
  
  return { activeTab, setActiveTab };
}
