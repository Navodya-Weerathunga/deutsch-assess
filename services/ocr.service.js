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


========================================================
IMPORTANT QUESTION NUMBER RULES
========================================================

15. The assessment contains numbered questions.

16. Carefully identify the printed question number immediately
associated with each student's answer.

17. Never infer a question number from the content of the answer.

18. Never reuse a previous question number.

19. Each question number must appear exactly once.

20. The question numbers must be sequential:
1, 2, 3, 4, 5, 6, 7, 8, 9, 10.

21. If an answer is clearly located under Question 7,
its questionNo MUST be 7.

22. Do not assign a question number based on the meaning
of the student's answer.

23. Before returning the JSON, verify that:

- Every question from 1 to 10 appears exactly once.
- No question number is duplicated.
- No question number is missing.
- The question numbers are in ascending order.

24. If a student's answer contains numbers, those numbers
must NOT be interpreted as the question number.

25. The printed question number on the assessment sheet
always takes priority over the content of the student's answer.


========================================================
ANSWER EXTRACTION RULES
========================================================

26. Create one object for every question.

27. questionNo must contain the actual printed question number.

28. answer must contain ONLY the student's written answer.

29. Preserve the student's original wording as closely as possible.

30. DO NOT correct grammar, spelling, vocabulary, or punctuation.

31. DO NOT translate the answer.

32. If a word is unclear, write:

[UNCLEAR]

33. If the student did not answer a question, write:

[NO ANSWER]

34. Do not include the assessment questions.

35. Do not include marks or instructions.

36. Do not include Markdown code fences.

37. Return ONLY valid JSON.

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

        // =========================================
        // Validate OCR Result
        // =========================================

        if (
            !ocrResult.answers ||
            !Array.isArray(ocrResult.answers)
        ) {

            throw new Error(
                "OCR response does not contain a valid answers array."
            );

        }

        // =========================================
        // Validate Question Numbers
        // =========================================

        const questionNumbers =
            ocrResult.answers
                .map(item => item.questionNo)
                .sort((a, b) => a - b);

        const expectedQuestionNumbers = [
            1, 2, 3, 4, 5,
            6, 7, 8, 9, 10
        ];

        const isValidQuestionNumbers =
            questionNumbers.length ===
                expectedQuestionNumbers.length &&
            questionNumbers.every(
                (number, index) =>
                    number ===
                    expectedQuestionNumbers[index]
            );

        if (!isValidQuestionNumbers) {

            console.error(
                "Invalid OCR question numbers:",
                questionNumbers
            );

            throw new Error(
                "OCR returned invalid or duplicate question numbers."
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

    }

}


module.exports =
    new OCRService();