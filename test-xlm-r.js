require("dotenv").config();

const {
    predictWritingScore
} = require("./services/xlm-r.service");

async function test() {

    console.log("========================================");
    console.log("EXPRESS → XLM-R SERVICE TEST");
    console.log("========================================");

    try {

        const result = await predictWritingScore(
            "Ich heiße Sanduni Perera.",
            "A1"
        );

        console.log("\nXLM-R response:");
        console.log(JSON.stringify(result, null, 2));

        console.log("\n========================================");
        console.log("TEST COMPLETED");
        console.log("========================================");

    } catch (error) {

        console.error("\n========================================");
        console.error("TEST FAILED");
        console.error("========================================");

        if (error.response) {
            console.error(
                "Python service response:",
                error.response.data
            );
        } else {
            console.error(error.message);
        }
    }
}

test();