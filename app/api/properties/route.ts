import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseSelect } from "@/lib/supabaseRest";

type PropertyOption = {
  id: string;
  name: string;
  gm_email: string;
  whatsapp_number: string | null;
  google_review_link: string | null;
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  const result = await supabaseSelect<PropertyOption>(
    "properties",
    "select=id,name,gm_email,whatsapp_number,google_review_link&is_active=eq.true&order=name.asc",
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
