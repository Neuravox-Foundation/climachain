import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { synthesiseInsight, type DataType } from "@/lib/insight-synthesis"

interface InsightRequestBody {
  countryName: string
  countryCode: string
  dataType: DataType
  data: unknown
  analysis?: unknown
}

export async function POST(request: NextRequest) {
  let body: InsightRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { countryName, countryCode, dataType, data, analysis } = body
  if (!countryName || !countryCode || !dataType) {
    return NextResponse.json(
      { error: "countryName, countryCode and dataType are required" },
      { status: 400 },
    )
  }

  const synthesisInput = { countryName, countryCode, data, analysis }
  const dataGroundedBrief = synthesiseInsight(dataType, synthesisInput)

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      insight: dataGroundedBrief,
      dataType,
      country: countryName,
      generatedAt: new Date().toISOString(),
      attribution: "Synthesised from observed series (deterministic)",
      model: "data-synthesis",
    })
  }

  try {
    // DeepSeek is OpenAI-API-compatible, so we point the OpenAI provider
    // at https://api.deepseek.com/v1 and use the deepseek-chat model.
    const deepseek = createOpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com/v1",
      name: "deepseek",
    })
    const { text } = await generateText({
      model: deepseek("deepseek-chat"),
      system:
        "You are a climate-policy analyst writing for African ministries, multilateral lenders and development banks. " +
        "You will be given a draft brief computed deterministically from the underlying data. " +
        "Rewrite it in 110-160 words, preserving every number exactly as stated. " +
        "Tighten the language and strengthen the policy reasoning, but do not add fictional figures or speculate beyond what the draft contains. " +
        "Return prose only - no headings, bullet lists or markdown.",
      prompt:
        `Country: ${countryName} (${countryCode}). Data type: ${dataType}.\n\n` +
        `Draft brief grounded in the loaded series:\n${dataGroundedBrief}`,
      temperature: 0.3,
    })
    return NextResponse.json({
      insight: text.trim(),
      dataType,
      country: countryName,
      generatedAt: new Date().toISOString(),
      attribution: "Synthesised from observed series · refined by DeepSeek",
      model: "deepseek-chat",
    })
  } catch (error) {
    return NextResponse.json({
      insight: dataGroundedBrief,
      dataType,
      country: countryName,
      generatedAt: new Date().toISOString(),
      attribution: "Synthesised from observed series (LLM refinement unavailable)",
      model: "data-synthesis",
      note: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
