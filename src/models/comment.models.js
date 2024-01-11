import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    commentBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    commentTo: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    }
}, { timestamps: true })

commentSchema.plugin(mongooseAggregatePaginate);
export const Comment = mongoose.model("Comment", commentSchema);