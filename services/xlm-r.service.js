const axios = require("axios");

const XLM_R_SERVICE_URL =
    process.env.XLM_R_SERVICE_URL ||
    "http://127.0.0.1:8000";

/**
 * Get German writing-quality score from XLM-R service.
 *
 * @param {string} answer
 * @param {string} cefr
 * @returns {Promise<object>}
 */
async function predictWritingScore(answer, cefr) {

    if (!answer || !answer.trim()) {
        throw new Error("Answer cannot be empty.");
    }

    if (!cefr || !cefr.trim()) {
        throw new Error("CEFR level is required.");
    }

    const response = await axios.post(
        `${XLM_R_SERVICE_URL}/predict`,
        {
            answer: answer.trim(),
            cefr: cefr.trim().toUpperCase()
        },
        {
            timeout: 60000,
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
}

module.exports = {
    predictWritingScore
};