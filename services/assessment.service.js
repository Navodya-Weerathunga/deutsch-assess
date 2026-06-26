// services/assessment.service.js

const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


class AssessmentService {

    // =============================================
    // Build GPT Prompt
    // =============================================

    buildPrompt(classDoc, transcript) {

        return `

    You are an expert German language instructor, CEFR curriculum designer, and assessment creator.

    Your responsibility is to create a written assessment based ONLY on today's class.

    ========================================================
    CLASS INFORMATION
    ========================================================

    Topic:
    ${classDoc.topic}

    CEFR Level:
    ${classDoc.level}

    ========================================================
    IMPORTANT RULES
    ========================================================

    1. Read the transcript carefully.

    2. The transcript may be written in:
    - English
    - German
    - Sinhala
    - Tamil
    - or a mixture of these languages.

    If the transcript is not in English, understand its meaning internally before generating the assessment.

    DO NOT include the translation in your response.

    3. Generate the assessment ONLY from today's lesson.

    Do NOT introduce concepts that were not taught.

    4. The assessment MUST follow the CEFR level.

    Difficulty progression:

    A1
    - Greetings
    - Introductions
    - Numbers
    - Basic vocabulary
    - Very short writing

    A2
    - Daily conversations
    - Describing people
    - Daily routine
    - Short dialogues

    B1
    - Grammar application
    - Reading comprehension
    - Writing paragraphs
    - Giving opinions

    B2
    - Formal writing
    - Advanced grammar
    - Argumentative writing
    - Critical thinking

    5. Generate ONLY written-answer questions.

    DO NOT generate:

    - Multiple Choice Questions
    - True / False
    - Matching
    - Fill in the blanks

    6. Questions should encourage students to answer in German.

    7. Every question must be based on what students learned during today's lesson.

    8. Questions must gradually increase in difficulty.

    9. Generate exactly 10 questions.

    10. Allocate marks to every question.

    11. Total marks must equal 100.

    ========================================================
    TRANSCRIPT
    ========================================================

    ${transcript}

    ========================================================
    OUTPUT FORMAT
    ========================================================

    Return ONLY valid JSON.

    {
        "title":"",
        "level":"",
        "topic":"",
        "instructions":"",
        "totalMarks":100,
        "questions":[
            {
                "questionNo":1,
                "question":"",
                "marks":10
            }
        ]
    }

    Do not include explanations.

    Do not include markdown.

    Return only JSON.

    `;

    }
    
    async generateAssessment(classDoc, cleanedTranscript) {

        console.log("========== GENERATING ASSESSMENT ==========");

        const prompt = this.buildPrompt(
            classDoc,
            cleanedTranscript
        );

        console.log("Prompt built successfully.");

        const response = await client.responses.create({

            model: process.env.OPENAI_MODEL,
            input: prompt

        });

        console.log("GPT Response received.");

        console.log(response);

        const result = response.output_text;

        try {

            console.log(result);

            return JSON.parse(result);

        }
        catch (err) {
            console.log(err);

            throw new Error("GPT returned invalid JSON.");

        }


    }

}

module.exports = new AssessmentService();