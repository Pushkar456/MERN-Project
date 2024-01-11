import { Router } from "express";
import {
    loginUser,
    registerUser,
    logoutUser,
    updateRefreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCover,
    getChannelDetails,
    getUserWatchHistory
} from "../controllers/users.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const userRouter = Router();

userRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

userRouter.route("/login").post(loginUser);

//secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser);

userRouter.route("/refresh-Tokens").post(updateRefreshAccessToken);

userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);

userRouter.route("/current-user").get(verifyJWT, getCurrentUser);

userRouter.route("/update-account").patch(verifyJWT, updateUserDetails);

userRouter.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

userRouter.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCover);

userRouter.route("/c/:username").get(verifyJWT, getChannelDetails);

userRouter.route("/history").get(verifyJWT, getUserWatchHistory);

export default userRouter;
