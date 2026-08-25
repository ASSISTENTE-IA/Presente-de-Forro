import { Router, type IRouter } from "express";
import { GenerateDedicationBody, GenerateDedicationResponse } from "@workspace/api-zod";

type Provider = "groq" | "gemini" | "mistral";

const router: IRouter = Router();

function availableProviders(): Provider[] {
  return [
    process.env.GROQ_API_KEY ? "groq" : null,
    process.env.GEMINI_API_KEY ? "gemini" : null,
    process.env.MISTRAL_API_KEY ? "mistral" : null,
  ].filter((provider): provider is Provider => provider !== null);
}

function buildPrompt(input: {
  recipientName: string;
  senderName?: string;
  tone: "romantic" | "leve" | "poetic";
  details?: string;
  memories?: string[];
}) {
  const toneDescription = {
    romantic: "romântico, sincero e delicado, sem ser intenso demais",
    leve: "leve, charmoso e com uma pitada de humor",
    poetic: "poético, nordestino e musical, com imagens bonitas",
  }[input.tone];

  return `Escreva uma dedicatória curta em português brasileiro para ${input.recipientName}.
Tom: ${toneDescription}.
Contexto: ela é uma mulher nordestina, forrozeira e dançarina, apaixonada por música. Ela também é mãe de uma filha linda, então trate a maternidade com respeito, sem expor a criança e sem soar invasivo.
${input.senderName ? `Quem presenteia é ${input.senderName}.` : ""}
${input.details ? `Detalhes adicionais: ${input.details}` : ""}
${input.memories?.length ? `Memórias que ela escolheu guardar para personalizar a conversa: ${input.memories.join(" | ")}` : ""}
Regras: escreva de 70 a 110 palavras, seja original e natural, não use emojis, não faça promessas exageradas e termine com uma frase que combine com um presente digital de música. Retorne somente a dedicatória, sem aspas, título ou explicações.`;
}

async function requestOpenAiCompatible(
  url: string,
  apiKey: string,
  model: string,
  prompt: string,
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 260,
    }),
  });
  if (!response.ok) throw new Error(`Provider returned ${response.status}`);
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Provider returned no dedication");
  return text;
}

async function requestGemini(apiKey: string, prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );
  if (!response.ok) throw new Error(`Provider returned ${response.status}`);
  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("Provider returned no dedication");
  return text;
}

router.post("/openai/dedication", async (req, res) => {
  const parsed = GenerateDedicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Preencha o nome e escolha um tom para a dedicatória." });
    return;
  }

  const input = parsed.data;
  const candidates = input.provider === "auto"
    ? availableProviders()
    : [input.provider];

  if (candidates.length === 0 || candidates.some((provider) => !availableProviders().includes(provider))) {
    res.status(503).json({ error: "Este provedor ainda não está configurado." });
    return;
  }

  const prompt = buildPrompt(input);
  let lastError: unknown;
  for (const provider of candidates) {
    try {
      const text = provider === "groq"
        ? await requestOpenAiCompatible(
            "https://api.groq.com/openai/v1/chat/completions",
            process.env.GROQ_API_KEY!,
            "llama-3.3-70b-versatile",
            prompt,
          )
        : provider === "mistral"
          ? await requestOpenAiCompatible(
              "https://api.mistral.ai/v1/chat/completions",
              process.env.MISTRAL_API_KEY!,
              "mistral-small-latest",
              prompt,
            )
          : await requestGemini(process.env.GEMINI_API_KEY!, prompt);
      res.json(GenerateDedicationResponse.parse({
        title: provider === "gemini" ? "Uma dedicatória feita com carinho" : "Uma dedicatória no ritmo do coração",
        text,
      }));
      return;
    } catch (error) {
      lastError = error;
      req.log.warn({ provider, error }, "Dedication provider failed");
    }
  }

  req.log.error({ error: lastError }, "All dedication providers failed");
  res.status(502).json({ error: "Não consegui criar a dedicatória agora. Tente outro provedor." });
});

export default router;