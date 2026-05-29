import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseSelect } from "@/lib/supabaseRest";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      connected: false,
      error: "Data connection is not configured.",
    }, { status: 503 });
  }

  const result = await supabaseSelect("properties", "select=id&limit=1");
  if (!result.ok) {
    return NextResponse.json({
      connected: false,
      error: result.error,
    }, { status: result.status });
  }

  return NextResponse.json({
    connected: true,
    checkedTable: "properties",
  });
}
