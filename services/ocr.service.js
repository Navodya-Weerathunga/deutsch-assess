// services/ocr.service.js

const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


class OCRService {


    // =============================================
    // Extract Text From Answer File
    // =============================================

    async extractText(filePath, fileType) {

        console.log(
            "========== OCR PROCESS STARTED =========="
        );

        console.log(
            "File:",
            filePath
        );

        console.log(
            "File type:",
            fileType
        );


        // -----------------------------------------
        // Check file
        // -----------------------------------------

        if (!fs.existsSync(filePath)) {

            throw new Error(
                "Answer file was not found."
            );

        }


        // -----------------------------------------
        // Read file
        // -----------------------------------------

        const fileBuffer =
            fs.readFileSync(filePath);


        const base64File =
            fileBuffer.toString("base64");


        // -----------------------------------------
        // Build data URL
        // -----------------------------------------

        const dataUrl =
            `data:${fileType};base64,${base64File}`;


        // -----------------------------------------
        // OCR Prompt
        // -----------------------------------------

        const prompt = `

You are an OCR transcription system for a German language assessment.

Your task is to read the student's uploaded answer sheet and transcribe the student's answers exactly as written.

IMPORTANT RULES:

1. Extract ONLY the text written by the student.

2. The student's answers may be handwritten.

3. The answers are expected to be mainly in German.

4. DO NOT translate the student's answers.

5. DO NOT correct grammar, spelling, vocabulary, or punctuation.

6. DO NOT improve the student's German.

7. DO NOT rewrite sentences.

8. Preserve the student's original wording as closely as possible.

9. If a word is unclear, do NOT invent a word.

10. If a word cannot be confidently recognized, write:
[UNCLEAR]

11. Preserve the order of the answers.

12. Ignore:
- printed questions
- instructions
- marks
- page numbers
- headers
- teacher comments
- other non-answer content

13. Return the result as valid JSON only.

14. The JSON must follow exactly this structure:

{
    "answers": [
        {
            "questionNo": 1,
            "answer": ""
        }
    ]
}

15. Create one object for every question visible on the assessment.

16. \`questionNo\` must contain the question number.

17. \`answer\` must contain ONLY the student's written answer.

18. Preserve the student's original wording exactly as written.

19. DO NOT correct grammar, spelling, vocabulary, or punctuation.

20. DO NOT translate the answer.

21. If a word is unclear, write "[UNCLEAR]".

22. If the student did not answer a question, write "[NO ANSWER]".

23. Do not include the assessment questions.

24. Do not include marks or instructions.

25. Do not include Markdown code fences.

26. Return ONLY valid JSON.

27. If a question has no visible answer, write:

[NO ANSWER]

The extracted text will later be provided to an AI assessment model, so accuracy is more important than correcting the student's language.

`;


        // -----------------------------------------
        // OpenAI Responses API
        // -----------------------------------------

        let content;

        if (
            fileType === "image/jpeg" ||
            fileType === "image/png"
        ) {

            content = [

                {
                    type: "input_text",
                    text: prompt
                },

                {
                    type: "input_image",
                    image_url: dataUrl
                }

            ];

        }
        else if (
            fileType === "application/pdf"
        ) {

            const uploadedFile =
                await client.files.create({

                    file: fs.createReadStream(filePath),

                    purpose: "user_data"

                });


            content = [

                {
                    type: "input_text",
                    text: prompt
                },

                {
                    type: "input_file",
                    file_id: uploadedFile.id
                }

            ];

        }
        else {

            throw new Error(
                "Unsupported answer file type."
            );

        }


        const response =
            await client.responses.create({

                model:
                    process.env.OPENAI_OCR_MODEL ||
                    "gpt-5-mini",

                input: [

                    {

                        role: "user",

                        content

                    }

                ]

            });
        // -----------------------------------------
        // Extract output
        // -----------------------------------------

        const extractedText =
            response.output_text;


        if (
            !extractedText ||
            extractedText.trim() === ""
        ) {

            throw new Error(
                "OCR returned empty text."
            );

        }


        let ocrResult;

        try {

            ocrResult =
                JSON.parse(extractedText);

        }
        catch (error) {

            console.error(
                "OCR returned invalid JSON:"
            );

            console.error(
                extractedText
            );

            throw new Error(
                "OCR returned invalid JSON."
            );

        }


        if (
            !ocrResult.answers ||
            !Array.isArray(ocrResult.answers)
        ) {

            throw new Error(
                "OCR response does not contain a valid answers array."
            );

        }


        console.log(
            "========== OCR RESULT =========="
        );

        console.log(
            JSON.stringify(
                ocrResult,
                null,
                2
            )
        );


        return ocrResult;

        console.log(
            "========== OCR RESULT =========="
        );

        console.log(
            extractedText
        );


        return extractedText.trim();

    }

}


module.exports =
    new OCRService();