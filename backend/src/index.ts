import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes/index.route";
import { connectDB } from "./configs/database.config";
import cookieParser from "cookie-parser";

dotenv.config();

void connectDB();

const app = express();
const port = 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/", routes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
