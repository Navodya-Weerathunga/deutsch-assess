require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("./config/db");

const Answer = require("./models/Answer");
const Assessment = require("./models/Assessment");

const {
    evaluateQuestion
} = require("./services/assessment-scoring.service");


// ============================================================
// CONFIGURATION
// ============================================================

const ANSWER_ID = "6a7ada0c1716f4d35f684ca8";


// ============================================================
// MAIN TEST
// ============================================================

async function test() {

    console.log("============================================================");
    console.log("STEP 61 — FULL 10-QUESTION SCORING TEST");
    console.log("============================================================");

    try {

        // ----------------------------------------------------
        // 1. Connect to MongoDB
        // ----------------------------------------------------

        await connectDB();

        // ----------------------------------------------------
        // 2. Get student's submitted answer
        // ----------------------------------------------------

        const answerDocument =
            await Answer.findById(
                ANSWER_ID
            ).lean();

        if (!answerDocument) {
            throw new Error(
                "Answer document not found."
            );
        }

        // ----------------------------------------------------
        // 3. Get assessment
        // ----------------------------------------------------

        const assessment =
            await Assessment.findById(
                answerDocument.assessment
            ).lean();

        if (!assessment) {
            throw new Error(
                "Assessment document not found."
            );
        }

        const cefr =
            assessment.level.toUpperCase();

        console.log("\nAssessment:");
        console.log(assessment.title);

        console.log(
            "CEFR:",
            cefr
        );

        console.log(
            "Total marks:",
            assessment.totalMarks
        );

        console.log(
            "\nNumber of questions:",
            assessment.questions.length
        );

        // ----------------------------------------------------
        // 4. Prepare results
        // ----------------------------------------------------

        const results = [];

        let totalMarksAwarded = 0;

        // ----------------------------------------------------
        // 5. Evaluate every question
        // ----------------------------------------------------

        console.log("\n============================================================");
        console.log("STARTING QUESTION EVALUATION");
        console.log("============================================================");

        for (const question of assessment.questions) {

            const questionNo =
                question.questionNo;

            // Find matching OCR answer
            const ocrAnswer =
                answerDocument.ocrAnswers.find(
                    item =>
                        item.questionNo === questionNo
                );

            const studentAnswer =
                ocrAnswer?.answer || "";

            console.log(
                `\nEvaluating Q${questionNo}...`
            );

            console.log(
                "Question:",
                question.question
            );

            console.log(
                "Answer:",
                studentAnswer
            );

            // ------------------------------------------------
            // Combined evaluation
            // ------------------------------------------------

            const result =
                await evaluateQuestion({
                    question:
                        question.question,

                    answer:
                        studentAnswer,

                    marks:
                        question.marks,

                    cefr
                });

            // ------------------------------------------------
            // Store result
            // ------------------------------------------------

            results.push({
                questionNo,
                question:
                    question.question,

                answer:
                    studentAnswer,

                allocatedMarks:
                    question.marks,

                taskCompletion:
                    result.taskCompletion,

                taskReason:
                    result.taskReason,

                xlmScore:
                    result.xlmScore,

                languageScore:
                    result.languageScore,

                finalPercentage:
                    result.finalPercentage,

                awardedMarks:
                    result.awardedMarks
            });

            totalMarksAwarded +=
                result.awardedMarks;

            // ------------------------------------------------
            // Display result
            // ------------------------------------------------

            console.log(
                `Task completion: ${result.taskCompletion}`
            );

            console.log(
                `XLM-R score: ${result.xlmScore.toFixed(2)}/10`
            );

            console.log(
                `Language score: ${result.languageScore.toFixed(2)}/10`
            );

            console.log(
                `Awarded: ${result.awardedMarks.toFixed(2)}/${question.marks}`
            );
        }

        // ----------------------------------------------------
        // 6. Final result
        // ----------------------------------------------------

        console.log("\n============================================================");
        console.log("FINAL SCORING RESULT");
        console.log("============================================================");

        for (const result of results) {

            console.log(
                `Q${result.questionNo} | ` +
                `Task: ${result.taskCompletion.toFixed(2)} | ` +
                `XLM-R: ${result.xlmScore.toFixed(2)}/10 | ` +
                `Language: ${result.languageScore.toFixed(2)}/10 | ` +
                `Marks: ${result.awardedMarks.toFixed(2)}/` +
                `${result.allocatedMarks}`
            );
        }

        console.log(
            "------------------------------------------------------------"
        );

        console.log(
            `TOTAL: ${totalMarksAwarded.toFixed(2)} / ${assessment.totalMarks}`
        );

        // ------------------------------------------------------------
        // 7. SAVE RESULTS TO MONGODB
        // ------------------------------------------------------------

        console.log("\n============================================================");
        console.log("SAVING RESULTS TO MONGODB");
        console.log("============================================================");

        const questionResults = results.map(result => ({
            questionNo: result.questionNo,

            taskCompletion:
                result.taskCompletion,

            taskReason:
                result.taskReason,

            xlmScore:
                result.xlmScore,

            languageScore:
                result.languageScore,

            finalPercentage:
                result.finalPercentage,

            allocatedMarks:
                result.allocatedMarks,

            awardedMarks:
                result.awardedMarks
        }));

        await Answer.findByIdAndUpdate(
            ANSWER_ID,
            {
                $set: {
                    questionResults,
                    totalMarksAwarded:
                        Number(totalMarksAwarded.toFixed(2)),

                    status: "MARKED",

                    markedAt: new Date()
                }
            },
            {
                new: true
            }
        );

        console.log("✅ Question results saved.");
        console.log(
            `✅ Total marks saved: ${totalMarksAwarded.toFixed(2)} / ${assessment.totalMarks}`
        );
        console.log("✅ Status changed to MARKED.");

        console.log(
            "============================================================"
        );

        console.log(
            "STEP 61 TEST COMPLETED"
        );

        console.log(
            "============================================================"
        );

        // ----------------------------------------------------
        // IMPORTANT:
        // We are NOT saving anything to MongoDB yet.
        // ----------------------------------------------------

    } catch (error) {

        console.error("\n============================================================");
        console.error("STEP 61 FAILED");
        console.error("============================================================");

        console.error(error);

    } finally {

        await mongoose.connection.close();

        console.log(
            "\nMongoDB connection closed."
        );
    }
}


// ============================================================
// RUN
// ============================================================

test();