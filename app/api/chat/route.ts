import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

function getResumeText(): string {
  try {
    return readFileSync(join(process.cwd(), "public", "resume.txt"), "utf-8");
  } catch {
    return "";
  }
}

const RESUME_TEXT = getResumeText();

const SYSTEM_PROMPT = `You are Krishna Sahu's personal AI assistant on his portfolio website at krishnasahu.in. You speak warmly, confidently, and conversationally — always in first person AS Krishna.

Here is Krishna's full background:
---
${RESUME_TEXT}
---

IMPORTANT RULES — follow all of these exactly:

1. TARGET ROLE: Krishna is looking for ONE role only — Technical Project Manager. Never mention Tech Lead or Senior Frontend Engineer as target roles.

2. OFF-TOPIC: If asked anything not related to Krishna (general coding help, trivia, writing, etc.), redirect warmly: "I'm here to answer questions about Krishna — feel free to ask about his experience, projects, or how to reach him! 😊". EXCEPTION: Questions about how this chatbot or site is built are fair game — answer those directly (see rule 7).

3. WORK / PROJECTS / EXPERIENCE: When asked about work, projects, experience, or portfolio — answer using BOTH his resume experience (Accenture, Godrej Infotech, etc.) AND his DvlprStudio projects. Always include the link: dvlprstudio.com and mention specific live projects: SharkTank.rocks, PM Pathfinder, Management Explained.

4. RESUME / CV: When asked for resume or CV — say: "You can download my resume directly from my portfolio at krishnasahu.in — there's a Download Resume button right on the homepage! 📄"

5. SALARY / COMPENSATION / PACKAGE / CTC: When asked about salary expectations or compensation — respond warmly: "Compensation is always open to discussion based on the role, company, and responsibilities. I'd love to connect and have that conversation directly! Reach out on LinkedIn: linkedin.com/in/krishna-tpm or drop me a mail at krishnasahu.pm@gmail.com 🤝"

6. HIRING / WHY HIRE YOU: When asked why hire you or what makes you good — pitch Krishna specifically as a Technical Project Manager. Highlight: 8+ years bridging engineering and delivery, end-to-end ownership from architecture to deployment, cross-functional team leadership (design/backend/content/DB teams), deep technical understanding that lets him unblock engineers and manage stakeholders equally well. Give the Godrej Infotech example: MVP in 2 weeks, beta in 6 months. End with: "If you need a TPM who actually gets the tech — let's talk: linkedin.com/in/krishna-tpm or krishnasahu.pm@gmail.com 🚀"

7. TECH STACK / THIS SITE / HOW IS THIS CHATBOT BUILT: Answer directly and honestly. This portfolio is built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. The chatbot uses the Groq with a custom system prompt. Then add naturally: "If you're building something and need a Technical Project Manager who can own delivery end-to-end — connect with me: linkedin.com/in/krishna-tpm 🚀"

8. CONTACT: Always offer krishnasahu.pm@gmail.com and linkedin.com/in/krishna-tpm when relevant.

9. LENGTH: Keep answers to 2-4 sentences unless a detailed breakdown is clearly needed. Be human and warm, not robotic or listy.`;

// Detect question topic from user message
function detectTopic(message: string): string {
  const m = message.toLowerCase();
  if (/salary|ctc|compensation|package|pay|lpa/.test(m)) return "salary";
  if (/hire|why you|why krishna|fit|suit|good for/.test(m)) return "hiring";
  if (/project|work|portfolio|built|dvlpr|sharktank|pathfinder/.test(m))
    return "projects";
  if (/stack|tech|built|next|react|groq|chatbot|how is this/.test(m))
    return "tech_stack";
  if (/resume|cv|download/.test(m)) return "resume";
  if (/contact|email|linkedin|reach|connect/.test(m)) return "contact";
  if (/experience|background|career|history|work at/.test(m))
    return "experience";
  if (/skill|know|expertise|good at/.test(m)) return "skills";
  if (/open|available|looking|job|role|position/.test(m)) return "availability";
  return "general";
}

// Parse browser, OS, device from User-Agent
function parseUserAgent(ua: string): {
  browser: string;
  os: string;
  device: string;
} {
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Unknown";

  const os = /Windows NT/.test(ua)
    ? "Windows"
    : /Mac OS X/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Unknown";

  const device = /Mobile|Android|iPhone/.test(ua)
    ? "Mobile"
    : /iPad|Tablet/.test(ua)
      ? "Tablet"
      : "Desktop";

  return { browser, os, device };
}

// Fire-and-forget Supabase logger
async function logToSupabase(payload: Record<string, unknown>) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error("⚠️ Supabase: missing URL or KEY", {
      url: !!url,
      key: !!key,
    });
    return;
  }

  try {
    const res = await fetch(`${url}/rest/v1/chat_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("⚠️ Supabase insert failed:", res.status, err);
    } else {
      console.log(
        "✅ Supabase logged:",
        payload.question_topic,
        "|",
        payload.country,
        "|",
        payload.device,
      );
    }
  } catch (err) {
    console.error("⚠️ Supabase log error:", err);
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { messages, sessionId, messageCount, usedSuggestion } =
      await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("❌ GROQ_API_KEY is missing");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    // Extract request metadata
    const ua = req.headers.get("user-agent") ?? "";
    const { browser, os, device } = parseUserAgent(ua);
    const country =
      req.headers.get("x-vercel-ip-country") ??
      req.headers.get("cf-ipcountry") ??
      null;
    const city = req.headers.get("x-vercel-ip-city") ?? null;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const referrer = req.headers.get("referer") ?? null;
    const userMessage = messages[messages.length - 1]?.content ?? "";
    const topic = detectTopic(userMessage);
    const isFirstMessage = messageCount === 1;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1024,
          temperature: 0.7,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Groq API error:", JSON.stringify(error, null, 2));
      return NextResponse.json({ error: "Groq API failed" }, { status: 500 });
    }

    const data = await response.json();
    const text =
      data.choices?.[0]?.message?.content ??
      "Sorry, I couldn't generate a response.";
    const responseTimeMs = Date.now() - startTime;

    // Log everything to Supabase in background
    logToSupabase({
      user_message: userMessage,
      ai_response: text,
      session_id: sessionId ?? "unknown",
      country,
      city,
      device,
      browser,
      os,
      referrer,
      ip,
      user_agent: ua,
      message_count: messageCount ?? 1,
      response_time_ms: responseTimeMs,
      is_first_message: isFirstMessage,
      used_suggestion: usedSuggestion ?? false,
      question_topic: topic,
    });

    return NextResponse.json({ message: text });
  } catch (err) {
    console.error("❌ Chat route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
