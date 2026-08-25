// route/user.js

const express = require('express');
const axios = require('axios');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/emailConfig');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../middleware/auth');
const checkRole = require('../middleware/checkRloe');

const JWT_SECRET = process.env.JWT_SECRET;

// Registration Number (regNo) generation for different roles

async function generateRegNo(role) {
  // map roles to prefixes
  const prefixMap = {
    STUDENT: "STUD",
    TUTOR: "T",
    ADMIN: "AD"
  };

  const prefix = prefixMap[role] || role.substring(0, 2).toUpperCase(); // fallback

  const lastUser = await User.findOne({
    role: role,
    regNo: { $regex: `^${prefix}\\d+$` }
  })
    .sort({ createdAt: -1 })
    .exec();

  let nextNumber = 1;

  if (lastUser && lastUser.regNo) {
    const match = lastUser.regNo.match(new RegExp(`^${prefix}(\\d+)$`));
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return prefix + String(nextNumber).padStart(3, "0");
}

//Password generation
async function generatePassword(role, regNo) {
  // map roles to prefixes
  const prefixMap = {
    STUDENT: "Student",
    TUTOR: "Tutor",
    ADMIN: "Admin"
  };

  const prefix = prefixMap[role.toUpperCase()] || role;

  // get last 3 characters of regNo
  const lastThreeDigits = regNo.slice(-3);

  // get current year
  const currentYear = new Date().getFullYear();

  // construct password
  const password = `${prefix}${lastThreeDigits}@${currentYear}`;

  return password;
}

// ======================================================
// Get available tutors
// ======================================================

router.get("/available-tutors", async (req, res) => {
  try {

    let { medium, assignedCourses, batch } = req.query;

    if (!medium || !assignedCourses || !batch) {
      return res.status(400).json({
        msg: "Medium, assignedCourses and batch are required"
      });
    }

    // Convert to arrays if a single value is received
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
      "_id firstName lastName email regNo medium batch assignedCourses"
    );

    res.json(tutors);

  } catch (err) {

    console.error("Error fetching tutors:", err);

    res.status(500).json({ error: err.message });

  }
});


// ======================================================
// Signup
// ======================================================

router.post("/signup", async (req, res) => {

  try {

    const {

      firstName,
      lastName,
      email,
      role,
      medium,
      batch,
      plan,
      status,
      tutorIncharged,
      assignedCourses

    } = req.body;

    const regNo = await generateRegNo(role);

    const password = await generatePassword(role, regNo);

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        msg: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({

      regNo,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role

    });

    // ============================
    // STUDENT
    // ============================

    if (user.role === "STUDENT") {

      user.medium = medium;
      user.batch = batch;
      user.plan = plan;
      user.status = status;
      user.assignedCourses = assignedCourses;

      // Use tutor selected from frontend
      if (tutorIncharged) {

        user.tutorIncharged = tutorIncharged;

      }

      // Otherwise automatically assign one
      else {

        const tutors = await User.find({

          role: "TUTOR",

          medium: {
            $in: Array.isArray(medium)
              ? medium
              : [medium]
          },

          assignedCourses: {
            $in: Array.isArray(assignedCourses)
              ? assignedCourses
              : [assignedCourses]
          },

          batch: {
            $in: Array.isArray(batch)
              ? batch
              : [batch]
          }

        }).select("_id");

        if (!tutors.length) {

          return res.status(400).json({
            msg: "No tutor found for the selected Medium, Batch and Course."
          });

        }

        user.tutorIncharged = tutors[0]._id;

      }

    }

    // ============================
    // TUTOR
    // ============================

    else if (user.role === "TUTOR") {

      user.medium = medium;

      user.batch = batch;

      user.assignedCourses = assignedCourses;

    }

    await user.save();

    // ✉️ Send email
    const passwordPlain = password; // Store plain password temporarily for email
    
 
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Welcome to Learn Deutsch Student Portal 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; color: #000000; line-height: 1.6;">
          <p>Hello ${user.firstName} ${user.lastName},</p>

          <p>You have successfully registered to the <strong>Learn Deutsch Student Portal</strong>. Here are your login credentials:</p>

          <ul>
            <li><strong>Web App ID:</strong> ${user.regNo}</li>
            <li><strong>Password:</strong> ${passwordPlain}</li>
          </ul>

          <p>Please keep this information safe and do not share it with anyone.</p>

          <p>Best regards
        </div>
      `
    };


    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Email sent to", user.email);
    } catch (err) {
      console.error("❌ Email sending failed:", err);
  }

    res.status(201).json({ msg: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { regNo, password } = req.body;

    // Find user by registration number
    const user = await User.findOne({ regNo });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Web App ID or Password" });
    }

    // Block withdrew students
    if (user.role === "STUDENT" && user.status === "WITHDREW") {
      return res.status(403).json({
        msg: "Your account has been withdrawn. Please contact the administrator."
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Web App ID or Password" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        regNo: user.regNo,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Print token in terminal (for development only)
    console.log("JWT Token:", token);

    // Store JWT in cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false,      // Change to true in production with HTTPS
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    // Return user details
    return res.status(200).json({
      msg: "Login successful",
      user: {
        id: user._id,
        regNo: user.regNo,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        medium: user.medium,
        batch: user.batch,
        assignedCourses: user.assignedCourses,
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message
    });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("authToken", { path: "/" });
  return res.status(200).json({ msg: "Logout successful" });
});

// Get all students (Admin only)
router.get("/students", verifyToken, checkRole('ADMIN'), async (req, res) => {
  try {
    const students = await User.find({ role: "STUDENT" }).select("-password");
    res.json(students);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get STudents by Tutor (Tutor only)
// ======================================================
// Get Students Assigned to Logged-in Tutor
// ======================================================

router.get(
    "/tutor/students",
    verifyToken,
    checkRole("TUTOR"),
    async (req, res) => {

        try {

            // -----------------------------------------
            // Find students assigned to this tutor
            // -----------------------------------------

            const students = await User.find({

                role: "STUDENT",

                tutorIncharged: req.user.id

            }).select("-password");


            // -----------------------------------------
            // Return students
            // -----------------------------------------

            return res.status(200).json(students);

        }
        catch (err) {

            console.error(
                "Error fetching tutor students:",
                err
            );

            return res.status(500).json({
                error: err.message
            });

        }

    }
);

// Get all tutors (Admin only)
router.get("/tutors", verifyToken, checkRole('ADMIN'), async (req, res) => {
  try {
    const tutors = await User.find({ role: "TUTOR" }).select("-password");
    res.json(tutors);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;



