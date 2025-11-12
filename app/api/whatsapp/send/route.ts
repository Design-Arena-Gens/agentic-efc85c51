import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Env = z.object({
  WHATSAPP_TOKEN: z.string().min(1).optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).optional(),
});

const Body = z.object({
  to: z.string().regex(/^\+?[1-9]\d{7,14}$/),
  message: z.string().min(1).max(1024),
});

export async function POST(req: NextRequest) {
  const env = Env.parse({
    WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  });

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { to, message } = parsed.data;

  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Server is not configured for WhatsApp. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID.",
      },
      { status: 501 },
    );
  }

  const url = `https://graph.facebook.com/v19.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: to.replace(/^\+/, ""),
    type: "text",
    text: { body: message },
  } as const;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(
      { success: false, error: data?.error || data || "Send failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, id: data?.messages?.[0]?.id });
}
