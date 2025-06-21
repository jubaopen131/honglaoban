import { NextResponse } from "next/server"

// IMPORTANT: In a real application, store this API key in an environment variable.
// For example, process.env.OPENROUTER_API_KEY
// The user provided this key directly in the prompt.
const OPENROUTER_API_KEY = "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"
const API_URL = "https://openrouter.ai/api/v1/chat/completions"

// Helper function to generate a more varied range of scores
function generateScores() {
  // Positive scores (2)
  const positiveScores = [
    Math.floor(Math.random() * 11) + 15, // 15 to 25
    Math.floor(Math.random() * 6) + 10, // 10 to 15
  ].sort((a, b) => b - a) // Ensure higher positive score is first for potential better options

  // Negative scores (4)
  const negativeScores = [
    -(Math.floor(Math.random() * 6) + 5), // -5 to -10
    -(Math.floor(Math.random() * 6) + 10), // -10 to -15
    -(Math.floor(Math.random() * 6) + 15), // -15 to -20 (potentially funny/bad)
    -(Math.floor(Math.random() * 11) + 20), // -20 to -30 (very bad / outlandish)
  ].sort((a, b) => a - b) // Ensure more negative score is last

  return { positiveScores, negativeScores }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      scenarioTitle,
      scenarioDescription,
      conversationHistory, // Array of { role: 'user' | 'assistant', content: string }
      currentScore,
      currentTurn,
      isInitialTurn = false,
    } = body

    if (!scenarioTitle || !conversationHistory || currentScore === undefined || currentTurn === undefined) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const { positiveScores, negativeScores } = generateScores()

    // Construct the system prompt
    // The LLM should generate the boss's statement AND the 6 options with their types (good/bad/funny)
    // Then we will assign scores programmatically to these types.
    const systemPrompt = `
你是一个名为“哄老板模拟器”游戏中的AI老板。玩家的目标是在10个回合内将你的满意度从0提升到100。
当前场景: "${scenarioTitle}" - ${scenarioDescription}
当前老板满意度: ${currentScore}/100
当前回合: ${currentTurn + 1}/10

你的性格特点: 有时严厉，有时会开玩笑，但最终还是希望员工能把事情做好。你的情绪会根据满意度和玩家的回答变化。
满意度低 (<30): 非常不耐烦，语气严厉，甚至有点刻薄。
满意度中 (30-70): 略有不满，但愿意给机会，语气相对平和，可能带点讽刺。
满意度高 (>70): 心情不错，语气轻松，甚至可能表扬玩家。

对话历史:
${conversationHistory.map((msg: any) => `${msg.role === "user" ? "员工" : "老板"}: ${msg.content}`).join("\n")}

你的任务:
1.  根据以上信息和对话历史，生成你作为老板接下来要说的一句话。这句话需要自然地承接上一句对话。
2.  针对你的这句话，为玩家生成6个不同的回复选项。这些选项必须是玩家（员工）的口吻。
-   2个选项是“正面”的，能有效提升满意度。
-   3个选项是“负面”的，会降低满意度。
-   1个选项是“奇葩搞笑”的，会大幅降低满意度，但要足够有趣或荒谬。
3.  请严格按照以下JSON格式输出你的回复，不要包含任何额外的解释或Markdown标记:
{
  "bossStatement": "你作为老板说的话",
  "options": [
    { "text": "正面选项1的文本", "type": "positive" },
    { "text": "正面选项2的文本", "type": "positive" },
    { "text": "负面选项1的文本", "type": "negative" },
    { "text": "负面选项2的文本", "type": "negative" },
    { "text": "负面选项3的文本", "type": "negative" },
    { "text": "奇葩搞笑选项的文本", "type": "outlandish" }
  ]
}
确保所有文本内容都是简体中文。选项文本如果过长，请确保其自然换行。
`
    // For the very first turn, the boss's statement is already known (from scenario config).
    // The LLM only needs to generate options.
    // However, the current setup makes the LLM generate both.
    // If isInitialTurn is true, we can simplify the prompt or just use the options part of the response.
    // For simplicity, let's use the same prompt structure. The game client will handle the initial boss statement.

    const messagesForAPI = [
      { role: "system", content: systemPrompt },
      ...conversationHistory, // Add existing conversation
    ]

    // If it's not the initial turn, the last message in conversationHistory is the user's reply.
    // The LLM should generate the boss's reaction to that.
    // If it IS the initial turn, conversationHistory contains only the boss's first line.
    // The LLM should generate options for that first line.

    const apiRequestBody = {
      model: "google/gemini-2.5-flash", // Using a common, capable model. User mentioned gemini-2.5-flash, ensure this is available or adjust.
      messages: messagesForAPI,
      temperature: 0.7, // For some creativity
      max_tokens: 600, // Adjust as needed
      response_format: { type: "json_object" }, // Request JSON output
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        // OpenRouter specific header for routing, if needed (usually not for direct model calls)
        // 'HTTP-Referer': 'YOUR_SITE_URL',
        // 'X-Title': 'YOUR_APP_NAME',
      },
      body: JSON.stringify(apiRequestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API Error:", response.status, errorText)
      return NextResponse.json(
        { error: `API request failed: ${response.status} ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error("Invalid API response structure from OpenRouter:", data)
      return NextResponse.json({ error: "Invalid API response structure" }, { status: 500 })
    }

    let parsedContent
    try {
      // The content might be a stringified JSON, or already an object if the model respects response_format
      if (typeof data.choices[0].message.content === "string") {
        parsedContent = JSON.parse(data.choices[0].message.content)
      } else {
        parsedContent = data.choices[0].message.content // Assume it's already an object
      }
    } catch (e) {
      console.error("Failed to parse LLM JSON response:", e, data.choices[0].message.content)
      return NextResponse.json({ error: "Failed to parse LLM response content" }, { status: 500 })
    }

    if (!parsedContent.bossStatement || !parsedContent.options || parsedContent.options.length !== 6) {
      console.error("LLM response missing required fields or incorrect options count:", parsedContent)
      return NextResponse.json({ error: "LLM response content is malformed" }, { status: 500 })
    }

    // Assign scores based on type
    const finalOptions = parsedContent.options.map((opt: any) => {
      let score = 0
      switch (opt.type) {
        case "positive":
          score = positiveScores.pop() || 10 // Assign from pre-generated positive scores
          break
        case "negative":
          score = negativeScores.shift() || -10 // Assign from pre-generated negative scores
          break
        case "outlandish":
          score = negativeScores.pop() || -25 // Assign the most negative score
          break
        default: // Failsafe
          score = -5
      }
      return { text: opt.text, score }
    })

    // Shuffle options so positive/negative aren't always in same place
    finalOptions.sort(() => Math.random() - 0.5)

    return NextResponse.json({
      bossStatement: parsedContent.bossStatement,
      options: finalOptions,
    })
  } catch (error: any) {
    console.error("Error in /api/generate-chat:", error)
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 })
  }
}
