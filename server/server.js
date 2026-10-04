import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongdb.js";

dotenv.config({ path: "./server/.env" });

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

app.get("/", (req, res) => {res.send("API Woring Fine");});




app.listen(PORT, () => console.log(` Server  Runing on Port ${PORT}`));
