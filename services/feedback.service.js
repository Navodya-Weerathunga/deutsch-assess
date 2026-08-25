// ============================================================
// feedback.service.js
//
// Generates personalized overall feedback for a student
// after a complete German assessment has been evaluated.
//
// IMPORTANT:
// This service DOES NOT calculate marks.
// It only interprets the existing assessment results.
//
// It considers:
// - CEFR level
// - Student's actual answers
// - Assessment questions
// - Task completion
// - Task completion reasons
// - XLM-R language scores
// - Awarded marks
//
// The purpose is to provide useful learning feedback
// for the student.
// ============================================================

const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// ============================================================
// Generate Overall Student Feedback
// ============================================================

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

    if (
        !level ||
        typeof level !== "string"
    ) {

        throw new Error(
            "CEFR level is required."
        );

    }


    if (
        !assessmentTitle ||
        typeof assessmentTitle !== "string"
    ) {

        throw new Error(
            "Assessment title is required."
        );

    }


    if (
        !Array.isArray(questions) ||
        questions.length === 0
    ) {

        throw new Error(
            "Question results are required."
        );

    }


    // --------------------------------------------------------
    // Calculate official percentage
    //
    // The application calculates this.
    // The LLM must NOT recalculate or modify the mark.
    // --------------------------------------------------------

    const percentage =
        totalMarks > 0
            ? (
                totalMarksAwarded /
                totalMarks
            ) * 100
            : 0;


    // --------------------------------------------------------
    // Prepare question-level information
    // --------------------------------------------------------

    const questionData =
        questions.map(
            item => ({

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
                    item.maximumMarks ??
                    item.allocatedMarks ??
                    0,

                awardedMarks:
                    item.awardedMarks ?? 0

            })
        );


    // ========================================================
    // LLM PROMPT
    // ========================================================

    const prompt = `

You are an experienced German language teacher and
CEFR-aligned language learning assistant.

Your task is to review a student's completed German
written assessment and generate detailed, personalized
learning feedback.

The feedback will be shown directly to the student.

============================================================
STUDENT AND ASSESSMENT INFORMATION
============================================================

Student CEFR Level:
${level}

Assessment:
${assessmentTitle}

Official Score:
${totalMarksAwarded} / ${totalMarks}

Official Percentage:
${percentage.toFixed(2)}%


============================================================
IMPORTANT SCORING RULE
============================================================

The official score has already been calculated by the
assessment system.

DO NOT:

- Recalculate the student's marks.
- Change the student's marks.
- Suggest a different score.
- Invent scores.
- Invent mistakes.
- Assign a new CEFR level.

Your role is to INTERPRET the provided results and give
educational feedback.


============================================================
QUESTION-LEVEL DATA
============================================================

The following information represents the student's actual
assessment performance.

${JSON.stringify(
    questionData,
    null,
    2
)}


============================================================
ANALYSIS REQUIREMENTS
============================================================

Review the student's answers question by question.

Consider ALL of the following:

1. Whether the student completed the requested task.

2. Whether the student's answer communicates the required
   meaning.

3. The task-completion result and reason.

4. The XLM-R language-quality score.

5. The CEFR-normalized language score.

6. The marks awarded for each question.

7. The student's actual German language production.

8. Recurring patterns across multiple answers.

Do not judge the student from the total percentage alone.


============================================================
GRAMMAR ANALYSIS
============================================================

Analyze the student's ACTUAL German answers for grammar.

Look for evidence of:

- Sentence structure
- Word order
- Verb usage
- Verb conjugation
- Articles
- Noun forms
- Pronouns
- Prepositions
- Agreement
- Basic grammatical patterns appropriate to the
  student's CEFR level

Only mention a grammatical weakness when there is
evidence in the student's answers.

Do NOT invent grammar mistakes.

If the student's grammar is appropriate for the level,
say so.

Grammar feedback must be appropriate to the student's
CEFR level.


============================================================
VOCABULARY ANALYSIS
============================================================

Analyze the student's ACTUAL vocabulary usage.

Consider:

- Appropriate word choice
- Vocabulary range
- Use of lesson-related vocabulary
- Repetition
- Incorrect word choices
- Missing vocabulary
- Ability to express the required meaning

Only mention vocabulary weaknesses supported by the
student's answers.

Do NOT invent vocabulary problems.

Vocabulary expectations must match the student's
CEFR level.


============================================================
TASK PERFORMANCE ANALYSIS
============================================================

Analyze whether the student successfully completed the
requested tasks.

Use:

- taskCompletion
- taskReason
- awardedMarks
- actual answer

Identify:

- Tasks completed successfully
- Tasks partially completed
- Information that was missing
- Questions where the student performed particularly well


============================================================
CEFR LEVEL REQUIREMENT
============================================================

The feedback MUST be appropriate for the student's
current CEFR level.

The CEFR level determines the expected complexity of
language.

For A1 students, focus on:

- Basic vocabulary
- Simple sentence structures
- Basic grammar
- Basic personal information
- Simple everyday communication
- Short understandable written responses

For A2 students, focus more on:

- Connected sentences
- Everyday descriptions
- Basic explanations
- Grammar application
- More developed everyday communication

For B1 students, focus more on:

- Connected writing
- Grammar accuracy in context
- Explanation of ideas
- Vocabulary range
- Coherent written communication

For B2 students, focus more on:

- Complex sentence structures
- Detailed explanations
- Coherent writing
- More precise vocabulary
- Grammatical accuracy
- Independent language production

Do not judge an A1 student using B1/B2 expectations.

Do not praise an A1 student for using advanced language
simply because it is advanced.

Do not introduce language requirements that are
unreasonable for the student's CEFR level.


============================================================
OVERALL PERFORMANCE
============================================================

Determine a descriptive performance level based on the
provided results.

Use one of:

- Excellent
- Very Good
- Good
- Satisfactory
- Needs Improvement

The description must be consistent with the student's
actual performance.

Do not use the performance level as a replacement for
the official numerical score.


============================================================
STRENGTHS
============================================================

Identify 2 to 5 specific strengths.

Strengths should be based on:

- Actual answers
- Task completion
- Language quality
- Marks
- Appropriate CEFR-level performance

Avoid generic statements such as:

"You did well."

Instead explain WHAT the student did well.


============================================================
AREAS FOR IMPROVEMENT
============================================================

Identify the most important areas that the student should
work on.

Prioritize recurring or meaningful weaknesses.

Do not list every small possible mistake.

Focus on improvements that would provide the greatest
learning benefit.


============================================================
PERSONALIZED RECOMMENDATIONS
============================================================

Provide practical recommendations that the student can
actually follow.

Recommendations may include:

- Grammar practice
- Vocabulary practice
- Sentence-writing practice
- Topic-specific practice
- German writing exercises
- Review of common sentence patterns
- Practice with everyday communication

Recommendations must be appropriate for the student's
CEFR level.


============================================================
LEVEL ASSESSMENT
============================================================

Explain whether the student's performance is generally
consistent with the expected performance for their
current CEFR level.

IMPORTANT:

Do NOT assign a new CEFR level.

Do NOT say:

"You are A2."

when the student is currently being assessed at A1.

Instead say things such as:

"Your performance is generally appropriate for A1,
with further practice needed in sentence accuracy."

The purpose is to explain how the student is progressing
within their current level.


============================================================
ENCOURAGEMENT
============================================================

End with a short, sincere and motivating message.

The message should:

- Recognize the student's effort.
- Encourage continued German learning.
- Be appropriate for the student's performance.
- Avoid exaggerated praise.


============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.

Use EXACTLY this structure:

{
    "performanceLevel": "",

    "summary": "",

    "strengths": [
        ""
    ],

    "grammarFeedback": {
        "strengths": [
            ""
        ],
        "areasForImprovement": [
            ""
        ]
    },

    "vocabularyFeedback": {
        "strengths": [
            ""
        ],
        "areasForImprovement": [
            ""
        ]
    },

    "taskPerformance": {
        "strengths": [
            ""
        ],
        "areasForImprovement": [
            ""
        ]
    },

    "areasForImprovement": [
        ""
    ],

    "recommendations": [
        ""
    ],

    "levelAssessment": "",

    "encouragement": ""
}

Return ONLY the JSON object.

Do not return:

- Markdown
- Code fences
- Explanations outside the JSON
- Additional fields
`;


    // ========================================================
    // CALL OPENAI
    // ========================================================

    const response =
        await client.responses.create({

            model:
                process.env.OPENAI_MODEL,

            input:
                prompt

        });


    // ========================================================
    // READ RESPONSE
    // ========================================================

    const outputText =
        response.output_text?.trim();


    if (!outputText) {

        throw new Error(
            "OpenAI returned an empty feedback response."
        );

    }


    // ========================================================
    // PARSE JSON
    // ========================================================

    let feedback;

    try {

        feedback =
            JSON.parse(outputText);

    }
    catch (error) {

        console.error(
            "Failed to parse feedback response:"
        );

        console.error(
            outputText
        );

        throw new Error(
            "OpenAI returned invalid JSON for student feedback."
        );

    }


    // ========================================================
    // VALIDATE RESPONSE
    // ========================================================

    if (
        typeof feedback.performanceLevel !==
        "string"
    ) {

        throw new Error(
            "Invalid performanceLevel in feedback."
        );

    }


    if (
        typeof feedback.summary !==
        "string"
    ) {

        throw new Error(
            "Invalid summary in feedback."
        );

    }


    if (
        !Array.isArray(
            feedback.strengths
        )
    ) {

        throw new Error(
            "Invalid strengths in feedback."
        );

    }


    if (
        !feedback.grammarFeedback ||
        !Array.isArray(
            feedback.grammarFeedback.strengths
        ) ||
        !Array.isArray(
            feedback.grammarFeedback.areasForImprovement
        )
    ) {

        throw new Error(
            "Invalid grammar feedback."
        );

    }


    if (
        !feedback.vocabularyFeedback ||
        !Array.isArray(
            feedback.vocabularyFeedback.strengths
        ) ||
        !Array.isArray(
            feedback.vocabularyFeedback.areasForImprovement
        )
    ) {

        throw new Error(
            "Invalid vocabulary feedback."
        );

    }


    if (
        !feedback.taskPerformance ||
        !Array.isArray(
            feedback.taskPerformance.strengths
        ) ||
        !Array.isArray(
            feedback.taskPerformance.areasForImprovement
        )
    ) {

        throw new Error(
            "Invalid task performance feedback."
        );

    }


    if (
        !Array.isArray(
            feedback.areasForImprovement
        )
    ) {

        throw new Error(
            "Invalid areasForImprovement in feedback."
        );

    }


    if (
        !Array.isArray(
            feedback.recommendations
        )
    ) {

        throw new Error(
            "Invalid recommendations in feedback."
        );

    }


    if (
        typeof feedback.levelAssessment !==
        "string"
    ) {

        throw new Error(
            "Invalid levelAssessment in feedback."
        );

    }


    if (
        typeof feedback.encouragement !==
        "string"
    ) {

        throw new Error(
            "Invalid encouragement in feedback."
        );

    }


    // ========================================================
    // RETURN CLEAN FEEDBACK
    // ========================================================

    return {

        performanceLevel:
            feedback.performanceLevel.trim(),

        summary:
            feedback.summary.trim(),

        strengths:
            feedback.strengths
                .map(
                    item =>
                        String(item).trim()
                ),

        grammarFeedback: {

            strengths:
                feedback.grammarFeedback.strengths
                    .map(
                        item =>
                            String(item).trim()
                    ),

            areasForImprovement:
                feedback.grammarFeedback.areasForImprovement
                    .map(
                        item =>
                            String(item).trim()
                    )

        },

        vocabularyFeedback: {

            strengths:
                feedback.vocabularyFeedback.strengths
                    .map(
                        item =>
                            String(item).trim()
                    ),

            areasForImprovement:
                feedback.vocabularyFeedback.areasForImprovement
                    .map(
                        item =>
                            String(item).trim()
                    )

        },

        taskPerformance: {

            strengths:
                feedback.taskPerformance.strengths
                    .map(
                        item =>
                            String(item).trim()
                    ),

            areasForImprovement:
                feedback.taskPerformance.areasForImprovement
                    .map(
                        item =>
                            String(item).trim()
                    )

        },

        areasForImprovement:
            feedback.areasForImprovement
                .map(
                    item =>
                        String(item).trim()
                ),

        recommendations:
            feedback.recommendations
                .map(
                    item =>
                        String(item).trim()
                ),

        levelAssessment:
            feedback.levelAssessment.trim(),

        encouragement:
            feedback.encouragement.trim()

    };

}


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    generateOverallFeedback
};