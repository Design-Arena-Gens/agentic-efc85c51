import { NextRequest, NextResponse } from "next/server";

// Minimal webhook to support Meta verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && challenge) {
    if (token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse("Forbidden", { status: 403 });
  }
  return NextResponse.json({ status: "ok" });
}

export async function POST(req: NextRequest) {
  // No-op: acknowledge incoming webhook events.
  return NextResponse.json({ received: true });
}
