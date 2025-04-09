
import { checklistFetchService } from "./checklistFetchService";
import { checklistStatusService } from "./checklistStatusService";
import { checklistCreateService } from "./checklistCreateService";
import { checklistDeleteService } from "./checklistDeleteService";

// Re-export all services from a single entry point for backward compatibility
export const checklistService = {
  ...checklistFetchService,
  ...checklistStatusService,
  ...checklistCreateService,
  ...checklistDeleteService
};

