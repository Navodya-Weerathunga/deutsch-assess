// routes/answer.js

const express = require("express");

const router = express.Router();

const fs = require("fs");

const User = require("../models/User");
const Assessment = require("../models/Assessment");
const Class = require("../models/Class");
const Answer = require("../models/Answer");
const upload = require("../middleware/uploadAnswer");

const { verifyToken } = require("../middleware/auth");
const checkRole = require("../middleware/checkRloe");

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

            const answer =
                new Answer({

                    assessment:
                        assessment._id,

                    student:
                        student._id,

                    class:
                        classDoc._id,

                    answerFile: {

                        fileName:
                            req.file.originalname,

                        filePath:
                            req.file.path,

                        fileType:
                            req.file.mimetype,

                        uploadedAt:
                            new Date()

                    },

                    status:
                        "SUBMITTED",

                    submittedAt:
                        new Date()

                });


            // -----------------------------------------
            // Save Answer
            // -----------------------------------------

            await answer.save();


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