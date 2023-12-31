import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import { Videos } from "./videos.models.js";
import env from "dotenv"
env.config();


const userSchema = mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
        },
        username: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "password is required"]
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        coverImage: {
            type: String,
        },
        avatar: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
        },
        watchHistory: {
            type: [{
                type: Schema.Types.ObjectId,
                ref: "Videos"
            }]
        },
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {

    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullname
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {


    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
const User = mongoose.model("User", userSchema);

export { User };