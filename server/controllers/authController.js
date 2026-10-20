import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { transporter } from "../config/nodemailer.js";

//  REGISTER USER CONTROLLER ✍️

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existinguser = await userModel.findOne({ email: normalizedEmail });

    if (existinguser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email: normalizedEmail,
      password: hashedpassword,
    });
    await user.save();

    // token 🎟️
    const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Sending Welcome Email  👏

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: normalizedEmail,
      subject: "Welcome to  Our Platform 🫴 ",
      text: ` Welcome to our platform , Your account  has been created with email id:${normalizedEmail}`,
    };
    await transporter.sendMail(mailOptions);

    // response
    return res
      .status(201)
      .json({ success: true, message: "Registered successfully" });
  } catch (err) {
    console.error("Registration failed:", err.message);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// LOGIN USER CONTROLLER ✍️

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email  and Password are Required",
    });
  }

  try {
    const user = await userModel.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.json({ success: false, message: "Invalid Credentials 🚫" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: " Invalid Password 🚫" });
    }

    // token 🎟️
    const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Login  Sucessfully 🎉" });
  } catch (err) {
    console.error("Login failed:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error 🚫" });
  }
};

//   LOGOUT USER CONTROLLER ✍️

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout failed:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

//  VERIFY EMAIL OTP CONTROLLER ✍️

export const sentVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Already Verified your Account",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpEx = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    //  sending otp  mail 📤

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify your Email",
      text: `Your verification code is ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("Response:", info.response);

    res.json({ success: true, message: " Otp  sent  Sucessfully" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

//   Verify Email address  controller ✍️

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User  not found" });
    }

    if (!user.verifyOtp || String(user.verifyOtp).trim() !== String(otp).trim()) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpEx < Date.now()) {
      return res.json({ success: false, message: "OTP has expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpEx = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Email Verified Successfully 🥳",
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

// check   user  Autheticated

export const isAccountVerified = async (req, res) => {
  try {
    res.json({ success: true, message: "" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

//  SEND   PASSWORD RESET OTP CONTROLLER ✍️

export const sendRestOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({ success: false, message: "User  not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpiryAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    //  sending otp  mail 📤

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset  OTP",
      text: `Your OTP is ${otp}.Verify your Account using  this OTP. To proceed  with  resetting your  password.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

//  Reset  User  Password Controller ✍️

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({ success: false, message: " User  not Found" });
    }

    if (!user.resetOtp) {
      return res.json({
        success: false,
        message: "No reset OTP requested. Call /send-reset-otp first",
      });
    }

    if (String(user.resetOtp).trim() !== String(otp).trim()) {
      if (user.verifyOtp && String(user.verifyOtp).trim() === String(otp).trim()) {
        return res.json({
          success: false,
          message:
            "This is your email verification OTP. Use the code from the 'Password Reset OTP' email",
        });
      }
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpiryAt < Date.now()) {
      return res.json({ success: false, message: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiryAt = 0;
    await user.save();

    return res.json({ success: true, message: "Password reset  successfully" });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};
