// ============================================================
// overall-feedback.service.js
//
// Generates personalized overall feedback for a student
// after the complete assessment has been evaluated.
//
// This service DOES NOT calculate or modify marks.
// The existing scoring system remains responsible for scoring.
//
// The LLM only interprets:
// - Student's CEFR level
// - Assessment
// - Student answers
// - Task completion
// - Language scores
// - Awarded marks
// ============================================================

const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


/**
 * Generate overall feedback for a completed assessment.
 *
 * @param {Object} params
 * @param {string} params.level
 * @param {string} params.assessmentTitle
 * @param {number} params.totalMarks
 * @param {number} params.totalMarksAwarded
 * @param {Array} params.questions
 *
 * @returns {Promise<Object>}
 */
async function generateOverallFeedback({
    level,
    assessmentTitle,
    totalMarks,
    totalMarksAwarded,
    questions
}) {

    // --------------------------------------------------------
    // Validate input
    // --------------------------------------------------------

    if (!level || typeof level !== "string") {

        throw new Error(
            "CEFR level is required."
        );

    }


    if (!assessmentTitle ||
        typeof assessmentTitle !== "string") {

        throw new Error(
            "Assessment title is required."
        );

    }


    if (!Array.isArray(questions) ||
        questions.length === 0) {

        throw new Error(
            "Question results are required."
        );

    }


    // --------------------------------------------------------
    // Calculate percentage
    //
    // This is calculated by our application.
    // The LLM does NOT calculate the official mark.
    // --------------------------------------------------------

    const percentage =
        totalMarks > 0
            ? (totalMarksAwarded / totalMarks) * 100
            : 0;


    // --------------------------------------------------------
    // Prepare question information
    // --------------------------------------------------------

    const questionData =
        questions.map((item) => ({

            questionNo:
                item.questionNo,

            question:
                item.question || "",

            answer:
                item.answer || "",

            taskCompletion:
                item.taskCompletion ?? 0,

            taskReason:
                item.taskReason || "",

            xlmScore:
                item.xlmScore ?? 0,

            languageScore:
                item.languageScore ?? 0,

            maximumMarks:
                item.maximumMarks ?? 0,

            awardedMarks:
                item.awardedMarks ?? 0

        }));


    // --------------------------------------------------------
    // Prompt
    // --------------------------------------------------------

    const prompt = `
You are an AI German language learning assistant.

Your task is to generate personalized overall feedback
for a student after a completed German written assessment.

The feedback must be appropriate for the student's CEFR level.

IMPORTANT:

- Do NOT recalculate the student's marks.
- Do NOT change the official score.
- Do NOT invent assessment results.
- Do NOT evaluate anything that is not supported by the
  provided student answers and scores.
- Consider the student's actual answers when identifying
  strengths and weaknesses.
- Consider task completion and language-quality scores.
- Feedback must be appropriate for the student's CEFR level.
- Use encouraging and constructive language.
- Do not be overly harsh.
- Do not praise the student for something that the data
  does not support.

Student CEFR Level:
${level}

Assessment:
${assessmentTitle}

Official Assessment Result:
${totalMarksAwarded} / ${totalMarks}
Percentage:
${percentage.toFixed(2)}%

Question-Level Results:
${JSON.stringify(questionData, null, 2)}


Generate an overall learning feedback report.

The report must include:

1. performanceLevel
   A short description such as:
   "Excellent", "Very Good", "Good",
   "Satisfactory", or "Needs Improvement".

2. summary
   A short overall summary of the student's performance.

3. strengths
   2 to 4 specific strengths supported by the
   student's answers and scores.

4. areasForImprovement
   2 to 4 specific areas where the student
   could improve.

5. recommendations
   2 to 4 practical learning recommendations
   appropriate for the student's CEFR level.

6. levelAssessment
   Explain briefly whether the student's performance
   appears appropriate for the given CEFR level.
   Do not assign a new CEFR level.

7. encouragement
   Give a short encouraging message to the student.

Return ONLY valid JSON using exactly this structure:

{
  "performanceLevel": "string",
  "summary": "string",
  "strengths": [
    "string"
  ],
  "areasForImprovement": [
    "string"
  ],
  "recommendations": [
    "string"
  ],
  "levelAssessment": "string",
  "encouragement": "string"
}
`;


    // --------------------------------------------------------
    // Call OpenAI
    // --------------------------------------------------------

    const response =
        await client.responses.create({

            model:
                process.env.OPENAI_MODEL,

            input:
                prompt

        });


    // --------------------------------------------------------
    // Get response text
    // --------------------------------------------------------

    const outputText =
        response.output_text?.trim();


    if (!outputText) {

        throw new Error(
            "OpenAI returned an empty overall feedback response."
        );

    }


    // --------------------------------------------------------
    // Parse JSON
    // --------------------------------------------------------

    let feedback;


    try {

        feedback =
            JSON.parse(outputText);

    }
    catch (error) {

        console.error(
            "Failed to parse overall feedback:",
            outputText
        );

        throw new Error(
            "OpenAI returned invalid JSON for overall feedback."
        );

    }


    // --------------------------------------------------------
    // Validate response
    // --------------------------------------------------------

    if (
        typeof feedback.performanceLevel !==
        "string"
    ) {

        throw new Error(
            "Invalid performanceLevel returned by OpenAI."
        );

    }


    if (
        typeof feedback.summary !==
        "string"
    ) {

        throw new Error(
            "Invalid summary returned by OpenAI."
        );

    }


    if (
        !Array.isArray(feedback.strengths)
    ) {

        throw new Error(
            "Invalid strengths returned by OpenAI."
        );

    }


    if (
        !Array.isArray(
            feedback.areasForImprovement
        )
    ) {

        throw new Error(
            "Invalid areasForImprovement returned by OpenAI."
        );

    }


    if (
        !Array.isArray(
            feedback.recommendations
        )
    ) {

        throw new Error(
            "Invalid recommendations returned by OpenAI."
        );

    }


    if (
        typeof feedback.levelAssessment !==
        "string"
    ) {

        throw new Error(
            "Invalid levelAssessment returned by OpenAI."
        );

    }


    if (
        typeof feedback.encouragement !==
        "string"
    ) {

        throw new Error(
            "Invalid encouragement returned by OpenAI."
        );

    }


    // --------------------------------------------------------
    // Return structured feedback
    // --------------------------------------------------------

    return {

        performanceLevel:
            feedback.performanceLevel.trim(),

        summary:
            feedback.summary.trim(),

        strengths:
            feedback.strengths
                .map(item => String(item).trim()),

        areasForImprovement:
            feedback.areasForImprovement
                .map(item => String(item).trim()),

        recommendations:
            feedback.recommendations
                .map(item => String(item).trim()),

        levelAssessment:
            feedback.levelAssessment.trim(),

        encouragement:
            feedback.encouragement.trim()

    };

}


module.exports = {
    generateOverallFeedback
};