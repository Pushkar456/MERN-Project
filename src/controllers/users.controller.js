import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js";



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
        new ApiResponce(200, "user succefully registered", createdUser))

});

// async function registerUser(req, res, next) {
//     console.log("okkk");
//     res.status(200).json({
//         message: "okk"
//     });
// }

export {
    registerUser,
};