// ============================================================
// assessment-scoring.service.js
// Combines task completion + XLM-R language quality
// ============================================================

const {
    evaluateAnswer
} = require("./answer-evaluation.service");

const {
    predictWritingScore
} = require("./xlm-r.service");


// ============================================================
// CEFR SCORE RANGES
// Based on the MERLIN dataset analysis performed during
// model development.
// ============================================================

const CEFR_RANGES = {
    A1: {
        min: 0.0,
        max: 5.0
    },

    A2: {
        min: 0.3333,
        max: 5.6667
    },

    B1: {
        min: 0.0,
        max: 6.6667
    },

    B2: {
        min: 2.6667,
        max: 8.3333
    },

    C1: {
        min: 4.3333,
        max: 10.0
    }
};


// ============================================================
// SCORING WEIGHTS
// ============================================================

const TASK_WEIGHT = 0.30;
const LANGUAGE_WEIGHT = 0.70;


// ============================================================
// CALCULATE CEFR-NORMALIZED LANGUAGE SCORE
// ============================================================

function normalizeLanguageScore(
    rawScore,
    cefr
) {

    const range = CEFR_RANGES[cefr];

    if (!range) {
        throw new Error(
            `Unsupported CEFR level: ${cefr}`
        );
    }

    let normalizedScore =
        (
            (rawScore - range.min)
            /
            (range.max - range.min)
        ) * 10;

    // Keep the score within 0–10
    normalizedScore = Math.max(
        0,
        Math.min(
            10,
            normalizedScore
        )
    );

    return normalizedScore;
}


// ============================================================
// EVALUATE ONE ANSWER
// ============================================================

async function evaluateQuestion({
    question,
    answer,
    marks,
    cefr
}) {

    if (!question) {
        throw new Error("Question is required.");
    }

    if (!answer || !answer.trim()) {

        return {
            taskCompletion: 0,
            taskReason: "No answer provided.",
            xlmScore: 0,
            languageScore: 0,
            finalPercentage: 0,
            awardedMarks: 0
        };
    }


    // --------------------------------------------------------
    // 1. TASK COMPLETION — GPT-5.4-mini
    // --------------------------------------------------------

    const taskEvaluation =
        await evaluateAnswer({
            question,
            answer,
            marks
        });


    // --------------------------------------------------------
    // 2. LANGUAGE QUALITY — XLM-R
    // --------------------------------------------------------

    const xlmPrediction =
        await predictWritingScore(
            answer,
            cefr
        );


    const rawScore =
        Number(xlmPrediction.score0_10);


    if (!Number.isFinite(rawScore)) {
        throw new Error(
            "Invalid XLM-R score returned."
        );
    }


    // --------------------------------------------------------
    // 3. CEFR NORMALIZATION
    // --------------------------------------------------------

    const languageScore =
        normalizeLanguageScore(
            rawScore,
            cefr
        );


    // --------------------------------------------------------
    // 4. COMBINE TASK + LANGUAGE
    // --------------------------------------------------------

    const taskPercentage =
        taskEvaluation.taskCompletion * 100;

    const languagePercentage =
        languageScore * 10;


    const finalPercentage =
        (
            taskPercentage * TASK_WEIGHT
        )
        +
        (
            languagePercentage * LANGUAGE_WEIGHT
        );


    // --------------------------------------------------------
    // 5. CONVERT TO QUESTION MARKS
    // --------------------------------------------------------

    const awardedMarks =
        (
            finalPercentage / 100
        ) * marks;


    return {

        taskCompletion:
            taskEvaluation.taskCompletion,

        taskReason:
            taskEvaluation.reason,

        xlmScore:
            rawScore,

        languageScore,

        finalPercentage,

        awardedMarks
    };
}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    evaluateQuestion,
    normalizeLanguageScore
};