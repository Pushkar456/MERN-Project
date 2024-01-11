import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const content = req.body;
    const userId = req.user._id;
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    
});


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}