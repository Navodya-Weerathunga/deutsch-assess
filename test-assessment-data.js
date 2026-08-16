require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("./config/db");
const Answer = require("./models/Answer");
const Assessment = require("./models/Assessment");

const ANSWER_ID = "6a7ada0c1716f4d35f684ca8";

async function test() {

    console.log("========================================");
    console.log("MONGODB ASSESSMENT DATA TEST");
    console.log("========================================");

    try {

        // Connect using your existing connection
        await connectDB();

        // --------------------------------------------
        // Find submitted answer
        // --------------------------------------------

        const answerDocument =
            await Answer.findById(ANSWER_ID).lean();

        if (!answerDocument) {
            throw new Error(
                "Answer document not found."
            );
        }

        console.log("\nAnswer document found.");
        console.log(
            "Assessment ID:",
            answerDocument.assessment.toString()
        );

        // --------------------------------------------
        // Find assessment
        // --------------------------------------------

        const assessment =
            await Assessment.findById(
                answerDocument.assessment
            ).lean();

        if (!assessment) {
            throw new Error(
                "Assessment document not found."
            );
        }

        console.log(
            "Assessment:",
            assessment.title
        );

        console.log(
            "CEFR:",
            assessment.level
        );

        console.log(
            "Total marks:",
            assessment.totalMarks
        );

        // --------------------------------------------
        // Display questions
        // --------------------------------------------

        console.log("\n========================================");
        console.log("ASSESSMENT QUESTIONS");
        console.log("========================================");

        for (const question of assessment.questions) {

            console.log(
                `Q${question.questionNo} | ` +
                `${question.marks} marks | ` +
                `${question.question}`
            );
        }

        // --------------------------------------------
        // Display OCR answers
        // --------------------------------------------

        console.log("\n========================================");
        console.log("OCR ANSWERS");
        console.log("========================================");

        for (const item of answerDocument.ocrAnswers) {

            console.log(
                `Q${item.questionNo}: ${item.answer}`
            );
        }

        console.log("\n========================================");
        console.log("MONGODB TEST COMPLETED");
        console.log("========================================");

    } catch (error) {

        console.error("\n========================================");
        console.error("TEST FAILED");
        console.error("========================================");

        console.error(error);

    } finally {

        await mongoose.connection.close();

        console.log("\nMongoDB connection closed.");
    }
}

test();