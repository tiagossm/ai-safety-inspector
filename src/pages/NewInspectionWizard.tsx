
import React from "react";
import { InspectionCreationWizard } from "@/components/inspection/InspectionCreationWizard";
import { GlobalFloatingActionButton } from "@/components/inspection/GlobalFloatingActionButton";

export default function NewInspectionWizard() {
  return (
    <>
      <InspectionCreationWizard />
      <GlobalFloatingActionButton />
    </>
  );
}
