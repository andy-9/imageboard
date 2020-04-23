const aws = require("aws-sdk");
const fs = require("fs");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

exports.upload = (req, res, next) => {
    if (!req.file) {
        console.log("req.file isn't there");
        return res.sendStatus(500);
    }
    const { filename, mimetype, size, path } = req.file;

    const promise = s3
        .putObject({
            Bucket: "spicedling", // spiced' creds
            ACL: "public-read", // ACL public-read: once the file is uploaded anyone can see the file
            Key: filename,
            Body: fs.createReadStream(path), // stream file to amazon
            ContentType: mimetype, // type of file
            ContentLength: size,
        })
        .promise(); // returns whole function as a promise, which we then .then and .catch:

    promise
        .then(() => {
            console.log("s3.js: amazon put object complete, everything worked");
            next(); // necessary since it's a middleware function
            fs.unlink(path, () => {}); // keeps uploads clean, is optional
        })
        .catch((err) => {
            console.log("error in upload put object in s3.js:", err);
            res.sendStatus(500);
        });
};
