// ============================================================
// answer-evaluation.service.js
// Evaluates whether a student's answer satisfies the question.
// Grammar/language quality is NOT evaluated here.
// XLM-RoBERTa handles language quality separately.
// ============================================================

const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Evaluate whether a student's answer fulfills the
 * requirements of a particular assessment question.
 *
 * @param {Object} params
 * @param {string} params.question
 * @param {string} params.answer
 * @param {number} params.marks
 * @returns {Promise<Object>}
 */
async function evaluateAnswer({
    question,
    answer,
    marks
}) {
    if (!question || typeof question !== "string") {
        throw new Error("Question is required.");
    }

    if (!answer || typeof answer !== "string") {
        throw new Error("Student answer is required.");
    }

    const prompt = `
You are evaluating a student's answer in a German language
end-of-class assessment.

Your ONLY task is to determine whether the student's answer
fulfills the requirements of the question.

DO NOT evaluate:
- grammar quality
- spelling quality
- vocabulary quality
- pronunciation
- overall German proficiency

Those aspects are evaluated separately by an XLM-RoBERTa
language-quality model.

Evaluate ONLY TASK COMPLETION.

Question:
${question}

Student Answer:
${answer}

Maximum Marks:
${marks}

Return a JSON object with exactly these fields:

{
  "taskCompletion": number,
  "reason": string
}

Rules for taskCompletion:

1.0 = The student fully satisfies the requirements of the question.

0.5 = The student partially satisfies the requirements.

0.0 = The student does not answer the question,
      gives an irrelevant answer, or provides no answer.

The score may also use values between 0.0 and 1.0 when
partial completion is appropriate.

Keep the reason short and explain which requested
information was or was not provided.

Return ONLY valid JSON.
`;

    const response = await client.responses.create({
        model: process.env.OPENAI_MODEL,
        input: prompt
    });

    const outputText = response.output_text?.trim();

    if (!outputText) {
        throw new Error(
            "OpenAI returned an empty evaluation response."
        );
    }

    let evaluation;

    try {
        evaluation = JSON.parse(outputText);
    } catch (error) {
        console.error(
            "Failed to parse OpenAI evaluation:",
            outputText
        );

        throw new Error(
            "OpenAI returned invalid JSON for answer evaluation."
        );
    }

    // Validate taskCompletion
    if (
        typeof evaluation.taskCompletion !== "number" ||
        evaluation.taskCompletion < 0 ||
        evaluation.taskCompletion > 1
    ) {
        throw new Error(
            "Invalid taskCompletion returned by OpenAI."
        );
    }

    if (
        typeof evaluation.reason !== "string"
    ) {
        throw new Error(
            "Invalid evaluation reason returned by OpenAI."
        );
    }

    return {
        taskCompletion: evaluation.taskCompletion,
        reason: evaluation.reason.trim()
    };
}

module.exports = {
    evaluateAnswer
};