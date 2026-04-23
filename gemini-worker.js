/**
 * Cloudflare Worker – פרוקסי ל-Gemini (חינם, בלי נקודות Netlify)
 * 
 * איך להפעיל:
 * 1. היכנס ל- https://dash.cloudflare.com → Workers & Pages → Create → Create Worker
 * 2. שם: gemini-proxy (או כל שם)
 * 3. לחץ "Deploy" ואז "Edit code"
 * 4. מחק את הקוד והדבק את כל הקובץ הזה (מהשורה export default עד הסוף)
 * 5. Settings → Variables → Add variable: GEMINI_API_KEY (Secret) – הדבק את המפתח מ-Google AI Studio
 *    אופציונלי לגיבוי חינמי נוסף: GROQ_API_KEY (Secret)
 *    אופציונלי: GROQ_MODEL (plain text), ברירת מחדל: llama-3.1-8b-instant
 * 6. Save and Deploy
 * 7. העתק את כתובת ה-Worker (כמו https://gemini-proxy.שם-החשבון.workers.dev)
 * 8. באתר (index.html) הוסף: window.GEMINI_PROXY_URL = "https://הכתובת-שלך";
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function isRetryableGeminiFailure(status, msg) {
  const m = String(msg || "").toLowerCase();
  return (
    status === 408 ||
    status === 409 ||
    status === 425 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    m.includes("high demand") ||
    m.includes("spikes in demand") ||
    m.includes("resource_exhausted") ||
    m.includes("quota") ||
    m.includes("temporarily unavailable")
  );
}

function isGeminiModelUnavailable(status, msg) {
  const m = String(msg || "").toLowerCase();
  return (
    status === 404 ||
    m.includes("is not found for api version") ||
    m.includes("not supported for generatecontent") ||
    m.includes("model not found")
  );
}

function isRetryableGroqFailure(status, msg) {
  const m = String(msg || "").toLowerCase();
  return (
    status === 408 ||
    status === 409 ||
    status === 425 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    m.includes("rate limit") ||
    m.includes("quota") ||
    m.includes("temporarily")
  );
}

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
    const groqApiKey = env.GROQ_API_KEY;
    const groqModel = env.GROQ_MODEL || "llama-3.1-8b-instant";

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

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    };
    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    try {
      const modelCandidates = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
      ];
      let lastError = null;

      for (let i = 0; i < modelCandidates.length; i++) {
        const model = modelCandidates[i];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה.";
          return new Response(JSON.stringify({ text, model }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }

        const errMsg = data.error?.message || "Gemini error";
        lastError = { status: res.status, msg: errMsg, model };
        const canTryNextModel = i < modelCandidates.length - 1;
        const retryable = isRetryableGeminiFailure(res.status, errMsg);
        const modelUnavailable = isGeminiModelUnavailable(res.status, errMsg);
        if ((retryable || modelUnavailable) && canTryNextModel) {
          continue;
        }
        if (!(retryable || modelUnavailable)) {
          return new Response(JSON.stringify({ error: errMsg, model }), {
            status: res.status,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }
      }

      // Gemini נכשל בכל המודלים: ניסיון גיבוי ל-Groq (אם הוגדר)
      if (groqApiKey) {
        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
              model: groqModel,
              temperature: 0.7,
              max_tokens: 1024,
              response_format: { type: "json_object" },
              messages: [
                ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
                { role: "user", content: prompt },
              ],
            }),
          });
          const groqData = await groqRes.json().catch(() => ({}));
          if (groqRes.ok) {
            const text = groqData?.choices?.[0]?.message?.content || "לא התקבלה תשובה.";
            return new Response(JSON.stringify({ text, model: groqModel, provider: "groq" }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...CORS },
            });
          }
          const groqErrMsg = groqData?.error?.message || "Groq error";
          const groqRetryable = isRetryableGroqFailure(groqRes.status, groqErrMsg);
          const baseErr = lastError?.msg || "Gemini overload";
          return new Response(JSON.stringify({
            error: groqRetryable ? `${baseErr} | Groq overloaded` : `${baseErr} | ${groqErrMsg}`,
            model: lastError?.model || "unknown",
            fallbackModel: groqModel,
          }), {
            status: groqRetryable ? 503 : (groqRes.status || 503),
            headers: { "Content-Type": "application/json", ...CORS },
          });
        } catch (groqErr) {
          return new Response(JSON.stringify({
            error: `${lastError?.msg || "Gemini overload"} | Groq request failed: ${String(groqErr?.message || groqErr)}`,
            model: lastError?.model || "unknown",
            fallbackModel: groqModel,
          }), {
            status: 503,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }
      }

      return new Response(JSON.stringify({
        error: lastError?.msg || "Gemini overload",
        model: lastError?.model || "unknown",
      }), {
        status: lastError?.status || 503,
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
