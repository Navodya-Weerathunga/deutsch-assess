// routes/class.js

const express = require("express");
const router = express.Router();

const Class = require("../models/Class");
const User = require("../models/User");
const transporter = require("../config/emailConfig");
const zoomService = require("../services/zoom.service");

const { verifyToken } = require("../middleware/auth");
const checkRole = require("../middleware/checkRloe");

const fs = require("fs");
const uploadTranscript = require("../middleware/uploadTranscripts");

// Update class status automatically

function updateClassStatus(classDoc) {

    const now = new Date();

    const start = new Date(classDoc.classDate);
    const end = new Date(classDoc.classDate);

    const [startHour, startMinute] = classDoc.startTime.split(":");
    const [endHour, endMinute] = classDoc.endTime.split(":");

    start.setHours(Number(startHour), Number(startMinute), 0, 0);
    end.setHours(Number(endHour), Number(endMinute), 0, 0);

    if (now < start) {

        classDoc.status = "UPCOMING";

    }

    else if (now >= start && now <= end) {

        classDoc.status = "ONGOING";

    }

    else {

        classDoc.status = "COMPLETED";

    }

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

                <td>${classDate}</td>

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

const transcriptService = require("../services/transcript.service");

router.post(
    "/:id/generate-assessment",
    verifyToken,
    checkRole("ADMIN"),
    async (req, res) => {

        try {

            const classDoc = await Class.findById(req.params.id);

            if (!classDoc) {

                return res.status(404).json({
                    msg: "Class not found."
                });

            }

            if (!classDoc.transcript) {

                return res.status(400).json({
                    msg: "Please upload a transcript first."
                });

            }

            // Clean transcript
            const cleanedTranscript =
                transcriptService.cleanTranscript(classDoc.transcript);

            console.log("========== CLEANED TRANSCRIPT ==========");
            console.log(cleanedTranscript);

            res.json({

                message: "Transcript cleaned successfully.",

                cleanedTranscript

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