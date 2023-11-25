//  require('dotenv').config({path:'./env'});
import env from "dotenv"
env.config();
import connectdb from "./db/index.js";
import { app } from "./app.js";


// console.log(process.env.CLOUDINARY_CLOUD_NAME)


connectdb()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log("server running on port ", process.env.PORT);
        });
    })
    .catch(() => {
        console.log("mongo db connection failed ????");
    });