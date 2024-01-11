import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// import { Users } from "./users.models";

const videosSchema = mongoose.Schema({
    id: {
        type: String,
        unique: true
    },
    videoFile: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    duration: {
        type: Number
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },


}, { timestamps: true })

videosSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videosSchema);

// export { Video }