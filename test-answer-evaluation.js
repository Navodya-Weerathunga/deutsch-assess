require("dotenv").config();

const {
    evaluateAnswer
} = require("./services/answer-evaluation.service");

async function test() {

    console.log("========================================");
    console.log("TASK vs LANGUAGE QUALITY TEST");
    console.log("========================================");

    const result = await evaluateAnswer({
        question: "Wie alt bist du? Schreibe einen ganzen Satz.",
        answer: "Ich 21 Jahre.",
        marks: 8
    });

    console.log("\nEvaluation result:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n========================================");
    console.log("TEST COMPLETED");
    console.log("========================================");
}

test().catch(error => {

    console.error("\nTEST FAILED:");
    console.error(error.message);

});