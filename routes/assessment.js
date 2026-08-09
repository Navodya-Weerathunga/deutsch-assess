// routes/assessment.js

const express = require("express");
const router = express.Router();
const Assessment = require("../models/Assessment");
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