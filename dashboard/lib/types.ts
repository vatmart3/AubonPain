/** Contrats JSON entre les routes /api/* et l'interface. Aucun secret ici. */

export interface ApiErrorBody {
  error: {
    kind: string;
    title: string;
    message: string;
    hint?: string;
  };
}

export interface StatusView {
  merchantName: string;
  merchantCode: string | null;
  currency: string;
  timeZone: string;
  keyWarning: string | null;
}

export interface TodayView {
  date: string;
  weekday: string;
  generatedAt: string;
  currency: string;
  net: number;
  sales: number;
  refunds: number;
  count: number;
  avgBasket: number;
  lastWeek: {
    date: string;
    /** Même jour la semaine dernière, jusqu'à la même heure */
    netSameTime: number;
    countSameTime: number;
    avgBasketSameTime: number;
    /** Même jour la semaine dernière, journée complète */
    netFullDay: number;
  };
  deltaPct: number | null;
  countDeltaPct: number | null;
  basketDeltaPct: number | null;
  /** Ventes par heure, de openHour à closeHour : today = heures terminées, partial = heure en cours */
  hours: { hour: number; today: number | null; partial: number | null; lastWeek: number }[];
  recent: { time: string; amount: number; kind: "sale" | "refund"; label: string }[];
}

export interface PeriodDay {
  date: string;
  label: string;
  short: string;
  net: number;
  count: number;
  prevNet: number | null;
  prevDate: string | null;
  isFuture: boolean;
  isToday: boolean;
}

export interface PeriodView {
  kind: "week" | "month";
  offset: number;
  title: string;
  subtitle: string;
  compareLabel: string;
  currency: string;
  days: PeriodDay[];
  net: number;
  prevNet: number;
  deltaPct: number | null;
  count: number;
  avgBasket: number;
  openDays: number;
  avgPerOpenDay: number;
  best: { date: string; label: string; net: number } | null;
  worst: { date: string; label: string; net: number } | null;
  canGoForward: boolean;
}

export interface AffluenceView {
  weeks: number;
  from: string;
  to: string;
  openHour: number;
  closeHour: number;
  cells: { weekday: number; hour: number; clients: number; sales: number }[];
  openDays: number[];
  peak: { weekday: number; hour: number; clients: number } | null;
  busiestDay: { weekday: number; clients: number } | null;
  currency: string;
}

export interface Coverage {
  analyzed: number;
  total: number;
  complete: boolean;
  throttled: boolean;
}

export interface ProductsView {
  range: string;
  rangeLabel: string;
  from: string;
  to: string;
  currency: string;
  coverage: Coverage;
  salesWithProducts: number;
  byQty: { name: string; qty: number; revenue: number }[];
  byRevenue: { name: string; qty: number; revenue: number }[];
  distinct: number;
}

export interface ComptaDay {
  date: string;
  count: number;
  sales: number;
  refunds: number;
  net: number;
  vat: { rate: number | null; ht: number; tva: number; ttc: number }[];
  fees: number;
}

export interface ComptaView {
  month: string;
  monthLabel: string;
  isCurrentMonth: boolean;
  currency: string;
  coverage: Coverage;
  count: number;
  sales: number;
  refunds: number;
  net: number;
  vat: { rate: number | null; ht: number; tva: number; ttc: number }[];
  totalHt: number;
  totalTva: number;
  fees: number;
  netCashed: number;
  days: ComptaDay[];
  months: { value: string; label: string }[];
}
