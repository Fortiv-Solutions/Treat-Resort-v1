import { NextResponse } from "next/server";
import { getForms } from "@/lib/formPersistence";
import type { SubmittedAnswer } from "@/lib/formBuilderTypes";
import { isSupabaseConfigured, supabaseInsert } from "@/lib/supabaseRest";
import { effectiveSubmitWebhookUrl, evaluateRoutingRules, validateSubmission } from "@/lib/formBuilderValidation";

function numericAnswer(answer: SubmittedAnswer | undefined) {
  if (!answer) return null;
  const parsed = Number(answer.value);
  return Number.isFinite(parsed) ? parsed : null;
}

function answerRow(submissionId: string, answer: SubmittedAnswer) {
  const isArray = Array.isArray(answer.value);
  const numeric = typeof answer.value === "number" || (typeof answer.value === "string" && answer.value.trim() !== "" && Number.isFinite(Number(answer.value)))
    ? Number(answer.value)
    : null;

  return {
    submission_id: submissionId,
    question_id: answer.questionId,
    question_type: answer.questionType,
    text_value: isArray || numeric !== null ? null : String(answer.value ?? ""),
    numeric_value: numeric,
    array_value: isArray ? answer.value : [],
  };
}

function isInactiveOrExpired(expiresAt: string, isActive: boolean) {
  if (!isActive) return true;
  if (!expiresAt) return false;
  const parsed = new Date(expiresAt);
  return Number.isFinite(parsed.getTime()) && parsed.getTime() < Date.now();
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const submission = await req.json() as Record<string, unknown>;
    const formId = typeof submission.formId === "string" ? submission.formId : "";

    if (!formId) {
      return NextResponse.json({ error: "Missing formId in submission" }, { status: 400 });
    }

    const formResult = await getForms({ id: formId });
    if (!formResult.ok) {
      return NextResponse.json({ error: formResult.error }, { status: formResult.status });
    }

    const form = formResult.data[0];
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (isInactiveOrExpired(form.settings.expiresAt, form.settings.isActive)) {
      return NextResponse.json({ error: "This form is no longer accepting responses." }, { status: 410 });
    }

    const validated = validateSubmission(form, submission);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.errors.join(" ") }, { status: 400 });
    }

    const { guestName, guestEmail, guestPhone, roomNumber, answers: submittedAnswers } = validated.data;
    const routingActions = evaluateRoutingRules(form, submittedAnswers);
    const overall = numericAnswer(submittedAnswers.find(answer => answer.questionType === "rating"));
    const nps = numericAnswer(submittedAnswers.find(answer => answer.questionType === "nps"));
    const reviewLinkShown = routingActions.some(action => action.action === "show_review_link");

    const insertedSubmission = await supabaseInsert<{ id: string }>("submissions", {
      form_id: form.id,
      property_id: form.settings.propertyId,
      idempotency_key: crypto.randomUUID(),
      guest_name: guestName || "Anonymous",
      guest_email: guestEmail || null,
      guest_phone: guestPhone || null,
      room_number: roomNumber || null,
      overall_rating: overall,
      nps_score: nps,
      routing_actions_triggered: routingActions,
      review_link_shown: reviewLinkShown,
    });

    if (!insertedSubmission.ok) {
      return NextResponse.json({ error: insertedSubmission.error }, { status: insertedSubmission.status });
    }

    const submissionId = insertedSubmission.data[0]?.id;
    if (!submissionId) {
      return NextResponse.json({ error: "Submission insert did not return an id." }, { status: 500 });
    }

    if (submittedAnswers.length > 0) {
      const answerInsert = await supabaseInsert("guest_answers", submittedAnswers.map(answer => answerRow(submissionId, answer)));
      if (!answerInsert.ok) {
        return NextResponse.json({ error: answerInsert.error }, { status: answerInsert.status });
      }
    }

    const webhookUrl = effectiveSubmitWebhookUrl(form);
    let n8nSuccess = false;
    let n8nMessage = "No webhook configured";

    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "guest_feedback_submitted",
            submissionId,
            formId: form.id,
            propertyId: form.settings.propertyId,
            propertyName: form.settings.propertyName,
            guestName: guestName || "Anonymous",
            guestEmail,
            guestPhone,
            roomNumber,
            answers: submittedAnswers,
            routingActions,
            timestamp: new Date().toISOString(),
          }),
        });
        n8nSuccess = response.ok;
        n8nMessage = response.ok
          ? "Feedback forwarded to n8n successfully"
          : `n8n webhook returned status ${response.status}`;
      } catch (error) {
        n8nMessage = `Failed to contact n8n webhook: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }

    return NextResponse.json({
      success: true,
      submissionId,
      n8n: { success: n8nSuccess, message: n8nMessage },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown submission error." },
      { status: 500 },
    );
  }
}
