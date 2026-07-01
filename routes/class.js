// routes/class.js

const express = require("express");
const router = express.Router();

const Class = require("../models/Class");
const User = require("../models/User");
const transporter = require("../config/emailConfig");
const zoomService = require("../services/zoom.service");

const { verifyToken } = require("../middleware/auth");
const checkRole = require("../middleware/checkRloe");

const Assessment = require("../models/Assessment");
const transcriptService = require("../services/transcript.service");
const assessmentService = require("../services/assessment.service");

const fs = require("fs");
const uploadTranscript = require("../middleware/uploadTranscripts");

// =====================================================
// Get Current Time in Sri Lanka
// =====================================================

function getSriLankaNow() {
    return new Date(
        new Date().toLocaleString("en-US", {
            timeZone: "Asia/Colombo"
        })
    );
}

// Update class status automatically

function updateClassStatus(classDoc) {

    // Current time in Sri Lanka
    const now = new Date(
        new Date().toLocaleString("en-US", {
            timeZone: "Asia/Colombo"
        })
    );

    // Get only the calendar date from MongoDB
    const year = classDoc.classDate.getUTCFullYear();
    const month = String(classDoc.classDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(classDoc.classDate.getUTCDate() + 1).padStart(2, "0");

    // Build start and end datetime in Sri Lanka
    const start = new Date(
        `${year}-${month}-${day}T${classDoc.startTime}:00+05:30`
    );

    const end = new Date(
        `${year}-${month}-${day}T${classDoc.endTime}:00+05:30`
    );

    console.log("-----------------------------");
    console.log("Now   :", now);
    console.log("Start :", start);
    console.log("End   :", end);

    if (now < start) {

        classDoc.status = "UPCOMING";

    }
    else if (now >= start && now <= end) {

        classDoc.status = "ONGOING";

    }
    else {

        classDoc.status = "COMPLETED";

    }

    return classDoc.status;

}

// =====================================================
// Get Available Tutors
// =====================================================

router.get("/available-tutors", verifyToken, checkRole("ADMIN"),
  async (req, res) => {

    try {

      let { medium, assignedCourses, batch } = req.query;

      if (!medium || !assignedCourses || !batch) {

        return res.status(400).json({
          msg: "Medium, Assigned Course and Batch are required."
        });

      }

      medium = Array.isArray(medium) ? medium : [medium];
      assignedCourses = Array.isArray(assignedCourses)
        ? assignedCourses
        : [assignedCourses];
      batch = Array.isArray(batch) ? batch : [batch];

      const tutors = await User.find({

        role: "TUTOR",

        medium: { $in: medium },

        assignedCourses: { $in: assignedCourses },

        batch: { $in: batch }

      }).select(
        "_id firstName lastName regNo email medium batch assignedCourses"
      );

      res.json(tutors);

    }

    catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  }
);


// =====================================================
// Create Zoom Class
// =====================================================

router.post(
  "/create",
  verifyToken,
  checkRole("ADMIN"),
  async (req, res) => {

    try {

      const {

        topic,
        classDate,
        startTime,
        endTime,
        batch,
        medium,
        level,
        tutor

      } = req.body;


      // ----------------------------------------
      // Create Zoom Meeting
      // ----------------------------------------

      const meeting = await zoomService.createMeeting({

        topic,
        classDate,
        startTime,
        endTime

      });


      // ----------------------------------------
      // Save Class
      // ----------------------------------------

      let newClass;

      try {

        console.log("Saving class...");

        newClass = await Class.create({
            topic,
            classDate: new Date(classDate),
            startTime,
            endTime,
            batch,
            medium,
            level,
            tutor,
            zoomMeetingId: meeting.id.toString(),
            zoomJoinUrl: meeting.join_url,
            zoomStartUrl: meeting.start_url
        });

        console.log("Saved successfully");
        console.log(newClass);

        } catch (err) {

            console.error("SAVE ERROR");
            console.error(err);

        }


      // ----------------------------------------
      // Find Students
      // ----------------------------------------

      const students = await User.find({

        role: "STUDENT",

        status: "ONGOING",

        medium: { $in: [medium] },

        batch: { $in: [batch] },

        assignedCourses: { $in: [level] }

      });

      // ----------------------------------------
      // Send Email
      // ----------------------------------------

      // Format date to DD/MM/YYYY
      
      const formattedDate = new Date(classDate).toLocaleDateString("en-GB", {
          timeZone: "Asia/Colombo",
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
      });

      for (const student of students) {

        await transporter.sendMail({

          from: process.env.EMAIL_USER,

          to: student.email,

          subject: "Deutsch-Assess Zoom Class",

          html: `

            <h2>${topic}</h2>

            <p>Hello ${student.firstName},</p>

            <p>Your class has been scheduled.</p>

            <table>

              <tr>

                <td><b>Date</b></td>

                <td>${formattedDate}</td>

              </tr>

              <tr>

                <td><b>Time</b></td>

                <td>${startTime} - ${endTime}</td>

              </tr>

              <tr>

                <td><b>Batch</b></td>

                <td>${batch}</td>

              </tr>

              <tr>

                <td><b>Level</b></td>

                <td>${level}</td>

              </tr>

            </table>

            <br>

            <a href="${meeting.join_url}">

              Join Zoom Meeting

            </a>

            <br><br>

            Regards,

            <br>

            Deutsch-Assess

          `

        });

      }


      res.status(201).json({

        msg: "Zoom class created successfully.",

        class: newClass

      });

    }

    catch (err) {

      console.error(err);

      res.status(500).json({

        error: err.message

      });

    }

  }
);


// =====================================================
// Get All Classes
// =====================================================

router.get(
  "/",
  verifyToken,
  checkRole("ADMIN"),
  async (req, res) => {

    try {

      const classes = await Class.find()
        .populate("tutor", "firstName lastName regNo")
        .sort({ classDate: -1 });

      // Update status automatically
      for (const classDoc of classes) {

        const oldStatus = classDoc.status;

        updateClassStatus(classDoc);

        // Save only if changed
        if (oldStatus !== classDoc.status) {

          await classDoc.save();

        }

      }

      res.json(classes);

    }

    catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);

// =====================================================
// Upload Transcript
// =====================================================

router.post(

    "/:id/upload-transcript",

    verifyToken,

    checkRole("ADMIN"),

    uploadTranscript.single("transcript"),

    async (req, res) => {

        try {

            const classId = req.params.id;

            const classDoc = await Class.findById(classId);

            if (!classDoc) {

                return res.status(404).json({

                    msg: "Class not found."

                });

            }

            if (!req.file) {

                return res.status(400).json({

                    msg: "Transcript file is required."

                });

            }

            const transcriptText = fs.readFileSync(

                req.file.path,

                "utf8"

            );

            classDoc.transcript = transcriptText;

            classDoc.transcriptLanguage = "Unknown";

            classDoc.transcriptUploadedAt = new Date();

            classDoc.assessmentGenerated = false;

            await classDoc.save();

            res.json({

                msg: "Transcript uploaded successfully.",

                class: classDoc

            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({

                error: err.message

            });

        }

    }

);


// =====================================================
// Generate Assessment
// =====================================================

router.post(
    "/:id/generate-assessment",
    verifyToken,
    checkRole("ADMIN"),
    async (req, res) => {

        try {

            // ------------------------------------
            // Find Class
            // ------------------------------------

            const classDoc = await Class.findById(req.params.id);

            if (!classDoc) {

                return res.status(404).json({

                    msg: "Class not found."

                });

            }

            // ------------------------------------
            // Check Transcript
            // ------------------------------------

            if (!classDoc.transcript) {

                return res.status(400).json({

                    msg: "Please upload a transcript first."

                });

            }

            // ------------------------------------
            // Prevent Duplicate Assessment
            // ------------------------------------

            const existingAssessment = await Assessment.findOne({

                class: classDoc._id

            });

            if (existingAssessment) {

                return res.status(400).json({

                    msg: "Assessment has already been generated."

                });

            }

            // ------------------------------------
            // Clean Transcript
            // ------------------------------------

            const cleanedTranscript =
                transcriptService.cleanTranscript(
                    classDoc.transcript
                );

            // ------------------------------------
            // Generate Assessment using GPT
            // ------------------------------------

            console.log("STEP 1");

            const generatedAssessment =
                await assessmentService.generateAssessment(

                    classDoc,

                    cleanedTranscript

                );
            console.log("STEP 2");

            console.log(generatedAssessment);

            console.log("STEP 3");

            // ------------------------------------
            // Save Assessment
            // ------------------------------------

        const assessment = await Assessment.create({

            class: classDoc._id,

            title: generatedAssessment.title,

            topic: generatedAssessment.topic,

            level: generatedAssessment.level,

            language: "German",

            instructions: generatedAssessment.instructions,

            totalMarks: generatedAssessment.totalMarks,

            questions: generatedAssessment.questions

        });

        console.log("STEP 4");

            // ------------------------------------
            // Update Class
            // ------------------------------------

            classDoc.assessmentGenerated = true;

            await classDoc.save();

            // ------------------------------------
            // Response
            // ------------------------------------

            res.status(201).json({

                msg: "Assessment generated successfully.",

                assessment

            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({

                error: err.message

            });

        }

    }

);

module.exports = router;