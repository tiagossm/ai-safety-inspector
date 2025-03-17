
import { Company } from "./company";

/**
 * A simplified company type used in dropdown selectors and lists
 * Contains only the essential information needed for displaying in lists
 */
export type CompanyListItem = Pick<Company, 'id' | 'fantasy_name'>;
