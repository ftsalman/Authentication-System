import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongdb.js";
import authRouter from "./routes/authRoutes.js";

dotenv.config({ path: "./server/.env" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

// API Endpoints  🪝

app.get("/", (req, res) => {
  res.send("API Woring Fine 💡");
});

app.use("/api/auth", authRouter);

try {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from server/.env");
  }
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} catch (error) {
  console.error(`Server startup failed: ${error.message}`);
  process.exitCode = 1;
}
