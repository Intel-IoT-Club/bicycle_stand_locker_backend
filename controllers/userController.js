const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// Helper: validate role
const isValidRole = (role) => {
  const allowed = ["user", "owner"];
  return allowed.includes(role);
};

// ============================
//        SIGN UP
// ============================
exports.signup = async (req, res) => {
  try {
    const { userName, email, password, phone, role } = req.body;
    // Basic required fields check
    if (!userName || !email || !password || !phone) {
      return res
        .status(400)
        .json({ message: "Username, email, phone & password are required" });
    }

    // Validate role if provided (or set default)
    const roleToUse = role ? role : "user";
    if (!isValidRole(roleToUse)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Allowed values: 'user' or 'owner'" });
    }

    // Check uniqueness: email, username, phone
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingUsername = await User.findOne({ userName: userName });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const existingPhone = await User.findOne({ phone: phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      userName,
      email,
      phone,
      role: roleToUse,
      password: hashedPassword,
    });
    await user.save();

    // Create JWT including role
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// ============================
//          LOGIN
// ============================
// Accepts payload: { email? OR userName?, password, role? }
exports.login = async (req, res) => {
  try {
    const { email, userName, password, role } = req.body;
    console.log("Login attempt payload:", { email, userName, role, password: password ? "********" : "MISSING" });

    if (!password || (!email && !userName)) {
      console.warn("Login failed: Missing credentials");
      return res.status(400).json({ message: "Username/email & password required" });
    }

    // If role provided, verify it's valid
    if (role && !isValidRole(role)) {
      console.warn("Login failed: Invalid role", role);
      return res
        .status(400)
        .json({ message: "Invalid role. Allowed values: 'user' or 'owner'" });
    }

    // Determine login method (email or username)
    const query = email ? { email } : { userName };

    // Find user (include password for comparison)
    const user = await User.findOne(query).select("+password");
    if (!user) {
      console.warn("Login failed: User not found", query);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // If role was provided on login, ensure it matches stored user role
    if (role && user.role !== role) {
      console.warn("Login failed: Role mismatch", { provided: role, actual: user.role });
      return res.status(403).json({ message: "Role mismatch for this user" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn("Login failed: Password incorrect");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Sign JWT with role included
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("Login successful for user:", user.email);
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.getmydata = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ fetched: false, message: "User not found" });
    }
    res.status(200).json({ fetched: true, user: user });
  } catch (error) {
    res.status(500).json({ fetched: false, message: "Failed to retrieve user data", error: error.message });
  }
};

// ============================
//      FORGOT PASSWORD
// ============================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account with that email address exists." });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Nodemailer configuration
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${token}`;

    const mailOptions = {
      to: user.email,
      from: `"Smart Locker Support" <${process.env.EMAIL_USER}>`,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1f5fe; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #016766; text-align: center;">Smart Locker Password Reset</h2>
          <p>Hello,</p>
          <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
          <p>Please click on the following button, or paste the link into your browser to complete the process within one hour of receiving it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #016766; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777; text-align: center;">&copy; ${new Date().getFullYear()} Smart Locker System</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "A password reset link has been sent to your email."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Forgot password failed", error: error.message });
  }
};

// ============================
//      RESET PASSWORD
// ============================
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Success! Your password has been changed." });
  } catch (error) {
    res.status(500).json({ message: "Reset password failed", error: error.message });
  }
};