const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
    const existingEmail = await User.findOne({ email:email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingUsername = await User.findOne({ userName:userName });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const existingPhone = await User.findOne({ phone:phone });
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
    console.log("New user created:", user._id);

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

    if (!password || (!email && !userName)) {
      return res.status(400).json({ message: "Username/email & password required" });
    }

    // If role provided, verify it's valid
    if (role && !isValidRole(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Allowed values: 'user' or 'owner'" });
    }

    // Determine login method (email or username)
    const query = email ? { email } : { userName };

    // Find user (include password for comparison)
    const user = await User.findOne(query).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // If role was provided on login, ensure it matches stored user role
    if (role && user.role !== role) {
      return res.status(403).json({ message: "Role mismatch for this user" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Sign JWT with role included
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.getmydata=async(req,res)=>{
    try{
        const userId=req.user.id;
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({fetched:false,message:"User not found"});
        }
        res.status(200).json({fetched:true, user:user });
    } catch (error) {
        res.status(500).json({ fetched:false, message: "Failed to retrieve user data", error: error.message });
    }
};