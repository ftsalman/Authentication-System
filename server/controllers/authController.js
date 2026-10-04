import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: " Missing Details " });
  }

  try {
    const existinguser = await userModel.findOne({ email });

    if (existinguser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedpassword,
    });
    await user.save();

    // token
    const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV === "development" ? "node" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  } catch (err) {
    res.json({ success: false, message: "Internal Server Error" });
  }
};
