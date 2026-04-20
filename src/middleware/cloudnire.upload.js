const {v2: cloudinary} = require("cloudinary");
const fs = require("fs");

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
});

async function uploadToClodinary(req, res, next){
    const localfilePath = req.file.path;
    try{
        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type : "auto"
        });

        req.cloudinary = {
            public_id : response.public_id,
            secure_url : response.secure_url
        };

        console.log(req.cloudinary);
        
        fs.unlink(localfilePath, (err) => {
            if(err){
                console.log(err);
            }
        });
    }
    catch(err){
        fs.unlinkSync(localfilePath);
        console.log("Error Occured in uploading the file to Cloudinary" , err);
        return null;
    }
    next();
    return;
};


module.exports = {uploadToClodinary};