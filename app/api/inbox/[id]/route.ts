import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseUpdate } from "@/lib/supabaseRest";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const updatePayload: Record<string, unknown> = {};
    if (body.status !== undefined) {
      updatePayload.status = body.status;
      if (body.status === "replied") {
        updatePayload.replied_at = new Date().toISOString();
      }
    }
    if (body.assigned_to !== undefined) {
      updatePayload.assigned_to = body.assigned_to;
    }
    if (body.priority !== undefined) {
      updatePayload.priority = body.priority;
    }
    if (body.sla_breached !== undefined) {
      updatePayload.sla_breached = body.sla_breached;
    }
    if (body.internal_notes !== undefined) {
      updatePayload.internal_notes = body.internal_notes;
    }
    if (body.snoozed_until !== undefined) {
      updatePayload.snoozed_until = body.snoozed_until;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No update fields provided." }, { status: 400 });
    }

    const result = await supabaseUpdate(
      "email_threads",
      `id=eq.${encodeURIComponent(id)}`,
      updatePayload,
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, data: result.data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown inbox update error." },
      { status: 500 },
    );
  }
}
