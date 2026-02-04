import { NextRequest } from "next/server";
import OpenAI from "openai";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  return Response.json({ success: true, data: "THANK YOU!" }, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();

  // --------------------------------------------
  // 🔍 Extract arguments depending on the format
  // --------------------------------------------

  let args: any = {};
  const toolCallId = body.message.toolCallList[0].id;
  // Case 1: Tool-call format
  if (
    body?.message?.type === "tool-calls" &&
    Array.isArray(body.message.toolCallList)
  ) {
    const firstCall = body.message.toolCallList[0];
    args = firstCall?.function?.arguments ?? {};
  } else {
    // Case 2: Normal format
    args = body;
  }

  const { type, role, level, techstack, amount, userid } = args;

  // --------------------------------------------
  // ⚠️ Validate
  // --------------------------------------------
  if (!role || !type || !level || !userid) {
    return Response.json(
      {
        success: false,
        error: {
          message: "role, type, level, techstack, amount, userid are required.",
        },
      },
      { status: 400 }
    );
  }

  // --------------------------------------------
  // 🧠 Build prompt
  // --------------------------------------------
  const prompt = `
Generate ONLY a valid JSON array of ${amount} interview questions.
NO explanation. NO additional text.

Role: ${role}
Level: ${level}
Type: ${type}
Techstack: ${techstack}

Return STRICT JSON like:
["Question 1", "Question 2", "Question 3"]
`;

  try {
    // --------------------------------------------
    // 🔥 Call OpenAI
    // --------------------------------------------
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const text = response.choices[0].message?.content ?? "";

    // --------------------------------------------
    // 🔍 Parse JSON safely
    // --------------------------------------------
    let questions = [];
    try {
      const cleaned = text
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/```$/, "")
        .trim();

      questions = JSON.parse(cleaned);

      if (!Array.isArray(questions)) {
        throw new Error("Model did not return an array");
      }
    } catch (err) {
      console.error("❌ Invalid JSON from OpenAI:", text);
      return Response.json(
        {
          success: false,
          error: { message: "OpenAI did not return valid JSON", raw: text },
        },
        { status: 500 }
      );
    }

    // --------------------------------------------
    // 📝 Save to Firestore
    // --------------------------------------------
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({
        results: [
            {
                toolCallId: toolCallId,
                result: "Your interview has been successfully generated. You can now access it on the website."
            }
        ]
    }, { status: 200 });
  } catch (error: any) {
    console.error("🔥 SERVER ERROR:", error);
    return Response.json(
      {
        success: false,
        error: { message: error?.message },
      },
      { status: 500 }
    );
  }
}
