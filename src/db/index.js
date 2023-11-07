import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

async function connectdb() {
    try {
        const connectionInstsnce = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`connection succesfully !!!! ${connectionInstsnce}`);
    } catch (error) {
        console.log("connection Failed ??? ", error);
        throw error
    }
}

export default connectdb;