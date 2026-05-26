export type QuestionType =
  | "text"
  | "textarea"
  | "rating"
  | "nps"
  | "select"
  | "multiselect"
  | "yesno"
  | "date"
  | "email"
  | "phone";

export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: QuestionOption[];
  minRating?: number;
  maxRating?: number;
  lowLabel?: string;
  highLabel?: string;
}

export interface RoutingRule {
  id: string;
  condition: "gte" | "lte" | "eq" | "between";
  value: number;
  value2?: number;
  action: "show_review_link" | "alert_gm" | "alert_md" | "alert_gm_md" | "custom_message";
  customMessage?: string;
  questionId: string;
}

export interface RoutingConfig {
  enabled: boolean;
  rules: RoutingRule[];
  reviewLink: string;
  gmEmail: string;
  mdEmail: string;
  whatsappNumber: string;
}

export interface BrandingConfig {
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  headerText: string;
  thankYouTitle: string;
  thankYouMessage: string;
  showPropertyName: boolean;
  fontFamily: string;
}

export interface FormSettings {
  title: string;
  description: string;
  propertyId: string;
  propertyName: string;
  language: string;
  collectGuestName: boolean;
  collectGuestEmail: boolean;
  collectRoomNumber: boolean;
  expiresAt: string;
  isActive: boolean;
}

export interface FormConfig {
  id: string;
  settings: FormSettings;
  questions: Question[];
  routing: RoutingConfig;
  branding: BrandingConfig;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
