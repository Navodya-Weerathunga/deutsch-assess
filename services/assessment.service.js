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

    You are an expert German language teacher, CEFR-aligned assessment designer,
    and educational assessment specialist.

    Your task is to create a written German language assessment based STRICTLY
    on the content taught during the class represented by the transcript.

    The assessment will be given to students after the class to reinforce,
    practice, and evaluate what they learned during that specific lesson.


    ========================================================
    CLASS INFORMATION
    ========================================================

    Class Topic:
    ${classDoc.topic}

    CEFR Level:
    ${classDoc.level}


    ========================================================
    PRIMARY OBJECTIVE
    ========================================================

    The most important requirement is:

    CREATE THE ASSESSMENT FROM THE ACTUAL CLASS CONTENT.

    The transcript is the PRIMARY SOURCE OF TRUTH.

    The class topic and CEFR level provide additional context, but they MUST NOT
    be used to introduce concepts that were not actually taught in the class.

    For example:

    If the transcript teaches German numbers, ages, and simple questions,
    the assessment should focus on those concepts.

    Do NOT create questions about unrelated topics simply because they are
    normally associated with the student's CEFR level.


    ========================================================
    TRANSCRIPT LANGUAGE
    ========================================================

    The transcript may contain:

    - German
    - English
    - Sinhala
    - Tamil
    - or a mixture of these languages.

    The transcript may also contain:

    - Speech-recognition errors
    - Incorrect German spelling
    - Repeated phrases
    - Incomplete sentences
    - Informal classroom conversation
    - Misheard German words

    You must interpret the meaning of the transcript using the surrounding
    context.

    If Sinhala or Tamil is used to explain a German concept, understand the
    meaning internally.

    DO NOT translate the transcript in the output.

    DO NOT include transcript translations in the assessment.

    Ignore meaningless speech-recognition errors when the intended meaning
    can be determined from the surrounding context.


    ========================================================
    IDENTIFY THE LESSON CONTENT
    ========================================================

    Before creating the questions, internally identify:

    1. Main lesson topics
    2. German vocabulary taught
    3. Grammar structures taught
    4. Sentence patterns taught
    5. Communication patterns taught
    6. Examples practiced by the teacher
    7. Examples practiced by students
    8. Important rules or distinctions explained
    9. Exercises or activities performed during the class

    Use these identified learning points to create the assessment.

    Do NOT output this analysis.


    ========================================================
    FULL TRANSCRIPT COVERAGE
    ========================================================

    You MUST consider the ENTIRE transcript from beginning to end.

    Do NOT create the assessment primarily from:

    - The first topic
    - The first few minutes
    - The first examples
    - The most recently mentioned topic

    The transcript may contain multiple learning activities or subtopics
    within the same class.

    Identify ALL significant German language content taught during the
    entire lesson.

    When multiple meaningful topics were taught, distribute the assessment
    across those topics according to:

    - Their importance
    - Amount of teaching time
    - Number of examples
    - Number of exercises
    - Repetition
    - Explicit explanation by the teacher

    For example, if the class contains:

    - Self-introduction
    - Personal information
    - Numbers
    - Phone numbers
    - Spelling
    - Shopping
    - Food vocabulary
    - Prices

    then the assessment should represent several of these areas rather than
    focusing almost entirely on self-introduction.

    Do NOT give equal weight automatically to every topic.

    Give greater weight to concepts that:

    - Were explained in detail
    - Were practiced repeatedly
    - Were demonstrated with examples
    - Occupied a significant portion of the lesson
    - Were explicitly identified by the teacher as lesson content

    Ignore:

    - Technical problems
    - Administrative discussion
    - Unrelated conversation
    - Greetings that are not part of the lesson
    - Meaningless speech-recognition errors


    ========================================================
    LESSON CONTENT DISTRIBUTION
    ========================================================

    Before generating the questions, internally create a list of the major
    learning points found throughout the ENTIRE transcript.

    Determine which learning points are significant enough to assess.

    The final 10 questions should represent the important content taught
    during the class.

    Do NOT allow one small part of the lesson to dominate the entire
    assessment.

    If several major topics were taught, include questions from multiple
    topics.

    A single minor learning point should normally not receive more than
    2 questions.

    A major learning point may receive more questions when it represents
    a substantial portion of the lesson.


    ========================================================
    STRICT CONTENT BOUNDARY
    ========================================================

    Every question MUST be traceable to something taught or practiced
    in the transcript.

    Do NOT introduce:

    - New grammar
    - New vocabulary
    - New sentence structures
    - New communication situations
    - Advanced concepts
    - Unrelated CEFR topics

    unless they were actually taught or practiced during the class.

    The assessment should test what students learned in THIS CLASS,
    not their general German knowledge.

    The CEFR level determines the complexity of the assessment, but it
    does NOT give permission to introduce new lesson content.

    IMPORTANT:

    Do not infer that a concept was taught merely because it is:

    - Common at this CEFR level
    - Related to another concept taught in the class
    - Logically associated with the lesson
    - A common real-world use of the vocabulary

    For example, if the transcript teaches numbers and phone numbers,
    do not assume that house numbers, postal codes, prices, dates, or
    addresses were taught unless they are explicitly present in the
    transcript.

    A concept must be supported by the transcript itself.


    ========================================================
    CEFR LEVEL REQUIREMENT
    ========================================================

    The assessment MUST match the class CEFR level.


    A1:

    - Very basic German
    - Basic vocabulary
    - Simple sentence structures
    - Basic questions and answers
    - Short written responses
    - Simple everyday communication
    - Minimal grammatical complexity

    A2:

    - More developed everyday communication
    - Short connected sentences
    - Simple descriptions
    - Simple explanations
    - Basic grammar application
    - Short dialogues or situations

    B1:

    - Connected writing
    - Grammar application in context
    - Explanation of ideas
    - Reading/comprehension-based writing
    - Personal opinions where supported by the lesson
    - Short paragraphs

    B2:

    - More complex sentence structures
    - Detailed explanations
    - Formal or semi-formal writing where appropriate
    - Argumentation or justification where supported by the lesson
    - Critical use of language
    - Longer, coherent written responses

    IMPORTANT:

    Do not automatically use advanced CEFR features simply because the
    class level is B1 or B2.

    The transcript determines WHAT is assessed.

    The CEFR level determines HOW COMPLEXLY that content should be assessed.


    ========================================================
    QUESTION TYPE
    ========================================================

    Generate ONLY written-answer questions.

    Students must write their answers.

    DO NOT generate:

    - Multiple Choice Questions
    - True / False questions
    - Matching questions
    - Fill-in-the-blank questions
    - Selecting answers
    - Yes/No questions requiring only one word
    - Questions where the answer can simply be copied from the question

    Questions should require students to PRODUCE German.


    ========================================================
    QUESTION LANGUAGE
    ========================================================

    The student must answer ALL assessment questions in German.


    A1:

    - The "question" field MUST contain ONLY the German question.
    - The "englishQuestion" field MUST contain ONLY the English translation.
    - NEVER put the English translation inside the "question" field.
    - Every question MUST have an English translation.

    Example:

    {
        "questionNo": 1,
        "question": "Wie heißt du?",
        "englishQuestion": "What is your name?",
        "marks": 5
    }


    A2:

    - The "question" field MUST contain the German question.
    - The "englishQuestion" field MAY contain a short English clarification
    only when necessary.
    - If no clarification is necessary, use an empty string.
    - Do not unnecessarily translate every question.


    B1:

    - The "question" field MUST contain the German question.
    - The "englishQuestion" field MUST be an empty string.


    B2:

    - The "question" field MUST contain the German question.
    - The "englishQuestion" field MUST be an empty string.


    The English translation or clarification must NEVER:

    - Provide the answer
    - Introduce new information
    - Introduce vocabulary that changes the expected answer
    - Make the question easier by giving away the answer


    ========================================================
    CONTENT BALANCE
    ========================================================

    When the transcript contains multiple major learning areas, the
    assessment MUST represent those areas.

    Do NOT allow one topic to dominate the assessment simply because it
    appeared earlier in the transcript.

    First identify the major learning areas and estimate their importance
    based on:

    - Amount of teaching time
    - Number of examples
    - Number of exercises
    - Repetition by the teacher
    - Explicit explanation of the concept

    Then distribute the 10 questions accordingly.

    For example, if the lesson contains:

    1. Personal information
    2. Numbers
    3. Phone numbers
    4. Spelling
    5. Shopping
    6. Prices

    the assessment should contain questions from several of these areas,
    rather than using most questions for personal information.

    A single minor learning point should normally not receive more than
    2 questions.

    A major learning point may receive more questions when it represents
    a substantial part of the lesson.


    ========================================================
    QUESTION VARIETY
    ========================================================

    The 10 questions MUST NOT be repetitive.

    Do not create several questions that test exactly the same skill.

    For example, if the lesson teaches numbers:

    BAD:

    1. Write 4 in German.
    2. Write 7 in German.
    3. Write 9 in German.
    4. Write 12 in German.

    This is repetitive.

    Instead, when supported by the transcript, use varied tasks such as:

    - Vocabulary production
    - Sentence construction
    - Question and answer
    - Applying lesson content in a situation
    - Short dialogue
    - Personal response
    - Describing something
    - Using learned grammar
    - Short written communication

    ONLY use these task types when they are supported by the transcript.


    ========================================================
    QUESTION PURPOSE
    ========================================================

    Each question should assess a different or meaningfully expanded
    learning objective.

    Avoid generating consecutive questions that ask the student to provide
    the same type of information.

    For example, avoid:

    1. Write your name.
    2. Write your age.
    3. Write your country.
    4. Write your job.
    5. Write your hobby.

    Instead, combine related information into a meaningful task.

    For example:

    "Write a short introduction about yourself using your name, age,
    country and hobby."

    Then use the remaining questions to assess other important lesson
    content such as:

    - Numbers
    - Spelling
    - Phone numbers
    - Shopping
    - Prices
    - Other concepts actually taught


    ========================================================
    QUESTION DIFFICULTY PROGRESSION
    ========================================================

    The questions must gradually increase in difficulty.

    Questions 1-3:

    Basic understanding and controlled use of the lesson content.


    Questions 4-6:

    Application of the lesson content in simple contexts.


    Questions 7-8:

    Independent German sentence production and communication.


    Questions 9-10:

    More challenging written production using the SAME lesson content.

    The final questions should require more:

    - Thinking
    - Language production
    - Independence
    - Contextual application

    than the first questions.

    However, DO NOT introduce new concepts simply to make the final
    questions more difficult.

    Increase difficulty by changing:

    - Amount of language production
    - Context
    - Independence
    - Number of learned concepts combined in one task
    - Communication requirements

    Do NOT increase difficulty by introducing new grammar or vocabulary.


    ========================================================
    WRITTEN PRODUCTION
    ========================================================

    The assessment should primarily measure the student's ability to USE
    what they learned.

    Prefer questions that ask students to:

    - Write German sentences
    - Construct questions and answers
    - Respond to a short situation
    - Write a short dialogue
    - Describe something
    - Explain something
    - Produce a short paragraph

    The exact task must depend on the content actually taught.


    A1:

    Keep responses short and simple.


    A2:

    Allow several connected sentences.


    B1:

    Require more developed responses.


    B2:

    Require more detailed and coherent written responses.


    ========================================================
    QUESTION COUNT AND MARKS
    ========================================================

    Generate EXACTLY 10 questions.

    The total marks MUST equal exactly 100.

    Every question MUST contain:

    - questionNo
    - question
    - englishQuestion
    - marks

    Marks should reflect:

    - Difficulty
    - Expected answer length
    - Amount of language production
    - Importance of the assessed learning objective

    Do not give every question the same marks unless there is a strong
    assessment reason to do so.

    The total MUST equal exactly:

    100 marks


    ========================================================
    ASSESSMENT QUALITY CHECK
    ========================================================

    Before returning the final JSON, internally verify ALL of the following:

    1. Exactly 10 questions exist.

    2. Total marks equal exactly 100.

    3. Every question is a written-answer question.

    4. No Multiple Choice Questions are present.

    5. No True/False questions are present.

    6. No Matching questions are present.

    7. No Fill-in-the-blank questions are present.

    8. Questions are not repetitive.

    9. Each question has a meaningful assessment purpose.

    10. Questions gradually increase in difficulty.

    11. Questions are appropriate for the CEFR level.

    12. Every question is supported by the class transcript.

    13. No unrelated lesson content has been introduced.

    14. Questions encourage German language production.

    15. The assessment reflects the important content from the entire
        transcript.

    16. The assessment does not focus excessively on one minor topic.

    17. For A1, every question has a clear English translation.

    18. For A1, the "question" field contains ONLY German.

    19. For A1, the "englishQuestion" field contains ONLY English.

    20. For A2, English clarification is used only when necessary.

    21. For B1, "englishQuestion" is empty.

    22. For B2, "englishQuestion" is empty.

    23. English translations or clarifications do not provide answers.

    24. The student is required to answer in German.

    25. The final questions require more independent language production
        than the earlier questions.

    26. The assessment does not introduce new concepts merely to increase
        difficulty.

    27. The assessment is suitable for a student who attended this class.

    If ANY requirement is violated, revise the assessment internally
    before returning the final JSON.


    ========================================================
    TRANSCRIPT
    ========================================================

    ${transcript}


    ========================================================
    OUTPUT FORMAT
    ========================================================

    Return ONLY valid JSON.

    Use EXACTLY this structure:

    {
        "title": "",
        "level": "",
        "topic": "",
        "instructions": "",
        "totalMarks": 100,
        "questions": [
            {
                "questionNo": 1,
                "question": "",
                "englishQuestion": "",
                "marks": 10
            }
        ]
    }


    The "level" MUST match the class CEFR level.

    The "topic" MUST reflect the actual important lesson content.

    The "instructions" should briefly explain to the student how to
    complete the written assessment.

    For A1, the instructions should clearly tell students to answer
    in German.

    Questions should be:

    - Clear
    - Natural
    - Grammatically appropriate
    - Appropriate for the CEFR level
    - Based on the transcript


    DO NOT include:

    - Analysis
    - Explanations
    - Transcript summaries
    - Translation of the transcript
    - Markdown
    - Code fences
    - Additional fields

    Return ONLY the JSON object.

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