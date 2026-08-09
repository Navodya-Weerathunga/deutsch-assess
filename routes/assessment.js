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

module.exports = router;