import type { Band, Contribution, DataQuality, OperationalBrief } from "./types"
import { defaultActionFor } from "./icri"

const BAND_LABEL: Record<Band, string> = { low: "Low", moderate: "Moderate", high: "High", severe: "Severe" }

interface BriefInput {
  kind: "facility" | "lga"
  id: string
  name: string
  band: Band
  score: number
  confidence: DataQuality
  topDrivers: Contribution[] // already sorted
  where: string
}

/** Structured-first brief. The fields are the source of truth; text is assembled
 *  from them. An optional LLM pass (see /api/pilot/brief) only cleans the prose. */
export function buildStructuredBrief(input: BriefInput): OperationalBrief {
  const why = input.topDrivers.slice(0, 3).map((c) => c.label)
  const atRisk =
    input.kind === "facility"
      ? "Routine child immunization continuity at this facility"
      : "Immunization continuity across flagged facilities in this LGA"
  const action = defaultActionFor(input.band)

  const text = [
    `${BAND_LABEL[input.band]} risk (score ${input.score}). ${atRisk} in ${input.where}.`,
    why.length ? `Main drivers: ${why.join("; ")}.` : "",
    `Action this week: ${action}`,
    input.confidence !== "live" ? `(Confidence: ${input.confidence} — based on seeded/forecast inputs.)` : "",
  ]
    .filter(Boolean)
    .join(" ")

  return {
    scope: { kind: input.kind, id: input.id, name: input.name },
    atRisk,
    where: input.where,
    why,
    action,
    band: input.band,
    score: input.score,
    confidence: input.confidence,
    text,
    generatedAt: new Date().toISOString(),
  }
}

/** Optional DeepSeek polish. Mirrors app/api/ai/insights: structured fields stay
 *  authoritative; the model only tightens prose. Returns the input text on any failure. */
export async function polishBrief(brief: OperationalBrief): Promise<OperationalBrief> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return brief
  try {
    const { generateText } = await import("ai")
    const { createOpenAI } = await import("@ai-sdk/openai")
    const deepseek = createOpenAI({ apiKey, baseURL: "https://api.deepseek.com/v1", name: "deepseek" })
    const { text } = await generateText({
      model: deepseek("deepseek-chat"),
      system:
        "You rewrite a short operational note for immunization health teams. " +
        "Keep it under 60 words, preserve every number and the recommended action exactly, " +
        "do not add facts. Return plain text only.",
      prompt: brief.text,
      temperature: 0.2,
    })
    return { ...brief, text: text.trim() }
  } catch {
    return brief
  }
}
