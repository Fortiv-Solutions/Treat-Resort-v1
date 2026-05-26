import { NextResponse } from "next/server";
import type { FormConfig } from "@/lib/formBuilderTypes";
import { getForms, saveForm } from "@/lib/formPersistence";
import { isSupabaseConfigured } from "@/lib/supabaseRest";

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");
  const result = await getForms({ id, slug });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (id || slug) {
    const form = result.data[0];
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });
    return NextResponse.json(form);
  }

  return NextResponse.json(result.data);
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const form: FormConfig = await req.json();
    if (!form?.settings) {
      return NextResponse.json({ error: "Invalid form configuration payload" }, { status: 400 });
    }
    if (!form.settings.propertyId) {
      return NextResponse.json({ error: "Select an active property before saving this form." }, { status: 400 });
    }

    const saved = await saveForm(form);
    if (!saved.ok) {
      return NextResponse.json({ error: saved.error }, { status: saved.status });
    }

    const webhookUrl = saved.data.settings.n8nSaveWebhook;
    let n8nSuccess = false;
    let n8nMessage = "No webhook configured";

    if (webhookUrl && webhookUrl.trim().startsWith("http")) {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "form_saved",
            timestamp: new Date().toISOString(),
            form: saved.data,
          }),
        });
        n8nSuccess = response.ok;
        n8nMessage = response.ok
          ? "Form forwarded to n8n successfully"
          : `n8n webhook returned status ${response.status}`;
      } catch (error) {
        n8nMessage = `Failed to contact n8n: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }

    return NextResponse.json({
      success: true,
      form: saved.data,
      n8n: { success: n8nSuccess, message: n8nMessage },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown form save error." },
      { status: 500 },
    );
  }
}
