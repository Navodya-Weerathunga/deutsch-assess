// routes/assessment.js

const express = require("express");
const router = express.Router();
const Assessment = require("../models/Assessment");
const Class = require("../models/Class");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");
const checkRole = require("../middleware/checkRloe");


// =====================================================
// Get Assessments Admin
// =====================================================

router.get(
    "/",
    verifyToken,
    checkRole("ADMIN"),
    async (req, res) => {

        try {

            const assessments = await Assessment.find()
                .populate({
                    path: "class",
                    select: "classDate startTime endTime batch medium level topic"
                })
                .sort({ createdAt: -1 });

            res.json(assessments);

        } catch (err) {

            console.error(err);

            res.status(500).json({
                msg: "Failed to load assessments."
            });

        }

    }
);

// =====================================================
// Get Assessments Available for Logged-in Student
// =====================================================

router.get(
    "/student",
    verifyToken,
    checkRole("STUDENT"),
    async (req, res) => {

        try {

            // -----------------------------------------
            // Get student ID from token
            // -----------------------------------------

            const studentId = req.user.id;

            // -----------------------------------------
            // Get student
            // -----------------------------------------

            const student = await User.findById(studentId);

            if (!student) {

                return res.status(404).json({
                    msg: "Student not found."
                });

            }

            // -----------------------------------------
            // Only ongoing students can see assessments
            // -----------------------------------------

            if (student.status !== "ONGOING") {

                return res.json([]);

            }

            // -----------------------------------------
            // Find classes matching:
            // - Student batch
            // - Student medium
            // - Student level/course
            // -----------------------------------------

            const classes = await Class.find({

                batch: { $in: student.batch },
                medium: { $in: student.medium },
                level: { $in: student.assignedCourses }

            }).select("_id topic classDate startTime endTime batch medium level tutor");

            // -----------------------------------------
            // If no matching classes
            // -----------------------------------------

            if (classes.length === 0) {

                return res.json([]);

            }

            // -----------------------------------------
            // Get class IDs
            // -----------------------------------------

            const classIds = classes.map(
                classDoc => classDoc._id
            );

            // -----------------------------------------
            // Find assessments for those classes
            // -----------------------------------------

            const assessments = await Assessment.find({

                class: { $in: classIds }

            })
            .populate(
                "class",
                "topic classDate startTime endTime batch medium level tutor"
            )
            .sort({
                createdAt: -1
            });

            // -----------------------------------------
            // Return assessments
            // -----------------------------------------

            res.status(200).json(assessments);

        }

        catch (err) {

            console.error(
                "Error loading student assessments:",
                err
            );

            res.status(500).json({

                msg: "Failed to load assessments.",

                error: err.message

            });

        }

    }
);

// =====================================================
// Get Assessment for Logged-in Student
// =====================================================

router.get(
    "/student/:id",
    verifyToken,
    checkRole("STUDENT"),
    async (req, res) => {

        try {

            // -----------------------------------------
            // Get student
            // -----------------------------------------

            const student = await User.findById(req.user.id);

            if (!student) {

                return res.status(404).json({
                    msg: "Student not found."
                });

            }

            // -----------------------------------------
            // Only ongoing students can access
            // assessments
            // -----------------------------------------

            if (student.status !== "ONGOING") {

                return res.status(403).json({
                    msg: "Assessment access is available only for ongoing students."
                });

            }

            // -----------------------------------------
            // Find assessment
            // -----------------------------------------

            const assessment = await Assessment.findById(
                req.params.id
            ).populate({
                path: "class",
                select:
                    "topic classDate startTime endTime batch medium level tutor"
            });

            if (!assessment) {

                return res.status(404).json({
                    msg: "Assessment not found."
                });

            }

            // -----------------------------------------
            // Check class exists
            // -----------------------------------------

            if (!assessment.class) {

                return res.status(404).json({
                    msg: "Class associated with this assessment was not found."
                });

            }

            const classDoc = assessment.class;

            // -----------------------------------------
            // Check student's batch
            // -----------------------------------------

            const batchMatch =
                student.batch.includes(classDoc.batch);

            // -----------------------------------------
            // Check student's medium
            // -----------------------------------------

            const mediumMatch =
                student.medium.includes(classDoc.medium);

            // -----------------------------------------
            // Check student's level
            // -----------------------------------------

            const levelMatch =
                student.assignedCourses.includes(classDoc.level);

            // -----------------------------------------
            // Verify student is allowed to access
            // -----------------------------------------

            if (
                !batchMatch ||
                !mediumMatch ||
                !levelMatch
            ) {

                return res.status(403).json({
                    msg: "You are not authorized to access this assessment."
                });

            }

            // -----------------------------------------
            // Return assessment
            // -----------------------------------------

            res.status(200).json(assessment);

        }

        catch (err) {

            console.error(
                "Error loading student assessment:",
                err
            );

            res.status(500).json({

                msg: "Failed to load assessment.",

                error: err.message

            });

        }

    }
);


// =====================================================
// Get Assessments for Logged-in Tutor
// =====================================================

router.get(
    "/tutor",
    verifyToken,
    checkRole("TUTOR"),
    async (req, res) => {

        try {

            // -----------------------------------------
            // Find assessments belonging to classes
            // assigned to the logged-in tutor
            // -----------------------------------------

            const classes = await Class.find({

                tutor: req.user.id

            }).select("_id");


            // -----------------------------------------
            // No classes assigned
            // -----------------------------------------

            if (classes.length === 0) {

                return res.status(200).json([]);

            }


            // -----------------------------------------
            // Get class IDs
            // -----------------------------------------

            const classIds = classes.map(
                classDoc => classDoc._id
            );


            // -----------------------------------------
            // Find assessments for those classes
            // -----------------------------------------

            const assessments =
                await Assessment.find({

                    class: {
                        $in: classIds
                    }

                })
                .populate({

                    path: "class",

                    select:
                        "classDate startTime endTime batch medium level topic"

                })
                .sort({
                    createdAt: -1
                });


            // -----------------------------------------
            // Return assessments
            // -----------------------------------------

            return res.status(200).json(
                assessments
            );

        }
        catch (err) {

            console.error(
                "Error loading tutor assessments:",
                err
            );

            return res.status(500).json({

                msg:
                    "Failed to load tutor assessments.",

                error:
                    err.message

            });

        }

    }
);


// =====================================================
// Get Assessment By ID
// =====================================================

router.get(
    "/:id",
    verifyToken,
    checkRole("ADMIN"),
    async (req, res) => {

        try {

            const assessment = await Assessment.findById(
                req.params.id
            ).populate({
                path: "class",
                select:
                    "topic classDate startTime endTime batch medium level status"
            });

            if (!assessment) {

                return res.status(404).json({
                    msg: "Assessment not found."
                });

            }

            res.status(200).json(assessment);

        }

        catch (err) {

            console.error("Error loading assessment:", err);

            res.status(500).json({
                msg: "Failed to load assessment."
            });

        }

    }
);


module.exports = router;