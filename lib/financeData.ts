// ── Finance Module — Treat Hotels & Resorts ──────────────────────────────────

export type DateRange = "today" | "yesterday" | "last7" | "thisMonth" | "lastMonth";
export type EntityFilter = "all" | "mundra" | "tirupati" | "ras";

// ── Property data ─────────────────────────────────────────────────────────────

export interface FinanceProperty {
  id: string;
  name: string;
  entity: "mundra" | "tirupati" | "ras";
  rooms: number;
  occ: number;        // occupancy %
  adr: number;        // average daily rate
  revpar: number;     // revenue per available room
  roomRev: number;    // room revenue today
  fnbRev: number;     // F&B revenue today
  eventsRev: number;  // events revenue today
  totalRev: number;   // total revenue today
  vsYesterday: number; // % change vs yesterday
  budget: number;     // today's budget
  status: "on-track" | "watch" | "attention";
}

export const FINANCE_PROPERTIES: FinanceProperty[] = [
  {
    id: "silvassa", name: "Treat Resort Silvassa", entity: "mundra",
    rooms: 48, occ: 82, adr: 4700, revpar: 3854,
    roomRev: 107300, fnbRev: 40700, eventsRev: 25900, totalRev: 185000,
    vsYesterday: 8, budget: 175000, status: "on-track",
  },
  {
    id: "dahanu", name: "Treat Beach Resort Dahanu", entity: "mundra",
    rooms: 36, occ: 71, adr: 3800, revpar: 2698,
    roomRev: 56840, fnbRev: 21560, eventsRev: 13720, totalRev: 98000,
    vsYesterday: -5, budget: 115000, status: "watch",
  },
  {
    id: "sambhajinagar", name: "Treat Imperial Sambhajinagar", entity: "tirupati",
    rooms: 52, occ: 68, adr: 4020, revpar: 2734,
    roomRev: 82360, fnbRev: 31240, eventsRev: 19880, totalRev: 142000,
    vsYesterday: -3, budget: 163000, status: "watch",
  },
  {
    id: "jimcorbett", name: "Treat Imperial Jim Corbett", entity: "ras",
    rooms: 40, occ: 91, adr: 8580, revpar: 7808,
    roomRev: 180960, fnbRev: 68640, eventsRev: 43680, totalRev: 312000,
    vsYesterday: 15, budget: 290000, status: "on-track",
  },
  {
    id: "kumbhalgarh", name: "Treat Resort Kumbhalgarh", entity: "ras",
    rooms: 32, occ: 75, adr: 7800, revpar: 5850,
    roomRev: 108460, fnbRev: 41140, eventsRev: 26180, totalRev: 187000,
    vsYesterday: 7, budget: 180000, status: "on-track",
  },
  {
    id: "pushkar", name: "Treat Resort Pushkar", entity: "ras",
    rooms: 28, occ: 64, adr: 4970, revpar: 3181,
    roomRev: 51620, fnbRev: 19580, eventsRev: 12460, totalRev: 89000,
    vsYesterday: -8, budget: 105000, status: "watch",
  },
  {
    id: "udaipur", name: "Treat Imperial Udaipur", entity: "ras",
    rooms: 44, occ: 88, adr: 7140, revpar: 6283,
    roomRev: 160080, fnbRev: 60720, eventsRev: 38640, totalRev: 276000,
    vsYesterday: 12, budget: 255000, status: "on-track",
  },
  {
    id: "rajkot", name: "Treat Resort Rajkot", entity: "tirupati",
    rooms: 38, occ: 59, adr: 3300, revpar: 1947,
    roomRev: 42920, fnbRev: 16280, eventsRev: 10360, totalRev: 74000,
    vsYesterday: -12, budget: 96000, status: "attention",
  },
  {
    id: "pune", name: "Treat Resort Pune", entity: "mundra",
    rooms: 56, occ: 77, adr: 4580, revpar: 3527,
    roomRev: 114840, fnbRev: 43560, eventsRev: 27720, totalRev: 198000,
    vsYesterday: 5, budget: 188000, status: "on-track",
  },
  {
    id: "nashik", name: "Treat Resort Nashik", entity: "mundra",
    rooms: 34, occ: 70, adr: 4710, revpar: 3297,
    roomRev: 64960, fnbRev: 24640, eventsRev: 15680, totalRev: 112000,
    vsYesterday: 2, budget: 108000, status: "on-track",
  },
  {
    id: "surat", name: "Treat Resort Surat", entity: "mundra",
    rooms: 42, occ: 83, adr: 6430, revpar: 5337,
    roomRev: 129920, fnbRev: 49280, eventsRev: 31360, totalRev: 224000,
    vsYesterday: 9, budget: 208000, status: "on-track",
  },
  {
    id: "ahmedabad", name: "Treat Resort Ahmedabad", entity: "mundra",
    rooms: 50, occ: 74, adr: 5050, revpar: 3737,
    roomRev: 108460, fnbRev: 41140, eventsRev: 26180, totalRev: 187000,
    vsYesterday: 6, budget: 178000, status: "on-track",
  },
];

// ── KPIs ──────────────────────────────────────────────────────────────────────

export const FINANCE_KPIS = {
  totalRevenueToday: 2084000,
  vsYesterday: 12,
  vsLastWeek: 8,
  budgetToday: 1950000,
  occupancy: 75,
  occupiedRooms: 378,
  totalRooms: 504,
  occVsYesterday: 3,
  adr: 5423,
  adrVsYesterday: 2,
  adrVsLastMonth: -1,
  revpar: 4067,
  revparVsYesterday: 5,
  outstandingReceivables: 8420000,
  outstandingInvoices: 6,
  oldestOutstandingDays: 45,
  cashBankPosition: 12300000,
  cashVsYesterday: 2,
};

// ── Revenue Mix (donut chart) ─────────────────────────────────────────────────

export const REVENUE_MIX = [
  { name: "Room Revenue", value: 58, color: "#C9A96E" },
  { name: "F&B",          value: 22, color: "#1B4332" },
  { name: "Events",       value: 14, color: "#2d6a4f" },
  { name: "Adventure",    value: 4,  color: "#6B7280" },
  { name: "Other",        value: 2,  color: "#D1D5DB" },
];

// ── Revenue Trend Chart data (all values in ₹ thousands) ─────────────────────

interface TrendPoint { date: string; thisPeriod: number; lastMonth: number; budget: number; }

const MAY_LABELS = [
  "1 May","2 May","3 May","4 May","5 May","6 May","7 May",
  "8 May","9 May","10 May","11 May","12 May","13 May","14 May",
  "15 May","16 May","17 May","18 May","19 May","20 May","21 May",
  "22 May","23 May","24 May","25 May",
];

// this month (May 1–25) — solid gold line
const MAY_THIS: number[] = [
  1820,2050,2380,2290,1780,1850,1920,1960,2120,2480,
  2350,1840,1900,1980,2050,2150,2520,2410,1890,1970,
  2030,2080,2220,2560,2084,
];
// last month same period (April 1–25) — dashed navy
const APR_LAST: number[] = [
  1750,2100,1980,1680,1740,1800,1860,1980,2280,2150,
  1720,1790,1870,1940,2020,2350,2180,1780,1830,1910,
  1980,2080,2420,2200,1860,
];
// budget per day
const MAY_BUDGET: number[] = [
  1850,2200,2200,2200,1850,1850,1850,1850,2200,2200,
  2200,1850,1850,1850,1850,2200,2200,2200,1850,1850,
  1850,1850,2200,2200,2200,
];

export const THIS_MONTH_CHART: TrendPoint[] = MAY_LABELS.map((date, i) => ({
  date, thisPeriod: MAY_THIS[i] * 1000,
  lastMonth: APR_LAST[i] * 1000,
  budget: MAY_BUDGET[i] * 1000,
}));

export const LAST_7_CHART: TrendPoint[] = [
  { date: "19 May", thisPeriod: 1890000, lastMonth: 1830000, budget: 1850000 },
  { date: "20 May", thisPeriod: 1970000, lastMonth: 1910000, budget: 1850000 },
  { date: "21 May", thisPeriod: 2030000, lastMonth: 1980000, budget: 1850000 },
  { date: "22 May", thisPeriod: 2080000, lastMonth: 2080000, budget: 1850000 },
  { date: "23 May", thisPeriod: 2220000, lastMonth: 2420000, budget: 2200000 },
  { date: "24 May", thisPeriod: 2560000, lastMonth: 2200000, budget: 2200000 },
  { date: "25 May", thisPeriod: 2084000, lastMonth: 1860000, budget: 2200000 },
];

const APR_FULL_LABELS = Array.from({ length: 30 }, (_, i) => `${i + 1} Apr`);
const APR_THIS: number[] = [
  1750,2100,1980,1680,1740,1800,1860,1980,2280,2150,
  1720,1790,1870,1940,2020,2350,2180,1780,1830,1910,
  1980,2080,2420,2200,1860,1950,2010,2060,2140,2380,
];
const MAR_LAST: number[] = [
  1640,1980,1860,1590,1650,1710,1760,1880,2150,2010,
  1620,1690,1780,1850,1920,2230,2060,1680,1730,1820,
  1890,1990,2310,2090,1770,1850,1930,1970,2060,2260,
];
const APR_BUDGET: number[] = [
  1850,2200,2200,2200,1850,1850,1850,1850,2200,2200,
  2200,1850,1850,1850,1850,2200,2200,2200,1850,1850,
  1850,1850,2200,2200,1850,1850,1850,1850,2200,2200,
];

export const LAST_MONTH_CHART: TrendPoint[] = APR_FULL_LABELS.map((date, i) => ({
  date, thisPeriod: APR_THIS[i] * 1000,
  lastMonth: MAR_LAST[i] * 1000,
  budget: APR_BUDGET[i] * 1000,
}));

// today and yesterday reuse the 7-day view
export const CHART_DATA: Record<DateRange, TrendPoint[]> = {
  today:     LAST_7_CHART,
  yesterday: LAST_7_CHART,
  last7:     LAST_7_CHART,
  thisMonth: THIS_MONTH_CHART,
  lastMonth: LAST_MONTH_CHART,
};

// ── Outstanding receivables ───────────────────────────────────────────────────

export interface OutstandingClient {
  client: string;
  invoice: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: "current" | "due-soon" | "overdue" | "critical";
}

export const OUTSTANDING_CLIENTS: OutstandingClient[] = [
  { client: "Raj Enterprises",       invoice: "INV-2026-0412", amount: 1250000, dueDate: "10 Apr 2026", daysOverdue: 45, status: "critical"  },
  { client: "Sunshine Events Pvt",   invoice: "INV-2026-0428", amount: 840000,  dueDate: "24 Apr 2026", daysOverdue: 31, status: "critical"  },
  { client: "Corporate Travel Inc",  invoice: "INV-2026-0503", amount: 1560000, dueDate: "03 May 2026", daysOverdue: 22, status: "overdue"   },
  { client: "MakeMyTrip B2B",        invoice: "INV-2026-0517", amount: 1840000, dueDate: "17 May 2026", daysOverdue: 8,  status: "overdue"   },
  { client: "Government Tourism Bd",  invoice: "INV-2026-0530", amount: 2230000, dueDate: "30 May 2026", daysOverdue: -5, status: "due-soon"  },
  { client: "Tech Solutions Ltd",    invoice: "INV-2026-0609", amount: 700000,  dueDate: "09 Jun 2026", daysOverdue: -15, status: "current"  },
];

// ── Payables ──────────────────────────────────────────────────────────────────

export interface Payable {
  vendor: string;
  amount: number;
  dueDate: string;
  category: string;
}

export const PAYABLES: Payable[] = [
  { vendor: "Savoy Laundry Services",  amount: 280000,  dueDate: "01 Jun 2026", category: "Laundry"        },
  { vendor: "Fresh Farms Supplier",    amount: 420000,  dueDate: "28 May 2026", category: "Food Supplier"  },
  { vendor: "MakeMyTrip Commission",   amount: 385000,  dueDate: "30 May 2026", category: "OTA Commission" },
  { vendor: "HVAC Maintenance Co",     amount: 165000,  dueDate: "05 Jun 2026", category: "Maintenance"    },
  { vendor: "Maharashtra Electricity", amount: 245000,  dueDate: "31 May 2026", category: "Utilities"      },
];

// ── Expense vs Revenue ────────────────────────────────────────────────────────

export const EXPENSE_DATA = [
  { category: "Rooms",    revenue: 1208720, expense: 362616,  margin: 70 },
  { category: "F&B",      revenue: 458480,  expense: 321936,  margin: 30 },
  { category: "Events",   revenue: 291760,  expense: 204232,  margin: 30 },
  { category: "Adventure",revenue: 83360,   expense: 50016,   margin: 40 },
  { category: "Overall",  revenue: 2084000, expense: 1042000, margin: 50 },
];

// ── OTA tracker ──────────────────────────────────────────────────────────────

export const OTA_DATA = [
  { platform: "MakeMyTrip",  bookings: 387, revenue: 18500000, commissionPct: 15, commission: 2775000 },
  { platform: "Booking.com", bookings: 298, revenue: 14200000, commissionPct: 18, commission: 2556000 },
  { platform: "Goibibo",     bookings: 156, revenue: 7400000,  commissionPct: 14, commission: 1036000 },
  { platform: "Airbnb",      bookings: 87,  revenue: 6200000,  commissionPct: 16, commission: 992000  },
  { platform: "Direct",      bookings: 423, revenue: 22300000, commissionPct: 0,  commission: 0       },
];

// ── Sales email feed ──────────────────────────────────────────────────────────

export const SALES_EMAILS = [
  { date: "25 May 2026  7:43 AM", attachment: "Tally_Daily_Report_25May2026.xlsx", status: "processed" as const, properties: 12 },
  { date: "24 May 2026  7:51 AM", attachment: "Tally_Daily_Report_24May2026.xlsx", status: "processed" as const, properties: 12 },
  { date: "23 May 2026  7:38 AM", attachment: "Tally_Daily_Report_23May2026.xlsx", status: "processed" as const, properties: 12 },
  { date: "22 May 2026  7:45 AM", attachment: "Tally_Daily_Report_22May2026.xlsx", status: "processed" as const, properties: 12 },
  { date: "21 May 2026  8:02 AM", attachment: "Tally_Daily_Report_21May2026.xlsx", status: "processed" as const, properties: 11 },
  { date: "20 May 2026  7:29 AM", attachment: "Tally_Daily_Report_20May2026.xlsx", status: "processed" as const, properties: 12 },
  { date: "19 May 2026  7:55 AM", attachment: "Tally_Daily_Report_19May2026.xlsx", status: "processed" as const, properties: 12 },
];

// ── Unit types breakdown ──────────────────────────────────────────────────────

export const UNIT_TYPES = [
  { type: "Deluxe Room",     total: 280, occupied: 218, avgRate: 3200,  revenue: 697600,  vsYesterday: 4  },
  { type: "Premium Room",    total: 112, occupied: 90,  avgRate: 5800,  revenue: 522000,  vsYesterday: 6  },
  { type: "Suite",           total: 56,  occupied: 48,  avgRate: 9500,  revenue: 456000,  vsYesterday: 8  },
  { type: "Executive Suite", total: 28,  occupied: 14,  avgRate: 14500, revenue: 203000,  vsYesterday: -2 },
  { type: "Villa",           total: 16,  occupied: 14,  avgRate: 18000, revenue: 252000,  vsYesterday: 12 },
  { type: "Cottage",         total: 8,   occupied: 6,   avgRate: 12000, revenue: 72000,   vsYesterday: 0  },
  { type: "Tent / Camp",     total: 4,   occupied: 4,   avgRate: 8500,  revenue: 34000,   vsYesterday: 5  },
];

export const ENTITY_LABELS: Record<string, string> = {
  all:      "All Entities",
  mundra:   "Mundra Hotels & Resorts",
  tirupati: "Tirupati Shelters",
  ras:      "RAS Resorts",
};
