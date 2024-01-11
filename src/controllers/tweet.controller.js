import { Tweet } from "../models/tweet.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponce } from "../utils/ApiResponce.js"

const createTweet = asyncHandler(async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user._id;

        if (!content) {
            throw new ApiError(400, "content is required");
        }

        await Tweet.create({
            content: content,
            owner: userId
        });
        return res
            .status(200)
            .json(new ApiResponce(200, "new tweet created successfully!!!"));

    } catch (error) {
        throw new ApiError(400, "something wrong while creating tweet")
    }
});

const getUserTweet = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
    
        const tweets = await Tweet.find({ owner: userId });
    
        if (!tweets) {
            throw new ApiError(400, "No tweets found for required user???");
    
        }
    
        return res
            .status(200)
            .json(new ApiResponce(200, "all tweets found successfully", { tweets }));
    
    } catch (error) {
        console.log(error);
        throw new ApiError(400, "Something went wrong while fetching tweets???");
    }
});


const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "content is required");
    }

    try {
        await Tweet.findByIdAndUpdate(tweetId, { $set: { content: content } });
        return res
            .status(200)
            .json(new ApiResponce(200, "tweet Updated successfully"));

    } catch (error) {
        console.log(error);
        throw new ApiError(400, "Something went wrong while fetching tweets???");
    }
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    try {
        await Tweet.findByIdAndDelete(tweetId);
        return res
            .status(200)
            .json(new ApiResponce(200, "tweet deleted successfully"));

    } catch (error) {
        console.log(error);
        throw new ApiError(400, "Something went wrong while fetching tweets???");
    }
});

export {
    createTweet,
    getUserTweet,
    updateTweet,
    deleteTweet
}