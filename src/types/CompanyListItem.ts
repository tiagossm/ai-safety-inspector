
import { Company } from "./company";

/**
 * A simplified company type used in dropdown selectors and lists
 * Contains only the essential information needed for displaying in lists
 */
export type CompanyListItem = {
  id: string;
  fantasy_name: string | null;
};
