import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponce } from "../utils/ApiResponce.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/videos.models.js";



const getAllVideo = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const skip = (page - 1) * limit;
    
    const allVideos = await Video.find(query).limit(limit).sort({ [sortBy]: sortType }).skip(skip);

});

const publishAVideo = asyncHandler(async (req, res) => {
    try {

        // get tittle and description from req.body
        const { title, description } = req.body;
        const userId = req.user?._id;

        if (!title) {
            throw new ApiError(400, "video tittle is required???");
        }

        // video and thumnail from multer
        const videoLocalPath = req.files?.video[0]?.path;
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

        // upload on cloudinary
        const video = await uploadOnCloudinary(videoLocalPath)
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!video || !thumbnail) {
            throw new ApiError(200, "something went wrong while uploading on clouudinary");
        }

        // console.log(video);
        //create Video entity and save
        const createdVideo = await Video.create({
            videoFile: video.url,
            thumbnail: thumbnail.url,
            title,
            description,
            owner: userId,
            duration: Math.round(video.duration)
        });

        return res
            .status(200)
            .json(new ApiResponce(200, "succefully uploaded", { createdVideo }));

    } catch (error) {
        console.log(error);
        throw new ApiError(401, "something went wrong while plushing video???")
    }


});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(500, "video not found");
        }
        return res.status(200).json(new ApiResponce(200, "video found successfully", { video }));
    } catch (error) {
        throw new ApiError(500, "something went wrong while finding vidoe by id");
    }

})

const updateVideo = asyncHandler(async (req, res) => {

    console.log("check 1");
    try {
        const { videoId } = req.params;
        const { title, description } = req.body;

        console.log("check 2", title, description, videoId);
        
        if (!title && !description) {
            throw new ApiError(400, "title or description is required to update");
        }

        console.log("check 3");
        const video = await Video.findById(videoId);

        console.log("check 4", video);
        
        if (!video) {
            throw new ApiError(401, "video not Found??");
        }

        if (title) {
            video.title = title;
        };
        if (description) {
            video.description = description;
        }

        await video.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json(new ApiResponce(200, "video updated successfully", {}));

    } catch (error) {
        throw new ApiError(401, "something went wrong while updating video");
    }

});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const thumbnailLocalPath = req.file?.path;

        if (!thumbnailLocalPath) {
            throw new ApiError(400, "thumnail is required to update");
        };
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnail) {
            throw new ApiError(400, "something went wrong while uploding file on cloudinary");
        };

        await Video.findByIdAndUpdate(videoId, {$set: {thumbnail: thumbnail.url} });

        return res
            .status(200)
            .json(new ApiResponce(200, "thumbnail updated successfuly"));
    } catch (error) {
        console.log(error);
        throw new ApiError(400, "something went wrong while updating thumbnail");
    }
})

const deleteVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;

        await Video.deleteOne({ _id: videoId });

        return res
            .status(200)
            .json(new ApiResponce(200, "video deleted successfully", {}));
    } catch (error) {
        throw new ApiError(400, "somehting went wrong while deleting video");
    }


})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    try {

        // const video = await Video.findByIdAndUpdate(videoId, {
        //     $set: {
        //         isPublished: this.isPublished ? false : true
        // } });

        const video = await Video.findById(videoId);

        video.isPublished = video.isPublished ? false : true;

        await video.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json(new ApiResponce(200, "Publish Status Toggled successfully!!!", {}));

    } catch (error) {
        throw new ApiError(401, "wrong while toogling Publish status")
    }
})


export {
    getAllVideo,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateVideoThumbnail
}