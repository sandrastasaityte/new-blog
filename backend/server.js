import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";
import blogRoutes from "./src/routes/blogRoutes.js";

dotenv.config();
await connectDB();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use("/blogs", blogRoutes);
app.use(notFound);
app.use(errorHandler);


app.get("/", (req, res) => res.send("API running"));

app.use("/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
