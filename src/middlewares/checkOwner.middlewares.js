import { Tweet } from "../models/tweet.models.js";
import { Video } from "../models/videos.models.js";
import { ApiError } from "../utils/ApiErrors.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const checkVideoOwner = asyncHandler(async (req, res, next) => {
    try {
        const { videoId } = req.params;
        const userId = req.user._id;

        const video = await Video.findById(videoId);

        console.log(userId.equals(video.owner) );

        if (!(userId.equals(video.owner))) {
            throw new ApiError(401, "Unauthorized request");
        }

        next();

    } catch (error) {
        console.log(error);
        throw new ApiError(401, error.message || "wrong in checkOwner");
    }
});

const checkTweetOwner = asyncHandler(async (req, res, next) => {
    try {
        const { tweetId } = req.params;
        const userId = req.user._id;

        const tweet = await Tweet.findById(tweetId);

        console.log(userId.equals(tweet.owner) );

        if (!(userId.equals(tweet.owner))) {
            throw new ApiError(401, "Unauthorized request");
        }

        next();

    } catch (error) {
        console.log(error);
        throw new ApiError(401, error.message || "wrong in checkOwner");
    }
});

export {
    checkVideoOwner,
    checkTweetOwner
};