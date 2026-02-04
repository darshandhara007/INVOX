// 'use server';

// import { db } from "@/firebase/admin";
// import OpenAI from "openai";

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // ---------------------------------------------
// // GET INTERVIEWS BY USER ID
// // ---------------------------------------------
// export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
//   const interviews = await db
//     .collection('interviews')
//     .where('userId', '==', userId)
//     .orderBy('createdAt', 'desc')
//     .get();

//   return interviews.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data()
//   })) as Interview[];
// }

// // ---------------------------------------------
// // GET LATEST INTERVIEWS
// // ---------------------------------------------
// export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
//   const { userId, limit = 20 } = params;

//   const interviews = await db
//     .collection('interviews')
//     .orderBy('createdAt', 'desc')
//     .where('finalized', '==', true)
//     .where('userId', '!=', userId)
//     .limit(limit)
//     .get();

//   return interviews.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data()
//   })) as Interview[];
// }

// // ---------------------------------------------
// // GET INTERVIEW BY ID
// // ---------------------------------------------
// export async function getInterviewById(id: string): Promise<Interview | null> {
//   const interview = await db.collection('interviews').doc(id).get();
//   return interview.data() as Interview | null;
// }

// // ---------------------------------------------
// // CREATE FEEDBACK
// // ---------------------------------------------
// export async function createFeedback(params: CreateFeedbackParams) {
//   console.log("Creating feedback...");
//   const { interviewId, userId, transcript, feedbackId } = params;

//   try {
//     const formattedTranscript = transcript
//       .map((s: { role: string; content: string }) => `- ${s.role}: ${s.content}`)
//       .join("\n");

//     const prompt = `
// You are an AI interviewer analyzing a mock interview.
// Your task is to evaluate the candidate based on structured categories.
// Be thorough and detailed in your analysis.
// Do NOT be lenient with the candidate.
// If there are mistakes or areas for improvement, clearly point them out.

// Transcript:
// ${formattedTranscript}

// Please score the candidate from 0 to 100 in the following areas.
// Do NOT add categories other than the ones provided:

// - Communication Skills: Clarity, articulation, structured responses
// - Technical Knowledge: Understanding of key concepts for the role
// - Problem-Solving: Ability to analyze problems and propose solutions
// - Cultural & Role Fit: Alignment with company values and job role
// - Confidence & Clarity: Confidence in responses, engagement, and clarity

// Return ONLY valid JSON.
// Do NOT include explanations or markdown.

// Return JSON in this exact format:
// {
//   "totalScore": number,
//   "categoryScores": {
//     "communication": number,
//     "technical": number,
//     "problemSolving": number,
//     "cultureFit": number,
//     "confidence": number
//   },
//   "strengths": string[],
//   "areasForImprovement": string[],
//   "finalAssessment": string
// }
// `;

//     // OpenAI API call
//     const response = await client.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories."
//         },
//         { role: "user", content: prompt }
//       ],
//       temperature: 0.3
//     });

//     const rawText = response.choices[0].message?.content ?? "";

//     // Safe JSON parse
//     let parsed;
//     try {
//       const cleaned = rawText
//         .trim()
//         .replace(/^```json\s*/i, "")
//         .replace(/```$/, "")
//         .trim();

//       parsed = JSON.parse(cleaned);
//     } catch (err) {
//       console.error("❌ Invalid JSON from OpenAI:", rawText);
//       throw new Error("Invalid JSON returned from OpenAI");
//     }

//     const feedback = {
//       interviewId,
//       userId,
//       totalScore: parsed.totalScore,
//       categoryScores: parsed.categoryScores,
//       strengths: parsed.strengths,
//       areasForImprovement: parsed.areasForImprovement,
//       finalAssessment: parsed.finalAssessment,
//       createdAt: new Date().toISOString()
//     };

//     console.log("Feedback object:", feedback);

//     const ref = feedbackId
//       ? db.collection("feedback").doc(feedbackId)
//       : db.collection("feedback").doc();

//     await ref.set(feedback);

//     return { success: true, feedbackId: ref.id };
//   } catch (error) {
//     console.error("🔥 Error saving feedback:", error);
//     return { success: false };
//   }
// }

// // ---------------------------------------------
// // GET FEEDBACK BY INTERVIEW ID
// // ---------------------------------------------
// export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
//   const { interviewId, userId } = params;

//   const feedback = await db
//     .collection('feedback')
//     .where('interviewId', '==', interviewId)
//     .where('userId', '==', userId)
//     .limit(1)
//     .get();

//   if (feedback.empty) return null;

//   const feedbackDoc = feedback.docs[0];

//   return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
// }


'use server';

import { db } from "@/firebase/admin";
import OpenAI from "openai";

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------------------------------------------
// GET INTERVIEWS BY USER ID
// ---------------------------------------------
export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
    const interviews = await db
        .collection('interviews')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return interviews.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}

// ---------------------------------------------
// GET LATEST INTERVIEWS
// ---------------------------------------------
export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    const interviews = await db
        .collection('interviews')
        .orderBy('createdAt', 'desc')
        .where('finalized', '==', true)
        .where('userId', '!=', userId)
        .limit(limit)
        .get();

    return interviews.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}

// ---------------------------------------------
// GET INTERVIEW BY ID
// ---------------------------------------------
export async function getInterviewById(id: string): Promise<Interview | null> {
    const interview = await db.collection('interviews').doc(id).get();
    return interview.data() as Interview | null;
}

// ---------------------------------------------
// CREATE FEEDBACK USING OPENAI
// ---------------------------------------------
export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId } = params;

    try {
        // Format transcript for AI
        const formattedTranscript = transcript
            .map((sentence: { role: string; content: string }) =>
                `- ${sentence.role}: ${sentence.content}`
            )
            .join("\n");

        const prompt = `
You are an AI interviewer analyzing a mock interview.
Evaluate the candidate strictly and thoroughly based on structured categories.
Do NOT be lenient. Highlight mistakes or areas for improvement.

Transcript:
${formattedTranscript}

Score the candidate from 0 to 100 in the following areas (do not add extra categories):
- Communication Skills: Clarity, articulation, structured responses
- Technical Knowledge: Understanding of key concepts for the role
- Problem-Solving: Ability to analyze problems and propose solutions
- Cultural & Role Fit: Alignment with company values and job role
- Confidence & Clarity: Confidence in responses, engagement, and clarity

Return ONLY valid JSON in this exact format:
{
  "totalScore": number,
  "categoryScores": {
    "communication": number,
    "technical": number,
    "problemSolving": number,
    "cultureFit": number,
    "confidence": number
  },
  "strengths": string[],
  "areasForImprovement": string[],
  "finalAssessment": string
}
`;

        // Call OpenAI API
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a professional interviewer analyzing a mock interview."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.3
        });

        const rawText = response.choices[0].message?.content ?? "";

        // Safe JSON parse
        let parsed;
        try {
            const cleaned = rawText
                .trim()
                .replace(/^```json\s*/i, "")
                .replace(/```$/, "")
                .trim();

            parsed = JSON.parse(cleaned);
        } catch (err) {
            console.error("❌ Invalid JSON from OpenAI:", rawText);
            throw new Error("Invalid JSON returned from OpenAI");
        }

        const feedback = {
            interviewId,
            userId,
            totalScore: parsed.totalScore,
            categoryScores: parsed.categoryScores,
            strengths: parsed.strengths,
            areasForImprovement: parsed.areasForImprovement,
            finalAssessment: parsed.finalAssessment,
            createdAt: new Date().toISOString()
        };

        // Save feedback in Firebase
        const ref = feedbackId
            ? db.collection("feedback").doc(feedbackId)
            : db.collection("feedback").doc();

        await ref.set(feedback);

        return { success: true, feedbackId: ref.id };

    } catch (error) {
        console.error("🔥 Error saving feedback:", error);
        return { success: false };
    }
}

// ---------------------------------------------
// GET FEEDBACK BY INTERVIEW ID
// ---------------------------------------------
export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
    const { interviewId, userId } = params;

    const feedback = await db
        .collection('feedback')
        .where('interviewId', '==', interviewId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

    if (feedback.empty) return null;

    const feedbackDoc = feedback.docs[0];

    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}
