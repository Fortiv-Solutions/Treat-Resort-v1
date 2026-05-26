export type DateRange = "today" | "yesterday" | "last7" | "thisMonth" | "lastMonth";
export type EntityFilter = "all" | "mundra" | "tirupati" | "ras";

export interface FinanceProperty {
  id: string;
  name: string;
  entity: "mundra" | "tirupati" | "ras";
  rooms: number;
  occ: number;
  adr: number;
  revpar: number;
  roomRev: number;
  fnbRev: number;
  eventsRev: number;
  totalRev: number;
  vsYesterday: number;
  budget: number;
  status: "on-track" | "watch" | "attention";
}

export const FINANCE_PROPERTIES: FinanceProperty[] = [];
