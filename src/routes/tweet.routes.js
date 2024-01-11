import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { createTweet, deleteTweet, getUserTweet, updateTweet } from "../controllers/tweet.controller.js";
import { checkTweetOwner } from "../middlewares/checkOwner.middlewares.js";


const tweetRouter = Router();

tweetRouter.route("/createTweet").post(verifyJWT, createTweet);

tweetRouter.route("/getUserTweet/:userId").get(getUserTweet);

tweetRouter.route("/updateTweet/:tweetId").post(verifyJWT, checkTweetOwner, updateTweet);

tweetRouter.route("/deleteTweet/:tweetId").post(verifyJWT, checkTweetOwner, deleteTweet);


export default tweetRouter;