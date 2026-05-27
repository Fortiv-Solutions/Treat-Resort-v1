import type {
  AnswerValue,
  FormConfig,
  Question,
  RoutingRule,
  SubmittedAnswer,
  TriggeredRoutingAction,
} from "@/lib/formBuilderTypes";

const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hexColor = /^#[0-9a-f]{6}$/i;

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: string[] };

export function isUuidLike(value: string | undefined | null) {
  return Boolean(value && uuidLike.test(value));
}

export function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export function defaultSubmitWebhook() {
  return (process.env.N8N_FORM_SUBMIT_WEBHOOK_URL || "").trim();
}

export function effectiveSubmitWebhookUrl(form: FormConfig) {
  return (form.settings.n8nSubmitWebhook || defaultSubmitWebhook()).trim();
}

export function looksLikeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeFormConfig(form: FormConfig): FormConfig {
  const questionIds = new Set(form.questions.map(question => question.id));
  const numericQuestionIds = new Set(
    form.questions
      .filter(question => question.type === "rating" || question.type === "nps")
      .map(question => question.id),
  );
  const rules = form.routing.rules.filter(rule => {
    if (!questionIds.has(rule.questionId)) return false;
    if (!numericQuestionIds.has(rule.questionId)) return false;
    return true;
  });

  return {
    ...form,
    routing: {
      ...form.routing,
      rules,
      enabled: form.routing.enabled && rules.length > 0,
    },
  };
}

export function validateFormConfig(form: FormConfig): ValidationResult<FormConfig> {
  const errors: string[] = [];

  if (!form?.settings) errors.push("Missing form settings.");
  if (!cleanText(form?.settings?.propertyId)) errors.push("Select an active property before saving this form.");
  if (!cleanText(form?.settings?.title)) errors.push("Form title is required.");
  if (!Array.isArray(form?.questions) || form.questions.length === 0) errors.push("Add at least one question before saving.");

  form?.questions?.forEach((question, index) => {
    if (!cleanText(question.label)) errors.push(`Question ${index + 1} needs a label.`);
    if ((question.type === "select" || question.type === "multiselect") && (!question.options || question.options.length === 0)) {
      errors.push(`Question ${index + 1} needs at least one option.`);
    }
    question.options?.forEach((option, optionIndex) => {
      if (!cleanText(option.label)) errors.push(`Question ${index + 1}, option ${optionIndex + 1} needs a label.`);
    });
    if (question.type === "rating" || question.type === "nps") {
      const min = question.minRating ?? (question.type === "nps" ? 0 : 1);
      const max = question.maxRating ?? (question.type === "nps" ? 10 : 5);
      if (min < 0 || max > 10 || min >= max) errors.push(`Question ${index + 1} has an invalid rating scale.`);
    }
  });

  const questionIds = new Set(form?.questions?.map(question => question.id) ?? []);
  const numericQuestionIds = new Set(
    form?.questions
      ?.filter(question => question.type === "rating" || question.type === "nps")
      .map(question => question.id) ?? [],
  );
  if (form?.routing?.enabled) {
    form.routing.rules.forEach((rule, index) => {
      if (!questionIds.has(rule.questionId)) errors.push(`Routing rule ${index + 1} points to a missing question.`);
      if (questionIds.has(rule.questionId) && !numericQuestionIds.has(rule.questionId)) {
        errors.push(`Routing rule ${index + 1} must point to a rating or NPS question.`);
      }
      if (rule.condition === "between" && (rule.value2 === undefined || rule.value > rule.value2)) {
        errors.push(`Routing rule ${index + 1} has an invalid range.`);
      }
      if (rule.action === "custom_message" && !cleanText(rule.customMessage)) {
        errors.push(`Routing rule ${index + 1} needs a custom message.`);
      }
    });
  }

  const branding = form?.branding;
  if (branding) {
    if (!hexColor.test(branding.primaryColor)) errors.push("Primary color must be a valid hex color.");
    if (!hexColor.test(branding.accentColor)) errors.push("Accent color must be a valid hex color.");
    if (!hexColor.test(branding.bgColor)) errors.push("Background color must be a valid hex color.");
  }

  const webhooks = [form?.settings?.n8nSubmitWebhook].filter(Boolean) as string[];
  webhooks.forEach(webhook => {
    if (webhook.trim() && !looksLikeHttpUrl(webhook.trim())) errors.push("Webhook URLs must start with http:// or https://.");
  });

  return errors.length ? { ok: false, errors } : { ok: true, data: form };
}

export function normalizeAnswer(question: Question, rawValue: unknown): AnswerValue {
  if (question.type === "rating" || question.type === "nps") {
    const numeric = Number(rawValue);
    return Number.isFinite(numeric) ? numeric : "";
  }
  if (question.type === "multiselect") {
    return Array.isArray(rawValue) ? rawValue.map(value => String(value)) : [];
  }
  return typeof rawValue === "string" || typeof rawValue === "number" ? rawValue : "";
}

export function validateSubmission(form: FormConfig, payload: Record<string, unknown>): ValidationResult<{
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  answers: SubmittedAnswer[];
}> {
  const errors: string[] = [];
  const answerMap = new Map<string, unknown>();
  const incoming = Array.isArray(payload.answers) ? payload.answers : [];

  incoming.forEach(item => {
    if (item && typeof item === "object" && "questionId" in item) {
      const answer = item as { questionId?: unknown; value?: unknown };
      if (typeof answer.questionId === "string") answerMap.set(answer.questionId, answer.value);
    }
  });

  const guestEmail = cleanText(payload.guestEmail);
  if (guestEmail && !emailLike.test(guestEmail)) errors.push("Enter a valid email address.");

  const answers: SubmittedAnswer[] = form.questions.map(question => {
    const value = normalizeAnswer(question, answerMap.get(question.id));
    const isEmpty = value === "" || (Array.isArray(value) && value.length === 0);

    if (question.required && isEmpty) errors.push(`${question.label} is required.`);
    if ((question.type === "rating" || question.type === "nps") && value !== "") {
      const numeric = Number(value);
      const min = question.minRating ?? (question.type === "nps" ? 0 : 1);
      const max = question.maxRating ?? (question.type === "nps" ? 10 : 5);
      if (!Number.isFinite(numeric) || numeric < min || numeric > max) errors.push(`${question.label} is outside the allowed range.`);
    }
    if (question.type === "email" && typeof value === "string" && value && !emailLike.test(value)) {
      errors.push(`${question.label} must be a valid email address.`);
    }

    return {
      questionId: question.id,
      questionLabel: question.label,
      questionType: question.type,
      value,
    };
  });

  return errors.length
    ? { ok: false, errors }
    : {
        ok: true,
        data: {
          guestName: cleanText(payload.guestName),
          guestEmail,
          guestPhone: cleanText(payload.guestPhone),
          roomNumber: cleanText(payload.roomNumber),
          answers,
        },
      };
}

function numericValue(answer: SubmittedAnswer | undefined) {
  if (!answer) return null;
  const value = Number(answer.value);
  return Number.isFinite(value) ? value : null;
}

export function evaluateRoutingRules(form: FormConfig, answers: SubmittedAnswer[]): TriggeredRoutingAction[] {
  if (!form.routing.enabled) return [];

  const byQuestion = new Map(answers.map(answer => [answer.questionId, answer]));
  const byId = new Map(form.questions.map(question => [question.id, question]));

  return form.routing.rules.flatMap((rule: RoutingRule) => {
    const answer = byQuestion.get(rule.questionId);
    const question = byId.get(rule.questionId);
    const numeric = numericValue(answer);
    if (numeric === null || !question) return [];

    const triggered =
      rule.condition === "gte" ? numeric >= rule.value :
      rule.condition === "lte" ? numeric <= rule.value :
      rule.condition === "eq" ? numeric === rule.value :
      rule.condition === "between" ? numeric >= rule.value && numeric <= (rule.value2 ?? rule.value) :
      false;

    if (!triggered) return [];

    return [{
      action: rule.action,
      triggered: true,
      questionId: rule.questionId,
      questionLabel: question.label,
      condition: rule.condition,
      value: rule.value,
      value2: rule.value2,
      answerValue: numeric,
      reason: `${question.label} answered ${numeric}, matching ${rule.condition} ${rule.value}${rule.value2 !== undefined ? `-${rule.value2}` : ""}.`,
    }];
  });
}
