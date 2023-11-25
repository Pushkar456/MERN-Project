import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
// app.use(cookieParser);

// app.get("/", (req, res) => {

// });

// Router imports
import userRouter from "./routes/users.routes.js";


app.use("/api/v1/users", userRouter);

// app.get("/",(req,res) => {
//     console.log("okkk");
//     res.send("hello wold");
//     // res.status(200).json({
//     //     message: "okkk"
//     // })
// });

export { app };