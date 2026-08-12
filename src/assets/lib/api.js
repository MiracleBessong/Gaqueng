// All server-side calls go through Vercel serverless functions in /api.
// The frontend never sees the OpenAI or LiveKit secret keys.

const BASE = import.meta.env.VITE_API_BASE || "";

export async function fetchLiveKitToken(room, name) {
  const res = await fetch(`${BASE}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, name }),
  });
  if (!res.ok) throw new Error("Token fetch failed");
  const data = await res.json();
  return data.token;
}

export async function askAssistant({ question, transcript, lang, history }) {
  const res = await fetch(`${BASE}/api/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, transcript, lang, history }),
  });
  if (!res.ok) throw new Error("Assistant failed");
  const data = await res.json();
  return data.answer;
}
