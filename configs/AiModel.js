import OpenAI from "openai";

let _client;
const getClient = () => {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
  return _client;
};

const COURSE_LAYOUT_SYSTEM_PROMPT =
  `You are a course curriculum designer. Always respond with valid JSON only, no markdown, no explanation.
The JSON must follow this exact structure:
{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "topic": "string",
    "level": "string",
    "duration": "string",
    "noOfChapters": number,
    "chapters": [
      {
        "name": "string",
        "about": "string",
        "duration": "string"
      }
    ]
  }
}`;

const CHAPTER_CONTENT_SYSTEM_PROMPT =
  "You are an expert technical educator. Always respond with valid JSON only, no markdown, no explanation.";

const createChatSession = (systemPrompt) => ({
  sendMessage: async (userMessage) => {
    console.log("[AiModel] sendMessage called");
    console.log("[AiModel] System prompt:", systemPrompt);
    console.log("[AiModel] User message:", userMessage);
    console.log("[AiModel] API key present:", !!process.env.NEXT_PUBLIC_OPENAI_API_KEY);

    let completion;
    try {
      console.log("[AiModel] Sending request to OpenAI...");
      completion = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      });
      console.log("[AiModel] OpenAI response received");
      console.log("[AiModel] Usage:", completion.usage);
      console.log("[AiModel] Finish reason:", completion.choices[0]?.finish_reason);
    } catch (err) {
      console.error("[AiModel] OpenAI API error:", err?.message || err);
      console.error("[AiModel] Error status:", err?.status);
      console.error("[AiModel] Error details:", err?.error);
      throw err;
    }

    const text = completion.choices[0].message.content;
    console.log("[AiModel] Raw response text:", text);
    return {
      response: {
        text: () => text,
      },
    };
  },
});

const QUIZ_SYSTEM_PROMPT =
  `You are a quiz generator for educational courses. Always respond with valid JSON only, no markdown, no explanation.
The JSON must follow this exact structure:
{
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": number,
      "explanation": "string"
    }
  ]
}
Where correctAnswer is the 0-based index of the correct option. Generate exactly 5 questions.`;

export const GenerateCourseLayout_AI = createChatSession(COURSE_LAYOUT_SYSTEM_PROMPT);
export const GenerateChapterContent_AI = createChatSession(CHAPTER_CONTENT_SYSTEM_PROMPT);
export const GenerateQuiz_AI = createChatSession(QUIZ_SYSTEM_PROMPT);
