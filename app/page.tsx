"use client";

import { useState } from "react";

function useForm<T extends object>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  function update<K extends keyof T>(key: K, value: T[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }
  function reset() {
    setValues(initial);
  }
  return { values, update, reset };
}

async function postJson<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export default function HomePage() {
  const reg = useForm({ name: "", phone: "" });
  const msg = useForm({ phone: "", message: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setSending(true);
    try {
      const payload = {
        to: reg.values.phone,
        message: `Thanks for registering, ${reg.values.name}!`,
      };
      const res = await postJson<{ success: boolean; id?: string }>(
        "/api/whatsapp/send",
        payload,
      );
      setStatus(`Registration message sent. id=${res.id ?? "-"}`);
      reg.reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setSending(true);
    try {
      const res = await postJson<{ success: boolean; id?: string }>(
        "/api/whatsapp/send",
        { to: msg.values.phone, message: msg.values.message },
      );
      setStatus(`Message sent. id=${res.id ?? "-"}`);
      msg.reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>WhatsApp Agent</h1>
        <span className="badge mono">/api/whatsapp/send</span>
      </div>
      <p>Enter a phone number in E.164 format, e.g. <span className="mono">+15551234567</span>.</p>
      <div className="grid">
        <div className="card">
          <h2>Register and notify</h2>
          <form onSubmit={handleRegister}>
            <label htmlFor="name">Name</label>
            <input id="name" placeholder="Your name" value={reg.values.name} onChange={(e) => reg.update("name", e.target.value)} required />
            <label htmlFor="reg-phone" style={{ marginTop: 12 }}>Phone (WhatsApp)</label>
            <input id="reg-phone" placeholder="+15551234567" value={reg.values.phone} onChange={(e) => reg.update("phone", e.target.value)} required />
            <div style={{ marginTop: 12 }}>
              <button disabled={sending}>Register and Send</button>
            </div>
          </form>
        </div>
        <div className="card">
          <h2>Send custom message</h2>
          <form onSubmit={handleSend}>
            <label htmlFor="msg-phone">Phone (WhatsApp)</label>
            <input id="msg-phone" placeholder="+15551234567" value={msg.values.phone} onChange={(e) => msg.update("phone", e.target.value)} required />
            <label htmlFor="message" style={{ marginTop: 12 }}>Message</label>
            <textarea id="message" rows={5} placeholder="Type your message..." value={msg.values.message} onChange={(e) => msg.update("message", e.target.value)} required />
            <div style={{ marginTop: 12 }}>
              <button disabled={sending}>Send</button>
            </div>
          </form>
        </div>
      </div>
      <hr />
      {error && <div className="alert error">{error}</div>}
      {status && <div className="alert success">{status}</div>}
      <p><small className="muted">Server requires environment variables to actually deliver messages.</small></p>
    </div>
  );
}
