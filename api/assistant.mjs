export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  const { question, transcript, lang, history } = req.body;
  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: "GROQ_API_KEY missing" });

  const langName =
    {
      en: "English",
      fr: "French",
      es: "Spanish",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      yo: "Yoruba",
      ha: "Hausa",
      ig: "Igbo",
      ko: "Korean",
      ar: "Arabic",
      zh: "Chinese",
      ja: "Japanese",
      ru: "Russian",
      hi: "Hindi",
    }[lang] || "English";

  const sys = `You are a helpful assistant inside a live translated meeting call.
You can answer questions about the meeting (using the transcript below)
AND general knowledge questions (facts, explanations, how-tos, language help).

RULES:
- Always answer in ${langName}, in plain prose.
- Keep answers under 120 words unless the user explicitly asks for more.
- If the question is about the meeting, use the transcript.
- If the question is general knowledge, ignore the transcript and answer directly.
- If asked for questions to ask, give 3 short, relevant questions.
- If asked to summarize, summarize the transcript concisely.
- If the transcript is empty AND the question is about the meeting, say you have nothing yet.

TRANSCRIPT (may be empty):
${transcript || "(no transcript yet)"}`;

  const messages = [{ role: "system", content: sys }];
  (history || []).forEach((h) => {
    messages.push({ role: "user", content: h.q });
    messages.push({ role: "assistant", content: h.a });
  });
  messages.push({ role: "user", content: question });

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 300,
        temperature: 0.5,
      }),
    });
    const data = await r.json();
    const answer =
      data.choices?.[0]?.message?.content?.trim() || "I have no answer.";
    res.json({ answer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
