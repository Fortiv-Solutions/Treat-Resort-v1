import type { QuestionType, FormConfig } from "./formBuilderTypes";

export const FORM_PROPERTIES = [
  { id: "silvassa",      name: "Treat Resort Silvassa" },
  { id: "dahanu",        name: "Treat Beach Resort Dahanu" },
  { id: "kumbhalgarh",  name: "Treat Resort Kumbhalgarh" },
  { id: "sambhajinagar",name: "Treat Imperial Sambhajinagar" },
  { id: "jimcorbett",   name: "Treat Imperial Jim Corbett" },
  { id: "pushkar",      name: "Treat Resort Pushkar" },
  { id: "udaipur",      name: "Treat Imperial Udaipur" },
  { id: "rajkot",       name: "Treat Resort Rajkot" },
  { id: "pune",         name: "Treat Resort Pune" },
  { id: "nashik",       name: "Treat Resort Nashik" },
  { id: "surat",        name: "Treat Resort Surat" },
  { id: "ahmedabad",    name: "Treat Resort Ahmedabad" },
];

export const GM_EMAILS: Record<string, string> = {
  silvassa:      "gm.silvassa@treatresorts.com",
  dahanu:        "gm.dahanu@treatresorts.com",
  kumbhalgarh:   "gm.kumbhalgarh@treatresorts.com",
  sambhajinagar: "gm.sambhajinagar@treatresorts.com",
  jimcorbett:    "gm.jimcorbett@treatresorts.com",
  pushkar:       "gm.pushkar@treatresorts.com",
  udaipur:       "gm.udaipur@treatresorts.com",
  rajkot:        "gm.rajkot@treatresorts.com",
  pune:          "gm.pune@treatresorts.com",
  nashik:        "gm.nashik@treatresorts.com",
  surat:         "gm.surat@treatresorts.com",
  ahmedabad:     "gm.ahmedabad@treatresorts.com",
};

export interface QuestionTypeMeta {
  label: string;
  description: string;
  icon: string;
  defaultLabel: string;
}

export const QUESTION_TYPE_META: Record<QuestionType, QuestionTypeMeta> = {
  rating:      { label: "Star Rating",       description: "1–5 star scale",            icon: "★",  defaultLabel: "Overall Experience" },
  nps:         { label: "NPS Score",         description: "0–10 likelihood scale",     icon: "◉",  defaultLabel: "Would you recommend us?" },
  text:        { label: "Short Text",        description: "Single line answer",        icon: "T",  defaultLabel: "What did you enjoy most?" },
  textarea:    { label: "Long Text",         description: "Multi-line answer",         icon: "¶",  defaultLabel: "Please share your detailed feedback" },
  select:      { label: "Dropdown",          description: "Single choice from list",   icon: "▾",  defaultLabel: "Which service did you use?" },
  multiselect: { label: "Multi Select",      description: "Multiple choices from list",icon: "☑",  defaultLabel: "Which amenities did you use?" },
  yesno:       { label: "Yes / No",          description: "Binary choice",             icon: "±",  defaultLabel: "Would you visit again?" },
  date:        { label: "Date",              description: "Date picker",               icon: "□",  defaultLabel: "Date of visit" },
  email:       { label: "Email",             description: "Email address input",       icon: "@",  defaultLabel: "Your email address" },
  phone:       { label: "Phone",             description: "Phone number input",        icon: "✆",  defaultLabel: "Your contact number" },
};

export const DEFAULT_FORM: FormConfig = {
  id: "new",
  settings: {
    title: "Tell Us About Your Stay",
    description: "Your feedback helps us deliver an exceptional experience for every guest.",
    propertyId: "silvassa",
    propertyName: "Treat Resort Silvassa",
    language: "English",
    collectGuestName: true,
    collectGuestEmail: true,
    collectRoomNumber: true,
    expiresAt: "",
    isActive: true,
    n8nSaveWebhook: "",
    n8nSubmitWebhook: "",
  },
  questions: [
    {
      id: "q1",
      type: "rating",
      label: "How would you rate your overall stay?",
      required: true,
      minRating: 1,
      maxRating: 5,
      lowLabel: "Poor",
      highLabel: "Excellent",
    },
    {
      id: "q2",
      type: "rating",
      label: "How was the cleanliness of your room?",
      required: true,
      minRating: 1,
      maxRating: 5,
      lowLabel: "Poor",
      highLabel: "Excellent",
    },
    {
      id: "q3",
      type: "rating",
      label: "How would you rate our staff's hospitality?",
      required: true,
      minRating: 1,
      maxRating: 5,
      lowLabel: "Unfriendly",
      highLabel: "Outstanding",
    },
    {
      id: "q4",
      type: "textarea",
      label: "What did you enjoy most about your stay?",
      placeholder: "Tell us what made your experience memorable…",
      required: false,
    },
    {
      id: "q5",
      type: "textarea",
      label: "Is there anything we could have done better?",
      placeholder: "Your suggestions help us improve…",
      required: false,
    },
    {
      id: "q6",
      type: "yesno",
      label: "Would you recommend Treat Resorts to friends and family?",
      required: true,
    },
  ],
  routing: {
    enabled: true,
    rules: [
      {
        id: "r1",
        condition: "gte",
        value: 4,
        action: "show_review_link",
        questionId: "q1",
      },
      {
        id: "r2",
        condition: "lte",
        value: 3,
        action: "alert_gm_md",
        questionId: "q1",
      },
    ],
    reviewLink: "",
    gmEmail: "gm.silvassa@treatresorts.com",
    mdEmail: "md@treatresorts.com",
    whatsappNumber: "",
  },
  branding: {
    logoUrl: "",
    primaryColor: "#1B4332",
    accentColor: "#C9A96E",
    bgColor: "#FAF8F5",
    headerText: "Treat Hotels & Resorts",
    thankYouTitle: "Thank You for Your Feedback!",
    thankYouMessage: "Your experience matters deeply to us. We look forward to welcoming you again.",
    showPropertyName: true,
    fontFamily: "Inter",
  },
};
