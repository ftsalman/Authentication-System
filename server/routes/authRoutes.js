import Express from "express";
import {
  login,
  register,
  logout,
  sentVerifyOtp,
  verifyEmail,
  isAccountVerified,
  resetPassword,
  sendRestOtp,
} from "../controllers/authController.js";
import { userAuth } from "../middleware/userAuth.js";

const authRouter = Express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sentVerifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.post("/is-auth", userAuth, isAccountVerified);
authRouter.post("/send-reset-otp", sendRestOtp);
authRouter.post("/reset-password",resetPassword);

export default authRouter;
