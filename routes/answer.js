// routes/answer.js

const express = require("express");

const router = express.Router();

const fs = require("fs");
const path = require("path");

const User = require("../models/User");
const Assessment = require("../models/Assessment");
const Class = require("../models/Class");
const Answer = require("../models/Answer");
const upload = require("../middleware/uploadAnswer");

const { verifyToken } = require("../middleware/auth");
const checkRole = require("../middleware/checkRloe");

const ocrService = require("../services/ocr.service");
const { evaluateQuestion } = require("../services/assessment-scoring.service");

// =========================================
// Process OCR
// =========================================

async function processOCR(answerId) {

    try {

        console.log(
            "========== STARTING ANSWER OCR =========="
        );

        // -------------------------------------
        // Find Answer
        // -------------------------------------

        const answer =
            await Answer.findById(answerId);


        if (!answer) {

            console.error(
                "Answer not found for OCR:",
                answerId
            );

            return;

        }


        // -------------------------------------
        // Set OCR status
        // -------------------------------------

        answer.ocrStatus =
            "PROCESSING";

        await answer.save();


        // -------------------------------------
        // Run OCR
        // -------------------------------------

        const ocrResult =
            await ocrService.extractText(

                answer.answerFile.filePath,

                answer.answerFile.fileType

            );


        console.log(
            "OCR completed:"
        );

        console.log(
            JSON.stringify(
                ocrResult,
                null,
                2
            )
        );


        // -------------------------------------
        // Validate OCR result
        // -------------------------------------

        if (
            !ocrResult ||
            !Array.isArray(
                ocrResult.answers
            )
        ) {

            throw new Error(
                "Invalid OCR result."
            );

        }


        // -------------------------------------
        // Save OCR answers
        // -------------------------------------

        answer.ocrAnswers =
            ocrResult.answers;


        answer.ocrStatus =
            "COMPLETED";


        answer.ocrCompletedAt =
            new Date();


        answer.ocrError =
            "";


        await answer.save();


        console.log(
            "OCR answers saved successfully:",
            answerId
        );


        // =========================================
        // AI ASSESSMENT SCORING
        // =========================================

        console.log(
            "========== STARTING AI ASSESSMENT =========="
        );

        // Get the assessment
        const assessment =
            await Assessment.findById(
                answer.assessment
            );

        if (!assessment) {
            throw new Error(
                "Assessment not found for AI evaluation."
            );
        }

        // =========================================
        // Set AI assessment status
        // =========================================

        answer.assessmentStatus = "PROCESSING";

        await answer.save();

        console.log(
            "Assessment status: PROCESSING"
        );

        const cefr =
            assessment.level.toUpperCase();

        const questionResults = [];

        let totalMarksAwarded = 0;


        // -----------------------------------------
        // Evaluate every question
        // -----------------------------------------

        for (
            const question
            of assessment.questions
        ) {

            console.log(
                `Evaluating Q${question.questionNo}...`
            );


            // Find matching OCR answer
            const ocrAnswer =
                answer.ocrAnswers.find(
                    item =>
                        item.questionNo ===
                        question.questionNo
                );


            const studentAnswer =
                ocrAnswer?.answer || "";


            // -------------------------------------
            // Combined AI evaluation
            // -------------------------------------

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


            // -------------------------------------
            // Store question result
            // -------------------------------------

            questionResults.push({

                questionNo:
                    question.questionNo,

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
                    question.marks,

                awardedMarks:
                    result.awardedMarks

            });


            totalMarksAwarded +=
                result.awardedMarks;


            console.log(
                `Q${question.questionNo}: ` +
                `${result.awardedMarks.toFixed(2)}/` +
                `${question.marks}`
            );
        }


        // -----------------------------------------
        // Save final assessment result
        // -----------------------------------------

        answer.questionResults =
            questionResults;

        answer.totalMarksAwarded =
            Number(
                totalMarksAwarded.toFixed(2)
            );
        
        answer.assessmentStatus =
            "COMPLETED";

        answer.status =
            "MARKED";

        answer.markedAt =
            new Date();

        await answer.save();


        console.log(
            "========== AI ASSESSMENT COMPLETED =========="
        );

        console.log(
            `Total: ${answer.totalMarksAwarded}/` +
            `${assessment.totalMarks}`
        );


    }

    catch (error) {

        console.error(
            "Answer processing failed:",
            error
        );

        try {

            const answer =
                await Answer.findById(
                    answerId
                );

            if (answer) {

                // -----------------------------------------
                // OCR failed
                // -----------------------------------------

                if (
                    answer.ocrStatus !== "COMPLETED"
                ) {

                    answer.ocrStatus =
                        "FAILED";

                    answer.ocrError =
                        error.message;

                    console.error(
                        "OCR failed."
                    );

                }

                // -----------------------------------------
                // OCR succeeded, AI assessment failed
                // -----------------------------------------

                else {

                    answer.assessmentStatus =
                        "FAILED";

                    console.error(
                        "AI assessment failed after OCR completed."
                    );

                }

                await answer.save();

            }

        }
        catch (updateError) {

            console.error(
                "Failed to update answer status:",
                updateError
            );

        }

    }

}


// =====================================================
// Get All Student Assessment Results - Admin
// =====================================================

router.get(
    "/admin/results",
    verifyToken,
    checkRole("ADMIN"),
    async (req, res) => {

        try {

            // -----------------------------------------
            // Get Filters
            // -----------------------------------------

            const {
                level,
                batch,
                search
            } = req.query;


            // -----------------------------------------
            // Build Student Filter
            // -----------------------------------------

            const studentFilter = {
                role: "STUDENT"
            };


            // -----------------------------------------
            // Batch Filter
            // -----------------------------------------

            if (batch) {

                studentFilter.batch = batch;

            }


            // -----------------------------------------
            // Search Filter
            // -----------------------------------------

            if (search) {

                const searchRegex =
                    new RegExp(
                        search,
                        "i"
                    );


                studentFilter.$or = [

                    {
                        firstName:
                            searchRegex
                    },

                    {
                        lastName:
                            searchRegex
                    },

                    {
                        regNo:
                            searchRegex
                    }

                ];

            }


            // -----------------------------------------
            // Find Students
            // -----------------------------------------

            const students =
                await User.find(
                    studentFilter
                ).select(
                    "_id firstName lastName regNo batch assignedCourses"
                );


            // -----------------------------------------
            // If No Students
            // -----------------------------------------

            if (students.length === 0) {

                return res.status(200).json([]);

            }


            // -----------------------------------------
            // Student IDs
            // -----------------------------------------

            const studentIds =
                students.map(
                    student =>
                        student._id
                );


            // -----------------------------------------
            // Build Answer Filter
            // -----------------------------------------

            const answerFilter = {

                student: {
                    $in: studentIds
                },

                status: "MARKED"

            };


            // -----------------------------------------
            // Get Marked Answers
            // -----------------------------------------

            let answers =
                await Answer.find(
                    answerFilter
                )
                .populate(
                    "student",
                    "_id firstName lastName regNo batch assignedCourses"
                )
                .populate(
                    "assessment",
                    "_id title level totalMarks"
                )
                .populate(
                    "class",
                    "_id topic classDate batch medium level"
                )
                .sort({
                    markedAt: -1
                });


            // -----------------------------------------
            // Level Filter
            // -----------------------------------------

            if (level) {

                answers =
                    answers.filter(
                        answer => {

                            return (
                                answer.class &&
                                answer.class.level === level
                            );

                        }
                    );

            }


            // -----------------------------------------
            // Format Response
            // -----------------------------------------

            const results =
                answers.map(
                    answer => ({

                        answerId:
                            answer._id,

                        student: {

                            _id:
                                answer.student?._id,

                            firstName:
                                answer.student?.firstName,

                            lastName:
                                answer.student?.lastName,

                            regNo:
                                answer.student?.regNo,

                            batch:
                                answer.student?.batch,

                            assignedCourses:
                                answer.student?.assignedCourses

                        },

                        assessment: {

                            _id:
                                answer.assessment?._id,

                            title:
                                answer.assessment?.title,

                            level:
                                answer.assessment?.level,

                            totalMarks:
                                answer.assessment?.totalMarks

                        },

                        class: {

                            _id:
                                answer.class?._id,

                            topic:
                                answer.class?.topic,

                            classDate:
                                answer.class?.classDate,

                            batch:
                                answer.class?.batch,

                            medium:
                                answer.class?.medium,

                            level:
                                answer.class?.level

                        },

                        totalMarksAwarded:
                            answer.totalMarksAwarded,

                        status:
                            answer.status,

                        submittedAt:
                            answer.submittedAt,

                        markedAt:
                            answer.markedAt

                    })
                );


            // -----------------------------------------
            // Send Results
            // -----------------------------------------

            return res.status(200).json(
                results
            );

        }
        catch (error) {

            console.error(
                "Error loading admin assessment results:",
                error
            );


            return res.status(500).json({

                msg:
                    "Failed to load assessment results."

            });

        }

    }
);


// =====================================================
// Submit Student Answers
// =====================================================

router.post(
    "/",
    verifyToken,
    checkRole("STUDENT"),
    upload.single("answerFile"),
    async (req, res) => {

        try {

            console.log(
                "========== ANSWER SUBMISSION =========="
            );


            // -----------------------------------------
            // Check uploaded file
            // -----------------------------------------

            if (!req.file) {

                return res.status(400).json({

                    msg: "Please upload your answer file."

                });

            }


            // -----------------------------------------
            // Get logged-in student
            // -----------------------------------------

            const student =
                await User.findById(req.user.id);


            if (!student) {

                // Delete uploaded file

                if (fs.existsSync(req.file.path)) {

                    fs.unlinkSync(req.file.path);

                }

                return res.status(404).json({

                    msg: "Student not found."

                });

            }


            // -----------------------------------------
            // Check student status
            // -----------------------------------------

            if (student.status !== "ONGOING") {

                if (fs.existsSync(req.file.path)) {

                    fs.unlinkSync(req.file.path);

                }

                return res.status(403).json({

                    msg:
                        "Only ongoing students can submit assessments."

                });

            }


            // -----------------------------------------
            // Get Assessment ID
            // -----------------------------------------

            const assessmentId =
                req.body.assessmentId;


            if (!assessmentId) {

                if (fs.existsSync(req.file.path)) {

                    fs.unlinkSync(req.file.path);

                }

                return res.status(400).json({

                    msg:
                        "Assessment ID is required."

                });

            }


            // -----------------------------------------
            // Find Assessment
            // -----------------------------------------

            const assessment =
                await Assessment.findById(
                    assessmentId
                );


            if (!assessment) {

                if (fs.existsSync(req.file.path)) {

                    fs.unlinkSync(req.file.path);

                }

                return res.status(404).json({

                    msg:
                        "Assessment not found."

                });

            }


            // -----------------------------------------
            // Find Class
            // -----------------------------------------

            const classDoc =
                await Class.findById(
                    assessment.class
                );


            if (!classDoc) {

                if (fs.existsSync(req.file.path)) {

                    fs.unlinkSync(req.file.path);

                }

                return res.status(404).json({

                    msg:
                        "Class associated with this assessment was not found."

                });

            }


            // -----------------------------------------
            // Check Student Batch
            // -----------------------------------------

            const batchMatch =
                student.batch &&
                student.batch.includes(
                    classDoc.batch
                );


            // -----------------------------------------
            // Check Student Medium
            // -----------------------------------------

            const mediumMatch =
                student.medium &&
                student.medium.includes(
                    classDoc.medium
                );


            // -----------------------------------------
            // Check Student Level
            // -----------------------------------------

            const levelMatch =
                student.assignedCourses &&
                student.assignedCourses.includes(
                    classDoc.level
                );


            // -----------------------------------------
            // Verify Student Access
            // -----------------------------------------

            if (
                !batchMatch ||
                !mediumMatch ||
                !levelMatch
            ) {

                if (fs.existsSync(req.file.path)) {

                    fs.unlinkSync(req.file.path);

                }

                return res.status(403).json({

                    msg:
                        "You are not authorized to submit this assessment."

                });

            }


            // -----------------------------------------
            // Check Duplicate Submission
            // -----------------------------------------

            const existingAnswer =
                await Answer.findOne({

                    assessment:
                        assessment._id,

                    student:
                        student._id

                });


            if (existingAnswer) {

                if (fs.existsSync(req.file.path)) {

                    fs.unlinkSync(req.file.path);

                }

                return res.status(409).json({

                    msg:
                        "You have already submitted this assessment."

                });

            }


            // -----------------------------------------
            // Create Answer
            // -----------------------------------------

            const answer = new Answer({
                assessment: assessment._id,
                student: student._id,
                class: classDoc._id,
                answerFile: {
                    fileName: req.file.originalname,
                    filePath: req.file.path,
                    fileType: req.file.mimetype,
                    uploadedAt: new Date()
                },
                status: "SUBMITTED",
                ocrStatus: "PENDING",
                submittedAt: new Date()
            });

            // -----------------------------------------
            // Save Answer
            // -----------------------------------------

            await answer.save();

            // =========================================
            // Start OCR
            // =========================================

            processOCR(answer._id);


            // -----------------------------------------
            // Success Response
            // -----------------------------------------

            console.log(
                "Answer submitted successfully:",
                answer._id
            );


            return res.status(201).json({

                msg:
                    "Answers uploaded successfully.",

                answerId:
                    answer._id

            });

        }


        catch (err) {

            console.error(
                "Error submitting answer:",
                err
            );


            // -----------------------------------------
            // Delete uploaded file if an error occurs
            // -----------------------------------------

            if (
                req.file &&
                req.file.path &&
                fs.existsSync(req.file.path)
            ) {

                fs.unlinkSync(
                    req.file.path
                );

            }


            return res.status(500).json({

                msg:
                    "Failed to submit answers.",

                error:
                    err.message

            });

        }

    }
);


// =====================================================
// Get Student Assessment Results
// =====================================================

router.get(
    "/",
    verifyToken,
    checkRole("STUDENT"),
    async (req, res) => {

        try {

            const answers =
                await Answer.find({
                    student: req.user.id
                })
                .populate(
                    "assessment",
                    "title topic level totalMarks"
                )
                .sort({
                    submittedAt: -1
                });


            return res.status(200).json(
                answers.map(answer => ({

                    answerId:
                        answer._id,

                    assessment:
                        answer.assessment,

                    status:
                        answer.status,

                    ocrStatus:
                        answer.ocrStatus,

                    assessmentStatus:
                        answer.assessmentStatus,

                    totalMarksAwarded:
                        answer.totalMarksAwarded,

                    submittedAt:
                        answer.submittedAt,

                    markedAt:
                        answer.markedAt,

                    answerFile: {

                        fileName:
                            answer.answerFile?.fileName,

                        fileType:
                            answer.answerFile?.fileType

                    }

                }))
            );

        }
        catch (error) {

            console.error(
                "Error getting student assessment results:",
                error
            );

            return res.status(500).json({
                msg:
                    "Failed to retrieve assessment results."
            });

        }

    }
);


// =====================================================
// Get Uploaded Answer Sheet
// =====================================================

router.get(
    "/:answerId/file",
    verifyToken,
    checkRole("STUDENT"),
    async (req, res) => {

        try {

            const {
                answerId
            } = req.params;


            // -----------------------------------------
            // Find Answer
            // -----------------------------------------

            const answer =
                await Answer.findById(
                    answerId
                );


            if (!answer) {

                return res.status(404).json({
                    msg:
                        "Answer submission not found."
                });

            }


            // -----------------------------------------
            // Security Check
            // -----------------------------------------

            if (
                answer.student.toString() !==
                req.user.id.toString()
            ) {

                return res.status(403).json({
                    msg:
                        "You are not authorized to view this answer sheet."
                });

            }


            // -----------------------------------------
            // Check File
            // -----------------------------------------

            if (
                !answer.answerFile ||
                !answer.answerFile.filePath
            ) {

                return res.status(404).json({
                    msg:
                        "Answer sheet file not found."
                });

            }


            const filePath =
                path.resolve(
                    answer.answerFile.filePath
                );


            // -----------------------------------------
            // Check Physical File
            // -----------------------------------------

            if (!fs.existsSync(filePath)) {

                return res.status(404).json({
                    msg:
                        "Answer sheet file no longer exists."
                });

            }


            // -----------------------------------------
            // Set Content Type
            // -----------------------------------------

            res.setHeader(
                "Content-Type",
                answer.answerFile.fileType
            );


            res.setHeader(
                "Content-Disposition",
                `inline; filename="${answer.answerFile.fileName}"`
            );


            // -----------------------------------------
            // Send File
            // -----------------------------------------

            return res.sendFile(
                filePath
            );

        }
        catch (error) {

            console.error(
                "Error retrieving answer sheet:",
                error
            );

            return res.status(500).json({
                msg:
                    "Failed to retrieve answer sheet."
            });

        }

    }
);


// =====================================================
// Get Student / Admin Answer Result
// =====================================================

router.get(
    "/:answerId",
    verifyToken,
    async (req, res) => {

        try {

            const { answerId } = req.params;


            // -----------------------------------------
            // Find Answer
            // -----------------------------------------

            const answer =
                await Answer.findById(answerId)
                    .populate(
                        "assessment",
                        "title topic level totalMarks questions"
                    )
                    .populate(
                        "student",
                        "firstName lastName regNo batch"
                    )
                    .populate(
                        "class",
                        "topic classDate batch medium level"
                    );


            if (!answer) {

                return res.status(404).json({

                    msg:
                        "Answer submission not found."

                });

            }


            // -----------------------------------------
            // Authorization
            // -----------------------------------------

            const isAdmin =
                req.user.role === "ADMIN";


            const isOwner =
                answer.student &&
                answer.student._id.toString() ===
                req.user.id.toString();


            // -----------------------------------------
            // Student can only view own result
            // Admin can view any result
            // -----------------------------------------

            if (!isAdmin && !isOwner) {

                return res.status(403).json({

                    msg:
                        "You are not authorized to view this result."

                });

            }


            // -----------------------------------------
            // Return Result
            // -----------------------------------------

            return res.status(200).json({

                answerId:
                    answer._id,

                student:
                    answer.student,

                assessment:
                    answer.assessment,

                class:
                    answer.class,

                status:
                    answer.status,

                ocrStatus:
                    answer.ocrStatus,

                assessmentStatus:
                    answer.assessmentStatus,

                totalMarksAwarded:
                    answer.totalMarksAwarded,

                questionResults:
                    answer.status === "MARKED"
                        ? answer.questionResults
                        : [],

                markedAt:
                    answer.markedAt || null,

                submittedAt:
                    answer.submittedAt || null

            });

        }
        catch (error) {

            console.error(
                "Error getting answer result:",
                error
            );


            return res.status(500).json({

                msg:
                    "Failed to retrieve answer result.",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// Multer / Upload Error Handler
// =====================================================

router.use(

    (err, req, res, next) => {

        if (err) {

            console.error(
                "Answer upload error:",
                err
            );


            return res.status(400).json({

                msg:
                    err.message ||
                    "Failed to upload answer file."

            });

        }


        next();

    }

);


module.exports = router;