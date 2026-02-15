/**
 * Netlify Edge Function – OG tags למוצרים
 * כשבוט (וואטסאפ, פייסבוק) מבקש /product/[id], מחזיר HTML עם meta tags מותאמים.
 * משתמש רגיל מנותב ל־/#product-[id].
 */
import * as jose from "https://esm.sh/jose@5.2.0";

const CRAWLER_UA = [
  "whatsapp",
  "facebookexternalhit",
  "facebot",
  "telegrambot",
  "twitterbot",
  "linkedinbot",
  "slurp",
  "discordbot",
  "pinterest",
  "slackbot",
];

function isCrawler(ua: string): boolean {
  const lower = (ua || "").toLowerCase();
  return CRAWLER_UA.some((bot) => lower.includes(bot));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPrice(n: number | string | null | undefined): string {
  if (n == null || n === "") return "";
  const num = typeof n === "number" ? n : parseFloat(String(n));
  if (isNaN(num)) return "";
  return num.toLocaleString("he-IL");
}

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const m = path.match(/^\/product\/([^/]+)$/);
  if (!m) return context.next();

  const id = m[1];
  const ua = request.headers.get("user-agent") || "";
  const origin = url.origin;

  // משתמש רגיל – הפניה לדף הראשי עם hash
  if (!isCrawler(ua)) {
    return Response.redirect(`${origin}/#product-${id}`, 302);
  }

  // בוט – צריך OG tags
  const defaultOgImage = `${origin}/logos/logo-bphone.png`;
  const saJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
  if (!saJson || !id) {
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>B-Phone ביפון</title><meta property="og:title" content="B-Phone תקשורת סלולרית"><meta property="og:image" content="${defaultOgImage}"><meta http-equiv="refresh" content="0;url=${origin}/"></head><body>מעביר...</body></html>`,
      { headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }

  try {
    const sa = JSON.parse(saJson);
    const { client_email, private_key, project_id } = sa;
    if (!client_email || !private_key || !project_id) throw new Error("Invalid service account");

    const key = await jose.importPKCS8(private_key, "RS256");
    const now = Math.floor(Date.now() / 1000);
    const jwt = await new jose.SignJWT({ scope: "https://www.googleapis.com/auth/datastore" })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuer(client_email)
      .setSubject(client_email)
      .setAudience("https://oauth2.googleapis.com/token")
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(key);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });
    if (!tokenRes.ok) throw new Error(`Token: ${await tokenRes.text()}`);

    const tokenData = (await tokenRes.json()) as { access_token: string };
    const fsRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${project_id}/databases/(default)/documents/products/${id}`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    if (!fsRes.ok) {
      if (fsRes.status === 404) {
        return new Response(
          `<!DOCTYPE html><html><head><meta charset="utf-8"><title>מוצר לא נמצא</title><meta http-equiv="refresh" content="0;url=${origin}/"></head><body>מעביר...</body></html>`,
          { headers: { "content-type": "text/html; charset=utf-8" } }
        );
      }
      throw new Error(`Firestore: ${fsRes.status}`);
    }

    const doc = (await fsRes.json()) as {
      fields?: Record<string, { stringValue?: string; integerValue?: string; doubleValue?: string }> & {
        images?: { arrayValue?: { values?: { stringValue?: string }[] } };
      };
    };
    const fields = doc.fields || {};
    const getStr = (k: string) => fields[k]?.stringValue ?? "";
    const getNum = (k: string) => {
      const f = fields[k];
      if (!f) return null;
      if ("integerValue" in f && f.integerValue != null) return parseInt(f.integerValue!, 10);
      if ("doubleValue" in f && f.doubleValue != null) return parseFloat(f.doubleValue!);
      return null;
    };

    const name = getStr("name") || "מוצר";
    const price = getNum("price");
    const description = getStr("description") || "";
    const imagesRaw = fields.images?.arrayValue?.values;
    const images = imagesRaw?.map((v) => v.stringValue || "").filter(Boolean) || [];
    const imageUrl = getStr("imageUrl");
    const mainImage = images[0] || imageUrl || "";

    const priceStr = price != null ? `${formatPrice(price)} ₪` : "";
    const descOg = description
      ? escapeHtml(description.slice(0, 200))
      : priceStr
        ? escapeHtml(priceStr)
        : "B-Phone ביפון – תקשורת סלולרית";
    const titleOg = escapeHtml(name);
    let imageOg = mainImage.startsWith("http") ? mainImage : mainImage ? new URL(mainImage, origin).href : "";
    if (!imageOg) imageOg = `${origin}/logos/logo-bphone.png`;

    const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${titleOg} | B-Phone ביפון</title>
  <meta name="description" content="${descOg}">
  <meta property="og:title" content="${titleOg}">
  <meta property="og:description" content="${descOg}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${origin}/product/${id}">
  <meta property="og:image" content="${escapeHtml(imageOg)}">
  <meta property="og:site_name" content="B-Phone ביפון">
  <meta http-equiv="refresh" content="0;url=${origin}/#product-${id}">
</head>
<body><p>מעביר לדף המוצר...</p></body>
</html>`;

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  } catch (e) {
    console.error("OG product error:", e);
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>B-Phone ביפון</title><meta property="og:title" content="B-Phone תקשורת סלולרית"><meta property="og:image" content="${origin}/logos/logo-bphone.png"><meta http-equiv="refresh" content="0;url=${origin}/"></head><body>מעביר...</body></html>`,
      { headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }
};
