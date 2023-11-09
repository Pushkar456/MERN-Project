//  require('dotenv').config({path:'./env'});
import env from "dotenv"
env.config()
import connectdb from "./db/index.js";
import app from "./app.js";



connectdb()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log("server running on port jknk")
        });
    })
    .catch(() => {
        console.log("mongo db connection failed ????");
    });