import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
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
    // 🔥 Call Gemini
    // --------------------------------------------
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text ?? "";

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




// import { NextRequest } from "next/server"; 

// import { GoogleGenAI } from "@google/genai"; 

// import { db } from "@/firebase/admin"; 

// import { getRandomInterviewCover } from "@/lib/utils"; 


// // Create Gemini AI instance using API key
// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });


// // ---------------------------
// // ✅ GET API (Simple Test API)
// // ---------------------------
// export async function GET() {
//   // When someone calls GET request, return simple success message
//   return Response.json({ success: true, data: "THANK YOU!" }, { status: 200 });
// }



// // ---------------------------
// // ✅ POST API (Main Logic)
// // ---------------------------
// export async function POST(request: Request) {

//   // Get data sent from frontend
//   const body = await request.json();

//   // --------------------------------------------
//   // 🔍 Extract arguments (Tool-call OR Normal format)
//   // --------------------------------------------

//   let args: any = {};

//   // Get toolCallId (used when AI tool-calling format is used)
//   const toolCallId = body.message?.toolCallList?.[0]?.id;

//   // Case 1: If data comes in tool-calls format
//   if (
//     body?.message?.type === "tool-calls" &&
//     Array.isArray(body.message.toolCallList)
//   ) {
//     const firstCall = body.message.toolCallList[0];

//     // Get actual arguments from tool-call
//     args = firstCall?.function?.arguments ?? {};
//   } 
//   else {
//     // Case 2: Normal JSON format
//     args = body;
//   }

//   // Destructure required fields
//   const { type, role, level, techstack, amount, userid } = args;



//   // --------------------------------------------
//   // ⚠️ Validate required fields
//   // --------------------------------------------
//   if (!role || !type || !level || !userid) {
//     return Response.json(
//       {
//         success: false,
//         error: {
//           message: "role, type, level, techstack, amount, userid are required.",
//         },
//       },
//       { status: 400 }
//     );
//   }



//   // --------------------------------------------
//   // 🧠 Build prompt for Gemini AI
//   // --------------------------------------------
//   const prompt = `
// Generate ONLY a valid JSON array of ${amount} interview questions.
// NO explanation. NO additional text.

// Role: ${role}
// Level: ${level}
// Type: ${type}
// Techstack: ${techstack}

// Return STRICT JSON like:
// ["Question 1", "Question 2", "Question 3"]
// `;

//   try {

//     // --------------------------------------------
//     // 🔥 Call Gemini AI to generate questions
//     // --------------------------------------------
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",   // Using Gemini flash model
//       contents: prompt,           // Sending prompt
//     });

//     // Get text response from AI
//     const text = response.text ?? "";


//     // --------------------------------------------
//     // 🔍 Convert AI response into proper JSON
//     // --------------------------------------------
//     let questions = [];

//     try {

//       // Remove ```json formatting if AI returns it
//       const cleaned = text
//         .trim()
//         .replace(/^```json\s*/i, "")
//         .replace(/```$/, "")
//         .trim();

//       // Convert text into array
//       questions = JSON.parse(cleaned);

//       // Check if response is actually an array
//       if (!Array.isArray(questions)) {
//         throw new Error("Model did not return an array");
//       }

//     } catch (err) {

//       // If JSON parsing fails
//       console.error("❌ Invalid JSON from AI:", text);

//       return Response.json(
//         {
//           success: false,
//           error: { message: "AI did not return valid JSON", raw: text },
//         },
//         { status: 500 }
//       );
//     }



//     // --------------------------------------------
//     // 📝 Save interview data in Firebase Firestore
//     // --------------------------------------------
//     const interview = {
//       role,
//       type,
//       level,
//       techstack: techstack.split(","), // Convert string to array
//       questions,
//       userId: userid,
//       finalized: true,
//       coverImage: getRandomInterviewCover(), // Add random cover image
//       createdAt: new Date().toISOString(),   // Save current date
//     };

//     // Save into "interviews" collection
//     await db.collection("interviews").add(interview);



//     // --------------------------------------------
//     // ✅ Send success response back to frontend
//     // --------------------------------------------
//     return Response.json({
//       results: [
//         {
//           toolCallId: toolCallId,
//           result: "Your interview has been successfully generated. You can now access it on the website."
//         }
//       ]
//     }, { status: 200 });

//   } catch (error: any) {

//     // If any unexpected server error happens
//     console.error("🔥 SERVER ERROR:", error);

//     return Response.json(
//       {
//         success: false,
//         error: { message: error?.message },
//       },
//       { status: 500 }
//     );
//   }
// }