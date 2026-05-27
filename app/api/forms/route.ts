import { NextResponse } from "next/server";
import type { FormConfig } from "@/lib/formBuilderTypes";
import { getForms, saveForm } from "@/lib/formPersistence";
import { isSupabaseConfigured } from "@/lib/supabaseRest";
import { sanitizeFormConfig, validateFormConfig } from "@/lib/formBuilderValidation";

function isUnavailableForGuest(form: FormConfig) {
  if (!form.settings.isActive) return true;
  if (!form.settings.expiresAt) return false;
  const expiresAt = new Date(form.settings.expiresAt);
  return Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() < Date.now();
}

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
    if (slug && isUnavailableForGuest(form)) {
      return NextResponse.json({ error: "Form is inactive or expired" }, { status: 404 });
    }
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

    const sanitized = sanitizeFormConfig(form);
    const validated = validateFormConfig(sanitized);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.errors.join(" ") }, { status: 400 });
    }

    const saved = await saveForm(validated.data);
    if (!saved.ok) {
      return NextResponse.json({ error: saved.error }, { status: saved.status });
    }

    return NextResponse.json({
      success: true,
      form: saved.data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown form save error." },
      { status: 500 },
    );
  }
}
