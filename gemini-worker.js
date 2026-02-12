/**
 * Cloudflare Worker – פרוקסי ל-Gemini (חינם, בלי נקודות Netlify)
 * 
 * איך להפעיל:
 * 1. היכנס ל- https://dash.cloudflare.com → Workers & Pages → Create → Create Worker
 * 2. שם: gemini-proxy (או כל שם)
 * 3. לחץ "Deploy" ואז "Edit code"
 * 4. מחק את הקוד והדבק את כל הקובץ הזה (מהשורה export default עד הסוף)
 * 5. Settings → Variables → Add variable: GEMINI_API_KEY (Secret) – הדבק את המפתח מ-Google AI Studio
 * 6. Save and Deploy
 * 7. העתק את כתובת ה-Worker (כמו https://gemini-proxy.שם-החשבון.workers.dev)
 * 8. באתר (index.html) הוסף: window.GEMINI_PROXY_URL = "https://הכתובת-שלך";
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    let prompt, systemInstruction;
    try {
      const body = await request.json();
      prompt = body.prompt || "";
      systemInstruction = body.systemInstruction || "";
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    };
    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: data.error?.message || "Gemini error" }),
          { status: res.status, headers: { "Content-Type": "application/json", ...CORS } }
        );
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה.";
      return new Response(JSON.stringify({ text }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err.message) }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }
  },
};
