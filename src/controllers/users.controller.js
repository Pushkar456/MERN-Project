import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js";

//******************** Method for gereration of access and refresh token********************//
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // console.log("gereating tokens");
        const user = await User.findById(userId);
        // console.log(user);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        // console.log("tokens here");
        // console.log(accessToken,refreshToken);

        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });
    
        return ({ accessToken:accessToken, refreshToken:refreshToken });
        
    } catch (error) {
        console.log(error);
        throw new ApiError(400, "something went wrong while generating tokens");
    }
}

// **********************REGISTER user controller code************************************* 

const registerUser = asyncHandler(async (req, res) => {
    // return (res.status(200).json({
    //     message: "okk"
    // }));

    //* take data from user
    const { fullName, username, password, email } = req.body;

    //* validate data - not 
    if ([fullName, username, password, email].some((filed) => filed?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    //* check if user already exists , username fullName
    const isExist = await User.findOne({
        $or: [{ email }, { username }]
    });
    if (isExist) {
        throw new ApiError(409, "username or email is already exists");
    }
    //* check for Images (check for avatar)
    console.log(req.files)
    const avatarLocalpath = req.files?.avatar[0]?.path;
    // const coverImageLocalpath = req.files?.coverImage[0]?.path;
    let coverImageLocalpath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalpath = req.files.coverImage[0].path
    }
    console.log(coverImageLocalpath, avatarLocalpath);

    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar file is required");
    }
    //* uploade them to cloudinary (check for avatar)
    const avatar = await uploadOnCloudinary(avatarLocalpath);
    const coverImage = await uploadOnCloudinary(coverImageLocalpath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    //* create user object and create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    //* remove passwords and refreshTockens from the responce 
    //*check for user creation
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registrting new user");
    }
    //* return res
    res.status(201).json(
        new ApiResponce(200, createdUser, "user succefully registered"))

});

// **********************LOGIN user controller code******************************************
const loginUser = asyncHandler(async (req, res) => {

    // take data from the frontend
    const { email, password, username } = req.body;
    
    // check for email or username
    if (!email && !username) {
        throw new ApiError(400, "username or email is required");
    }

    //make a db call find user with the email or username
    const foundUser = await User.findOne({ $or: [{ username }, { email }] });

    if (!foundUser) {
        throw new ApiError(404, "user does not exist")  
    }

    // password validation 
    const isPasswordValid = await foundUser.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "password is incorrect")  
    }
    
    // generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(foundUser._id);
    
    const loggedInUser = await User.findById(foundUser._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(200,
                {
                    user: loggedInUser,
                    accessToken: accessToken,
                    refreshToken: refreshToken
                },
                "user logged in succesfully !!!"
            )
        );


})

// **********************LOGOUT user controller code*****************************************
const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponce(200, {}, "User loged out"));
    
});

export {
    registerUser,
    loginUser,
    logoutUser
};