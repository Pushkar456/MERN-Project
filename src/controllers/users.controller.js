import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken";

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

        return ({ accessToken: accessToken, refreshToken: refreshToken });

    } catch (error) {
        console.log(error);
        throw new ApiError(400, "something went wrong while generating tokens");
    }
};
// **********************REGISTER user controller code************************************* 

const registerUser = asyncHandler(async (req, res) => {

    //* take data from user
    const { fullName, username, password, email } = req.body;

    //* validate data - not 
    if ([fullName, username, password, email].some((fieled) => fieled?.trim() === "")) {
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
   
    const avatarLocalpath = req.files?.avatar[0]?.path;
   
    let coverImageLocalpath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalpath = req.files.coverImage[0].path
    }

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
const logoutUser = asyncHandler(async (req, res) => {
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

// **********************Refresh access Tocken user controller code*****************************************
const updateRefreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Invalid refresh token");
    }
    try {

        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedRefreshToken?._id);

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token Exired or used");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user?._id);

        const options = {
            htmlOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponce(200, { accessToken, refreshToken: refreshToken }, "new accessToken generated succesfully")
            )
    } catch (error) {
        throw new ApiError(401, error?.massage || "AccessToken Refresh Faied ???");
    }
})

// **********************change current password controller code*****************************************
const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword, confirmPassword } = req.body;
    
    if (!(newPassword === confirmPassword)) {
        throw new ApiError(400, "confirmPassword should equal to newPassword");
    }

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "password changed succesfully"));

});

// **********************change current password controller code*****************************************
const updateUserDetails = asyncHandler(async (req, res) => {

    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiResponce(400, "All Fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponce(200, { user: user }, "Details Updated successfully !!!"));
});

// **********************change current user image controller code*****************************************
const updateUserAvatar = asyncHandler(async (req, res) => {
    
    const avatarLocalpath = req.file?.path;
    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar is required");
    }

    //uploade on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalpath); //full object of image have url 
    if (!avatar) {
        throw new ApiError(400,"something went wrong while uploading images???")
    }

    const user = User.findByIdAndUpdate(req.user?._id, { $set: { avatar: avatar.url } }).select("-password");
    
    return res
        .status(200)
        .json(new ApiResponce(200, {user:user}, "Avatar updated succesfully"))
    
})

// **********************change current user cover image controller code*****************************************
const updateUserCover = asyncHandler(async (req, res) => {

    const coverLocalpath = req.file?.path;
    if (!coverLocalpath) {
        throw new ApiError(400, "Cover image is required");
    }

    //uploade on cloudinary
    const coverImage = await uploadOnCloudinary(coverLocalpath); //full object of image have url 
    if (!coverImage) {
        throw new ApiError(400, "something went wrong while uploading images???")
    }

    const user = User.findByIdAndUpdate(req.user?._id, { $set: { coverImage: coverImage.url } }).select("-password");

    return res
        .status(200)
        .json(new ApiResponce(200, { user: user }, "coverImage updated succesfully"))

})

// **********************get current user controller code*****************************************
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponce(200, { user: req.user }, "current user get successfully"));
})

// **********************User and subription aggrigation pipline controller code*****************************************
const getChannelDetails = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "username is required");
    }
    const channel = User.aggregate([
        {
            //match all the fields with given input and passes the value to next piplline
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            //look for all the match within two databesses #here look for channel and _id
            $lookup: {
                form: "subscriptions",   //from which db to look
                localField: "_id",       //for which field
                foreignField: "channel", //for which field in from db //hre from subscriptions
                as: "subscribers"         //create new field of founded data and storaded as
            }
        },
        {
            $lookup: {
                form: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {  // add new fields to existing document and passes to next pipeline
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                subscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    // cond is for condition take three args if<condition>,then<if true>,else<if false>
                    $cond: {
                        if: { $in: [req.user?._id, ' $subscribers.subscriber'] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {   //project what field are to be pass next // 1 for true and 0 for false
            $project: {
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                username: 1,
                email: 1,
                avatar: 1,
                fullName: 1,
                coverImage: 1
            }
        }
    ]);//aggregate returns an array of objects
    // console.log(channel);

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, { channel: channel[0] }, "channel found succesfully"));

});

// **********************User watch History sub aggrigation pipline controller code*************************
const getUserWatchHistory = asyncHandler(async (req, res) => {
    const user = User.aggregate(
        {
            $match: {
                // aggregation are called direct mongodb that why we have to convert _id to ObjectId
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                // sub pipeline as watchHistory is a array and also have owner field which is from user model
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            // sub pipeline for not fetching all data of user 
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        },
                        // as owner is a array and only having required data in first index object so not proving whole array to frontend and only provide nccessary data hence this addField pipeline here
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    );

    return res
        .status(200)
        .json(new ApiResponce(200, user[0].watchHistory, "watchHistory fetched successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    updateRefreshAccessToken,
    changeCurrentPassword,
    updateUserDetails,
    getCurrentUser,
    updateUserAvatar,
    updateUserCover,
    getChannelDetails,
    getUserWatchHistory,
};