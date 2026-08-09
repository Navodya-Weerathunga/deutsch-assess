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