// route/user.js

const express = require('express');
const axios = require('axios');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/emailConfig');
const User = require('../models/User');
const Course = require('../models/Course');
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
    TEACHER: "Teacher",
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

// Get tutors by student level + medium
router.get("/tutors", async (req, res) => {
  try {
    const { level, medium } = req.query;

    if (!level || !medium) {
      return res.status(400).json({ msg: "Level and medium are required" });
    }

    // 1️⃣ Find the course for this level
    const course = await Course.findOne({ title: level }); // assuming title = level like "A1"
    if (!course) {
      return res.status(404).json({ msg: "No course found for this level" });
    }

    // 2️⃣ Find tutor who teach this course & match medium
    const teachers = await User.find({
      role: "TUTOR",
      medium: { $in: [medium] },
      assignedCourses: { $in: [course._id] }
    }).select("name email regNo medium assignedCourses");

    if (!teachers || teachers.length === 0) {
      return res.status(404).json({ msg: "No tutors found for this level and medium" });
    }

    res.json(teachers);
  } catch (err) {
    console.error("Error fetching tutors:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get tutors by student medium
router.get("/tutorsByMedium", async (req, res) => {
  try {
    const { medium } = req.query;

    if (!medium) {
      return res.status(400).json({ msg: "Medium is required" });
    }

    const tutors = await User.find({
      role: "TUTOR",
      medium: { $in: [medium] }
    }).select("name email regNo medium assignedCourses");

    if (!tutors || tutors.length === 0) {
      return res.status(404).json({ msg: "No tutors found for this medium" });
    }

    res.json(tutors);
  } catch (err) {
    console.error("Error fetching tutors:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ Signup
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
        assignedCourses,
        createdAt
    } = req.body;

    const regNo = await generateRegNo(role);  
    const password = await generatePassword(role, regNo); // generate random password
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      regNo,   // <-- assign here
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    if (user.role === "STUDENT") {
      user.assignedCourses = assignedCourses;
      user.batch = batch;
      user.medium = medium;
      user.studentStatus = "UNCERTAIN";
      
      // Tutor Incharge logic
      if (tutorIncharged) {
        // case 1: frontend provided teacher id
        user.tutorIncharged = tutorIncharged;
      } else {
        // case 2: backend finds one automatically
        const course = await Course.findOne({ level });
        if (!course) {
          return res.status(400).json({ msg: "No course found for this level" });
        }

        const teacher = await User.findOne({
          role: "TUTOR",
          medium: { $in: [medium] },
          assignedCourses: course._id
        });

        if (teacher) {
          user.tutorIncharged = teacher._id;
        } else {
          return res.status(400).json({ msg: "No teacher found for this level and medium" });
        }
      }

    }

    else if (user.role === "TUTOR") {
      user.batch = batch;
      user.medium = medium;
      user.assignedCourses = assignedCourses; // Assign courses if provided
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
          <p>Hello ${user.name},</p>

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
        assignedCourses: user.assignedCourses
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;



