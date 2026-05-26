import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { FormConfig } from "@/lib/formBuilderTypes";

const DB_PATH = path.join(process.cwd(), "lib", "db", "forms-db.json");

function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { forms: [], submissions: [] };
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to read local DB:", error);
    return { forms: [], submissions: [] };
  }
}

function writeDb(data: any) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write local DB:", error);
    return false;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const db = readDb();

    if (id) {
      const form = db.forms.find((f: FormConfig) => f.id === id);
      if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });
      return NextResponse.json(form);
    }

    if (slug) {
      const form = db.forms.find((f: FormConfig) => `${f.settings.propertyId}-${f.id}` === slug);
      if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });
      return NextResponse.json(form);
    }

    return NextResponse.json(db.forms);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const form: FormConfig = await req.json();
    if (!form || !form.settings) {
      return NextResponse.json({ error: "Invalid form configuration payload" }, { status: 400 });
    }

    const db = readDb();
    
    // Generate a unique ID if it's a new form
    if (form.id === "new" || !form.id) {
      form.id = Math.random().toString(36).substring(2, 9);
    }

    // Check if form already exists
    const index = db.forms.findIndex((f: FormConfig) => f.id === form.id);
    if (index >= 0) {
      db.forms[index] = form;
    } else {
      db.forms.push(form);
    }

    const success = writeDb(db);
    if (!success) {
      return NextResponse.json({ error: "Failed to persist form details locally" }, { status: 500 });
    }

    // Forward to n8n webhook if configured
    const webhookUrl = form.settings.n8nSaveWebhook;
    let n8nSuccess = false;
    let n8nMessage = "No webhook configured";

    if (webhookUrl && webhookUrl.trim().startsWith("http")) {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event: "form_saved",
            timestamp: new Date().toISOString(),
            form,
          }),
        });
        n8nSuccess = response.ok;
        n8nMessage = response.ok 
          ? "Form forwarded to n8n successfully" 
          : `n8n webhook returned status ${response.status}`;
      } catch (err: any) {
        n8nMessage = `Failed to contact n8n: ${err.message}`;
        console.error("n8n Save webhook trigger failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      form,
      n8n: {
        success: n8nSuccess,
        message: n8nMessage,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
