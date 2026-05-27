import type { FormConfig, Question, RoutingRule } from "@/lib/formBuilderTypes";
import { supabaseDelete, supabaseInsert, supabaseSelect, supabaseUpsert } from "@/lib/supabaseRest";
import { isUuidLike } from "@/lib/formBuilderValidation";

type DbForm = {
  id: string;
  property_id: string;
  slug: string;
  title: string;
  description: string | null;
  language: string;
  collect_name: boolean;
  collect_email: boolean;
  collect_room: boolean;
  expires_at: string | null;
  is_active: boolean;
  n8n_save_webhook: string | null;
  n8n_submit_webhook: string | null;
  review_link: string | null;
  gm_alert_email: string | null;
  md_alert_email: string | null;
  branding: FormConfig["branding"];
  questions?: DbQuestion[];
  routing_rules?: DbRoutingRule[];
  properties?: { name: string; whatsapp_number: string | null };
};

type DbQuestion = {
  id: string;
  form_id: string;
  type: Question["type"];
  label: string;
  placeholder: string | null;
  required: boolean;
  min_rating: number | null;
  max_rating: number | null;
  low_label: string | null;
  high_label: string | null;
  options: Question["options"];
  sort_order: number;
};

type DbRoutingRule = {
  id: string;
  form_id: string;
  question_id: string;
  condition: RoutingRule["condition"];
  value: number;
  value2: number | null;
  action: RoutingRule["action"];
  custom_message: string | null;
  priority: number;
  is_active: boolean;
};

type DbProperty = {
  id: string;
  name: string;
  entity: "Mundra Hotels & Resorts" | "Tirupati Shelters" | "RAS Resorts";
  gm_email: string;
  whatsapp_number: string | null;
  google_review_link: string | null;
  is_active: boolean;
};

export function slugForForm(form: FormConfig) {
  if (form.id && form.id !== "new") return `${form.settings.propertyId}-${form.id}`;
  return `${form.settings.propertyId}-${crypto.randomUUID()}`;
}

export function dbFormToConfig(row: DbForm): FormConfig {
  const questions = [...(row.questions ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const routingRules = [...(row.routing_rules ?? [])].sort((a, b) => a.priority - b.priority);

  return {
    id: row.id,
    slug: row.slug,
    settings: {
      title: row.title,
      description: row.description ?? "",
      propertyId: row.property_id,
      propertyName: row.properties?.name ?? row.property_id,
      language: row.language,
      collectGuestName: row.collect_name,
      collectGuestEmail: row.collect_email,
      collectGuestPhone: row.branding.collectGuestPhone ?? false,
      collectRoomNumber: row.collect_room,
      expiresAt: row.expires_at ?? "",
      isActive: row.is_active,
      n8nSubmitWebhook: row.n8n_submit_webhook ?? "",
    },
    questions: questions.map(question => ({
      id: question.id,
      type: question.type,
      label: question.label,
      placeholder: question.placeholder ?? undefined,
      required: question.required,
      options: question.options ?? [],
      minRating: question.min_rating ?? undefined,
      maxRating: question.max_rating ?? undefined,
      lowLabel: question.low_label ?? undefined,
      highLabel: question.high_label ?? undefined,
    })),
    routing: {
      enabled: routingRules.length > 0,
      rules: routingRules.map(rule => ({
        id: rule.id,
        questionId: rule.question_id,
        condition: rule.condition,
        value: rule.value,
        value2: rule.value2 ?? undefined,
        action: rule.action,
        customMessage: rule.custom_message ?? undefined,
      })),
      reviewLink: row.review_link ?? "",
      gmEmail: row.gm_alert_email ?? "",
      mdEmail: row.md_alert_email ?? "",
      whatsappNumber: row.properties?.whatsapp_number ?? "",
    },
    branding: row.branding,
  };
}

export async function getForms(query: { id?: string | null; slug?: string | null }) {
  const filters = ["select=*,properties(name,whatsapp_number),questions(*),routing_rules(*)"];
  if (query.id) filters.push(`id=eq.${encodeURIComponent(query.id)}`);
  if (query.slug) filters.push(`slug=eq.${encodeURIComponent(query.slug)}`);
  filters.push("order=created_at.desc");

  const result = await supabaseSelect<DbForm>("forms", filters.join("&"));
  if (!result.ok) return result;
  return { ...result, data: result.data.map(dbFormToConfig) };
}

export async function saveForm(form: FormConfig) {
  const id = form.id && form.id !== "new" ? form.id : crypto.randomUUID();
  const slug = form.slug || (form.id && form.id !== "new" ? `${form.settings.propertyId}-${id}` : slugForForm({ ...form, id }));

  const propertyCheck = await supabaseSelect<DbProperty>(
    "properties",
    `select=id&id=eq.${encodeURIComponent(form.settings.propertyId)}&limit=1`,
  );
  if (!propertyCheck.ok) return propertyCheck;
  if (propertyCheck.data.length === 0) {
    const propertyResult = await supabaseInsert<DbProperty>("properties", {
      id: form.settings.propertyId,
      name: form.settings.propertyName || form.settings.propertyId,
      entity: "RAS Resorts",
      gm_email: form.routing.gmEmail || "gm@treatresorts.com",
      whatsapp_number: form.routing.whatsappNumber || null,
      google_review_link: form.routing.reviewLink || null,
      is_active: true,
    });
    if (!propertyResult.ok) return propertyResult;
  }

  const formRow = {
    id,
    property_id: form.settings.propertyId,
    slug,
    title: form.settings.title,
    description: form.settings.description || null,
    language: form.settings.language || "en",
    collect_name: form.settings.collectGuestName,
    collect_email: form.settings.collectGuestEmail,
    collect_room: form.settings.collectRoomNumber,
    expires_at: form.settings.expiresAt || null,
    is_active: form.settings.isActive,
    n8n_save_webhook: null,
    n8n_submit_webhook: form.settings.n8nSubmitWebhook || null,
    review_link: form.routing.reviewLink || null,
    gm_alert_email: form.routing.gmEmail || null,
    md_alert_email: form.routing.mdEmail || null,
    branding: {
      ...form.branding,
      collectGuestPhone: form.settings.collectGuestPhone ?? false,
    },
  };

  const formResult = await supabaseUpsert<DbForm>("forms", formRow, "id");
  if (!formResult.ok) return formResult;

  await supabaseDelete("routing_rules", `form_id=eq.${id}`);

  if (form.questions.length > 0) {
    const questionRows = form.questions.map((question, index) => ({
      id: isUuidLike(question.id) ? question.id : crypto.randomUUID(),
      form_id: id,
      type: question.type,
      label: question.label,
      placeholder: question.placeholder ?? null,
      required: question.required,
      min_rating: question.minRating ?? null,
      max_rating: question.maxRating ?? null,
      low_label: question.lowLabel ?? null,
      high_label: question.highLabel ?? null,
      options: question.options ?? [],
      sort_order: index,
    }));

    const questionResult = await supabaseUpsert<DbQuestion>("questions", questionRows, "id");
    if (!questionResult.ok) return questionResult;

    const questionIdMap = new Map(form.questions.map((question, index) => [question.id, questionRows[index].id]));

    const keptQuestionIds = questionRows.map(question => question.id).join(",");
    if (keptQuestionIds) {
      const deleteResult = await supabaseDelete("questions", `form_id=eq.${id}&id=not.in.(${keptQuestionIds})`);
      if (!deleteResult.ok) return deleteResult;
    }

    const ruleRows = form.routing.rules
      .map((rule, index) => ({
        id: isUuidLike(rule.id) ? rule.id : crypto.randomUUID(),
        form_id: id,
        question_id: questionIdMap.get(rule.questionId),
        condition: rule.condition,
        value: rule.value,
        value2: rule.value2 ?? null,
        action: rule.action,
        custom_message: rule.customMessage ?? null,
        priority: index,
        is_active: form.routing.enabled,
      }))
      .filter(row => row.question_id);

    if (form.routing.enabled && ruleRows.length > 0) {
      const ruleResult = await supabaseInsert<DbRoutingRule>("routing_rules", ruleRows);
      if (!ruleResult.ok) return ruleResult;
    }
  } else {
    const deleteResult = await supabaseDelete("questions", `form_id=eq.${id}`);
    if (!deleteResult.ok) return deleteResult;
  }

  const saved = await getForms({ id });
  if (!saved.ok) return saved;
  return { ok: true as const, data: saved.data[0], status: 200 };
}
