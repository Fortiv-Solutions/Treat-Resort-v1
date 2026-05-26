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

export async function POST(req: Request) {
  try {
    const submission = await req.json();
    const { formId, guestName, guestEmail, roomNumber, answers, routingActions } = submission;

    if (!formId) {
      return NextResponse.json({ error: "Missing formId in submission" }, { status: 400 });
    }

    const db = readDb();
    const form: FormConfig = db.forms.find((f: FormConfig) => f.id === formId);

    // Save the submission details locally in our JSON store
    const fullSubmission = {
      id: `s-${Math.random().toString(36).substring(2, 9)}`,
      formId,
      propertyName: form?.settings.propertyName ?? "Unknown Property",
      propertyId: form?.settings.propertyId ?? "unknown",
      guestName: guestName || "Anonymous",
      guestEmail: guestEmail || "",
      roomNumber: roomNumber || "",
      answers: answers || [],
      routingActions: routingActions || [],
      timestamp: new Date().toISOString(),
    };

    db.submissions.push(fullSubmission);
    writeDb(db);

    // If there is an n8nSubmitWebhook configured on this form, forward it!
    const webhookUrl = form?.settings.n8nSubmitWebhook;
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
            event: "guest_feedback_submitted",
            ...fullSubmission,
          }),
        });
        n8nSuccess = response.ok;
        n8nMessage = response.ok 
          ? "Feedback forwarded to n8n successfully" 
          : `n8n webhook returned status ${response.status}`;
      } catch (err: any) {
        n8nMessage = `Failed to contact n8n webhook: ${err.message}`;
        console.error("n8n Submit webhook trigger failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      submissionId: fullSubmission.id,
      n8n: {
        success: n8nSuccess,
        message: n8nMessage,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
