//  require('dotenv').config({path:'./env'});
import env from "dotenv"
env.config()
import express from "express";
import connectdb from "./db/index.js";


const app = express();

// console.log(`this is env ${process.env.MONGO_URI}`)
connectdb();
app.listen(process.env.PORT, () => {
    console.log("server running on port jknk")
});