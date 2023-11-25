import env from "dotenv"
env.config();
import fs from "fs";
import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({
//     cloud_name: 'dcbnhr4jc',
//     api_key: '883631329717295',
//     api_secret: '3xaBZy_fGbj5lHGEOzDGI4Ie5n8'
// });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("no local file path");
            return null;
        }
        const responce = await cloudinary.uploader.upload(localFilePath,
            { resource_type: 'auto' });
        console.log("file uploded sucessfully on cloudinary");
        // console.log(responce.url);
        fs.unlinkSync(localFilePath);
        return responce;
    }
    catch (error) {
        // console.log("error :", error);
        return null;
    }
}

export { uploadOnCloudinary };
