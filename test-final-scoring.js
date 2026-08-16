require("dotenv").config();

const {
    evaluateAnswer
} = require("./services/answer-evaluation.service");

// ============================================================
// STEP 44
// COMPLETE BACKEND SCORING TEST
// ============================================================

// MERLIN observed score ranges by CEFR
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

// ------------------------------------------------------------
// Assessment information
// ------------------------------------------------------------

const assessmentCEFR = "A1";

const questions = [
    {
        questionNo: 1,
        question: "Wie heißt du? Schreibe deinen Namen.",
        answer: "Ich heiße Sanduni Perera.",
        marks: 8
    },
    {
        questionNo: 2,
        question: "Wie alt bist du? Schreibe einen ganzen Satz.",
        answer: "Ich bin einundzwanzig Jahre alt.",
        marks: 8
    },
    {
        questionNo: 3,
        question:
            "Woher kommst du und wo wohnst du? Schreibe zwei Sätze.",
        answer:
            "Ich komme aus Sri Lanka.\nIch wohne in Kandy.",
        marks: 12
    },
    {
        questionNo: 4,
        question:
            "Was ist dein Beruf? Wenn du nicht arbeitest, schreibe das auch.",
        answer:
            "Ich bin Studentin. Ich arbeite nicht.",
        marks: 10
    },
    {
        questionNo: 5,
        question:
            "Was ist dein Hobby? Schreibe einen Satz.",
        answer:
            "Mein Hobby ist Musik hören.",
        marks: 8
    },
    {
        questionNo: 6,
        question:
            "Hast du ein Handy? Schreibe auch deine Handynummer.",
        answer:
            "Ja, ich habe ein Handy.\nMeine Handynummer ist 076 1234567.",
        marks: 12
    },
    {
        questionNo: 7,
        question:
            "Buchstabiere deinen Vornamen oder deinen Familiennamen.",
        answer:
            "S - A - N - D - U - N - I",
        marks: 12
    },
    {
        questionNo: 8,
        question:
            "Welche Sprachen sprichst du? Schreibe einen Satz.",
        answer:
            "Ich spreche Singhalesisch und ein bisschen Englisch.",
        marks: 10
    },
    {
        questionNo: 9,
        question:
            "Schreibe vier Sätze über Einkaufen: Wann kaufst du ein? Wo kaufst du ein? Was kaufst du ein? Mit wem kaufst du ein?",
        answer:
            "Ich kaufe am Samstag ein.\n" +
            "Ich kaufe im Supermarkt.\n" +
            "Ich kaufe Obst, Gemüse und Milch.\n" +
            "Ich kaufe mit meiner Mutter ein.",
        marks: 12
    },
    {
        questionNo: 10,
        question:
            "Schreibe eine kurze Vorstellung über dich. " +
            "Verwende dabei: Name, Alter, Herkunftsland, Wohnort, Beruf, Sprache und Hobby.",
        answer:
            "Ich heiße Sanduni Perera.\n" +
            "Ich bin einundzwanzig Jahre alt.\n" +
            "Ich komme aus Sri Lanka.\n" +
            "Ich wohne in Kandy.\n" +
            "Ich bin Studentin.\n" +
            "Ich spreche Singhalesisch und Englisch.\n" +
            "Mein Hobby ist Musik hören.",
        marks: 8
    }
];

// ------------------------------------------------------------
// Existing XLM-R predictions
// These are the predictions already obtained from your
// verified XLM-R model for this exact answer sheet.
// ------------------------------------------------------------

const xlmPredictions = {
    1: 1.66,
    2: 3.67,
    3: 3.64,
    4: 4.12,
    5: 3.66,
    6: 3.67,
    7: 2.74,
    8: 3.18,
    9: 4.50,
    10: 4.35
};

// ------------------------------------------------------------
// Scoring configuration
// ------------------------------------------------------------

const TASK_WEIGHT = 0.50;
const LANGUAGE_WEIGHT = 0.50;

const cefrRange = CEFR_RANGES[assessmentCEFR];

if (!cefrRange) {
    throw new Error(
        `Unsupported CEFR level: ${assessmentCEFR}`
    );
}

// ------------------------------------------------------------
// Main test
// ------------------------------------------------------------

async function runScoringTest() {

    console.log("============================================================");
    console.log("STEP 44 — COMPLETE BACKEND SCORING TEST");
    console.log("============================================================");

    console.log(`CEFR Level: ${assessmentCEFR}`);
    console.log(`Task Weight: ${TASK_WEIGHT * 100}%`);
    console.log(`Language Weight: ${LANGUAGE_WEIGHT * 100}%`);

    console.log("\nStarting task evaluation...\n");

    const results = [];

    for (const item of questions) {

        console.log(
            `Evaluating Q${item.questionNo}...`
        );

        // ----------------------------------------------------
        // 1. LLM task completion
        // ----------------------------------------------------

        const taskEvaluation = await evaluateAnswer({
            question: item.question,
            answer: item.answer,
            marks: item.marks
        });

        // ----------------------------------------------------
        // 2. Existing XLM-R prediction
        // ----------------------------------------------------

        const rawXlmScore =
            xlmPredictions[item.questionNo];

        // ----------------------------------------------------
        // 3. CEFR-aware normalization
        // ----------------------------------------------------

        let normalizedLanguageScore =
            (
                (rawXlmScore - cefrRange.min)
                /
                (cefrRange.max - cefrRange.min)
            ) * 10;

        // Keep within 0–10
        normalizedLanguageScore = Math.max(
            0,
            Math.min(
                10,
                normalizedLanguageScore
            )
        );

        // ----------------------------------------------------
        // 4. Combine task + language scores
        // ----------------------------------------------------

        const taskPercentage =
            taskEvaluation.taskCompletion * 100;

        const languagePercentage =
            normalizedLanguageScore * 10;

        const finalPercentage =
            (
                taskPercentage * TASK_WEIGHT
            ) +
            (
                languagePercentage * LANGUAGE_WEIGHT
            );

        // ----------------------------------------------------
        // 5. Convert to question marks
        // ----------------------------------------------------

        const awardedMarks =
            (
                finalPercentage / 100
            ) * item.marks;

        results.push({
            questionNo: item.questionNo,
            taskCompletion:
                taskEvaluation.taskCompletion,
            taskReason:
                taskEvaluation.reason,
            xlmScore:
                rawXlmScore,
            languageScore:
                normalizedLanguageScore,
            finalPercentage,
            allocatedMarks:
                item.marks,
            awardedMarks
        });
    }

    // --------------------------------------------------------
    // Final total
    // --------------------------------------------------------

    const totalMarks = results.reduce(
        (sum, result) =>
            sum + result.awardedMarks,
        0
    );

    console.log("\n");
    console.log("============================================================");
    console.log("COMPLETE SCORING RESULTS");
    console.log("============================================================");

    for (const result of results) {

        console.log(
            `Q${result.questionNo} | ` +
            `Task: ${result.taskCompletion.toFixed(2)} | ` +
            `XLM-R: ${result.xlmScore.toFixed(2)} | ` +
            `Language: ${result.languageScore.toFixed(2)}/10 | ` +
            `Marks: ${result.awardedMarks.toFixed(2)}/` +
            `${result.allocatedMarks}`
        );
    }

    console.log("------------------------------------------------------------");

    console.log(
        `TOTAL: ${totalMarks.toFixed(2)} / 100`
    );

    console.log("============================================================");
    console.log("STEP 44 TEST COMPLETED");
    console.log("============================================================");
}

runScoringTest().catch(error => {

    console.error("\n============================================================");
    console.error("STEP 44 FAILED");
    console.error("============================================================");

    console.error(error);
});