import { todayISO, startOfWeek, overallAverage } from '../utils/helpers';

export function getApiKey() {
  const local = typeof localStorage !== 'undefined' ? localStorage.getItem('senior_os_gemini_key') : null;
  if (local && local.trim()) return local.trim();
  const envKey = import.meta.env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  return '';
}

export function setApiKey(key) {
  if (typeof localStorage !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('senior_os_gemini_key', key.trim());
    } else {
      localStorage.removeItem('senior_os_gemini_key');
    }
  }
}

export function buildContext(data) {
  const today = todayISO();
  const dueHomework =
    data.homework
      .filter((h) => h.status !== 'completed')
      .map(
        (h) =>
          `${h.name} (${h.subject}, due ${h.dueDate}, priority ${h.priority})`
      )
      .join('; ') || 'None right now';
  const exams =
    data.exams
      .map((e) => `${e.name} (${e.subject}, date: ${e.date}, prep: ${e.prepPercent || 0}%)`)
      .join('; ') || 'None scheduled';
  const avg = overallAverage(data.grades);
  const weekMins = data.study
    .filter((s) => s.date >= startOfWeek(today))
    .reduce((a, s) => a + Number(s.durationMinutes || 0), 0);
  const ielts = data.ielts;

  return `Today's Date: ${today}.
Student Name: ${data.settings?.name || 'Yassin'} (Grade 12 / Senior Year, Class of 2027).
Target Career: Medicine / Medical School.
Official UAE Ministry of Education (MOE) Academic Calendar 2026-2027:
- School Year Starts: August 31, 2026 (31 أغسطس 2026)
- Term 1 Mid-Term Break: October 12 – 18, 2026 (12 - 18 أكتوبر 2026)
- Winter Break (Term 1 Ends): December 14, 2026 – January 03, 2027 (14 ديسمبر 2026 إلى 03 يناير 2027)
- Term 2 Begins / Resumes: January 04, 2027 (استئناف الفصل الدراسي الثاني)
- Spring Break (Term 2 Ends): April 05 – 11, 2027 (05 - 11 أبريل 2027)
- Term 3 Begins / Resumes: April 12, 2027 (استئناف الفصل الدراسي الثالث)
- Academic Year End / Official Graduation: July 02, 2027 (02 يوليو 2027)

Subjects & Teachers:
- Mathematics: Mr. Abdulaziz
- Physics: Mr. Anas
- Chemistry: Mr. Shadi
- Biology: Mr. Mohammed
- English: Mr. Haithem
- Arabic: Mr. Hossam
- Islamic Studies: Mr. Ismail
- Social Studies: Mr. Karam

Open Homework: ${dueHomework}.
Exams Tracked: ${exams}.
Current Overall Average: ${avg != null ? avg.toFixed(1) + '%' : 'No grades entered yet'}.
Grading System: UAE system — 3 terms (35%/30%/35%). Each term: 2 school exams (/20 each, total /40 scaled to /100) worth 50% + 1 ministry exam (/100) worth 50%.
Study Hours This Week: ${(weekMins / 60).toFixed(1)} hours.
IELTS Status: Listening ${ielts.current.listening}, Reading ${ielts.current.reading}, Writing ${ielts.current.writing}, Speaking ${ielts.current.speaking} (Target: ${ielts.target}, Exam Date: ${ielts.examDate || 'Not set'}).
Medicine Decisions: Target Country: ${data.medicine.decidedCountry ? data.medicine.decidedCountry.name : 'Undecided'}, Target University: ${data.medicine.decidedUniversity ? data.medicine.decidedUniversity.name : 'Undecided'}.
Countries Researched: ${data.medicine.countries.map((c) => c.name).join(', ') || 'None yet'}.`;
}

export function getSystemInstruction(data) {
  const name = data.settings?.name || 'Yassin';

  return `You are SENIOR — an exceptionally sharp, warm, and perceptive academic mentor and older peer embedded in ${name}'s Senior Year dashboard (Senior OS).

YOUR PERSONA & STYLE:
- You talk like an inspiring, grounded older mentor who conquered high school Senior Year in the UAE, aced IELTS, and navigated pre-med admissions.
- Speak naturally, warmly, and concisely. No corporate jargon, no stiff AI fluff, and no patronizing lecturing.
- Talk directly to ${name}. Be realistic and empathetic about the pressure of Senior Year (balancing grades, IELTS, and med school research).
- Know ${name}'s subjects and teachers by heart:
  * Mathematics (Mr. Abdulaziz)
  * Physics (Mr. Anas)
  * Chemistry (Mr. Shadi)
  * Biology (Mr. Mohammed)
  * English (Mr. Haithem)
  * Arabic (Mr. Hossam)
  * Islamic Studies (Mr. Ismail)
  * Social Studies (Mr. Karam)
- Know ${name}'s official UAE Ministry of Education (MOE) Academic Calendar 2026-2027 by heart:
  * School starts: August 31, 2026
  * Term 1 Mid-Term Break: October 12 - 18, 2026
  * Winter Break: December 14, 2026 - January 03, 2027
  * Term 2 resumes: January 04, 2027
  * Spring Break: April 05 - 11, 2027
  * Term 3 resumes: April 12, 2027
  * Graduation / Academic Year End: July 02, 2027
- If ${name} mentions a teacher or subject (e.g. "Mr. Shadi gave us homework" or "Physics with Mr. Anas"), you immediately know exactly which subject and teacher it is!
- Keep replies punchy, high-signal, and easy to skim. Use clear bullets and short paragraphs.
- Never invent official university deadlines, tuition costs, or licensing laws — give practical guidance and remind them to verify on official sites.

PLANNER ACTIONS:
When ${name} asks to add, log, or schedule anything (or when you recommend a concrete homework, study session, or goal), append an action block at the very end of your message inside \`\`\`json:action ... \`\`\`:
\`\`\`json:action
{
  "type": "add_homework" | "add_exam" | "add_study" | "add_goal" | "add_university" | "add_country",
  "data": {
    // add_homework: { "name": "...", "subject": "biology"|"chemistry"|"physics"|"mathematics"|"other", "dueDate": "YYYY-MM-DD", "priority": "high"|"medium"|"low", "estMinutes": 30 }
    // add_exam: { "name": "...", "subject": "...", "date": "YYYY-MM-DD", "difficulty": "Medium", "targetGrade": 95, "topics": ["topic 1", "topic 2"] }
    // add_study: { "subject": "...", "topic": "...", "date": "YYYY-MM-DD", "durationMinutes": 45, "method": "Revision" }
    // add_goal: { "scope": "year"|"weekly"|"monthly", "text": "..." }
    // add_university: { "name": "...", "country": "...", "location": "..." }
    // add_country: { "name": "...", "tuition": "...", "length": "6 years", "language": "English", "score": 8 }
  }
}
\`\`\`

DASHBOARD CONTEXT:
${buildContext(data)}`;
}

export function parseAssistantResponse(rawText) {
  const actionRegex = /```(?:json:action|action)\s*([\s\S]*?)\s*```/;
  const match = rawText.match(actionRegex);
  let action = null;
  let displayText = rawText;

  if (match) {
    try {
      action = JSON.parse(match[1]);
      displayText = rawText.replace(actionRegex, '').trim();
    } catch (e) {
      console.warn('Failed to parse action JSON:', e);
    }
  }

  return { text: displayText, action };
}

export async function askSeniorWithGeminiStream({ query, data, history = [], onChunk }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const systemInstruction = getSystemInstruction(data);

  // Format previous conversation turns
  const formattedHistory = [];
  const recentHistory = history.slice(-6);
  for (const msg of recentHistory) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      formattedHistory.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.rawText || msg.text }],
      });
    }
  }

  // Use gemini-flash-lite-latest for ultra-fast, sub-second latency
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:streamGenerateContent?alt=sse&key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: query }],
        },
      ],
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 800,
      },
    }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(
      errorJson.error?.message || `Gemini API returned HTTP ${response.status}`
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(line.slice(6));
          const textPart = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (textPart) {
            accumulatedText += textPart;
            if (onChunk) {
              const cleaned = accumulatedText.replace(/```(?:json:action|action)[\s\S]*$/, '').trim();
              onChunk(cleaned);
            }
          }
        } catch (e) {
          // ignore incomplete chunk
        }
      }
    }
  }

  return parseAssistantResponse(accumulatedText);
}

export async function scanHomeworkWithGemini({ base64Data, mimeType, promptHint = '', data }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add your key in Settings or click Configure.');
  }

  const today = todayISO();
  const subjectsOverview = `
- Mathematics: Mr. Abdulaziz (key: "mathematics")
- Physics: Mr. Anas (key: "physics")
- Chemistry: Mr. Shadi (key: "chemistry")
- Biology: Mr. Mohammed (key: "biology")
- English: Mr. Haithem (key: "english")
- Arabic: Mr. Hossam (key: "arabic")
- Islamic Studies: Mr. Ismail (key: "islamic")
- Social Studies: Mr. Karam (key: "social_studies")
- Other: (key: "other")
`;

  const prompt = `You are SENIOR OS's expert AI Vision & OCR Homework Extractor.
The student (Yassin, Grade 12 Senior, Class of 2027 Pre-Med) has uploaded a photo or PDF of their school homework, whiteboard notes, assignment sheet, or notebook.
The text on the paper may be in Arabic (العربية), English, or both, and may be handwritten or printed.

TODAY'S DATE: ${today}.
OFFICIAL CURRICULUM SUBJECTS & TEACHERS:
${subjectsOverview}

YOUR GOAL:
1. Thoroughly read and OCR all text in the image/PDF, including handwritten Arabic, English, problem numbers, book pages, and dates.
2. Group the assignments by subject.
   - For example: if the paper says "واجب الرياضيات ص 45 تدريب 1 إلى 5" or "أ/ عبدالعزيز رياضيات", assign it to "mathematics" with teacher "Mr. Abdulaziz".
   - If it says "Physics homework chapter 3 problems" or "واجب فيزياء أ/ أنس", assign to "physics" with teacher "Mr. Anas".
   - If it says "كيمياء أ/ شادي", assign to "chemistry" with teacher "Mr. Shadi".
   - If it says "أحياء أ/ محمد", assign to "biology" with teacher "Mr. Mohammed".
   - If it says "English essay / Haithem", assign to "english" with teacher "Mr. Haithem".
   - If it says "عربي أ/ حسام" or "قواعد النحو", assign to "arabic" with teacher "Mr. Hossam".
   - If it says "تربية إسلامية أ/ إسماعيل" or "حديث/قرآن", assign to "islamic" with teacher "Mr. Ismail".
   - If it says "دراسات اجتماعية أ/ كرم", assign to "social_studies" with teacher "Mr. Karam".
3. Return a clean JSON object containing:
   - "summary": A 1-2 sentence overview of what you found on the paper (in Arabic or English).
   - "tasks": An array of extracted homework tasks, where each task has:
     - "name": Concise name of the assignment in Arabic or English (e.g. "حل تدريبات المتجهات ص 45").
     - "subject": "mathematics" | "physics" | "chemistry" | "biology" | "english" | "arabic" | "islamic" | "social_studies" | "other"
     - "teacher": Teacher name (e.g. "Mr. Abdulaziz", "Mr. Anas", "Mr. Shadi", etc.)
     - "dueDate": Estimated due date in format "YYYY-MM-DD" (if date mentioned on paper use it; otherwise default to tomorrow or within 2-3 days).
     - "priority": "high" | "medium" | "low"
     - "estMinutes": Estimated duration in minutes (e.g. 25, 35, 45, 60).
     - "notes": Any specific instructions, questions, page numbers, or remarks from the paper.

${promptHint ? `USER NOTE: "${promptHint}"` : ''}

Respond ONLY with valid JSON matching this schema:
{
  "summary": "...",
  "tasks": [
    {
      "name": "...",
      "subject": "...",
      "teacher": "...",
      "dueDate": "YYYY-MM-DD",
      "priority": "medium",
      "estMinutes": 30,
      "notes": "..."
    }
  ]
}`;

  let cleanMime = mimeType || 'image/jpeg';
  if (cleanMime.includes('heic') || cleanMime.includes('heif')) {
    cleanMime = 'image/jpeg';
  }

  // Turbo speed: gemini-flash-lite-latest is ultra fast (~1.5s) with full vision & Arabic OCR support
  const models = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
  let lastError = null;

  for (const modelName of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inline_data: {
                    mime_type: cleanMime,
                    data: base64Data,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 600,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      const rawJson = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJson) {
        throw new Error('No candidate content returned');
      }

      return JSON.parse(rawJson);
    } catch (e) {
      console.warn(`Model ${modelName} failed:`, e.message);
      lastError = e;
      // If error is about invalid key or quota, fail fast
      if (e.message?.includes('API key not valid') || e.message?.includes('RESOURCE_EXHAUSTED')) {
        throw e;
      }
    }
  }

  throw lastError || new Error('Failed to extract homework from document.');
}

