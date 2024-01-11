import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { deleteVideo, getVideoById, publishAVideo, togglePublishStatus, updateVideo, updateVideoThumbnail } from "../controllers/videos.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { checkVideoOwner } from "../middlewares/checkOwner.middlewares.js";

const videoRouter = Router();

videoRouter.route("/publishAVideo").post(verifyJWT,
    upload.fields([
        {
            name: "video", maxCount: 1
        },
        {
            name: "thumbnail", maxCount: 1
        }
    ]), publishAVideo);

videoRouter.route("/getVideo/:videoId").get(getVideoById);

videoRouter.route("/updateVideo/:videoId").post(verifyJWT, checkVideoOwner, updateVideo);

videoRouter.route("/updateThumbnail/:videoId").post(verifyJWT, checkVideoOwner, upload.single("thumbnail"), updateVideoThumbnail);

videoRouter.route("/deleteVideo/:videoId").post(verifyJWT, checkVideoOwner, deleteVideo);

videoRouter.route("/togglePublishStatus/:videoId").post(verifyJWT, checkVideoOwner, togglePublishStatus);

export default videoRouter;