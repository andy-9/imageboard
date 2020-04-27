const express = require("express");
const app = express();
const db = require("./db.js");
const s3 = require("./s3");
const config = require("./config");

app.use(express.static("public"));
app.use(express.json());

////////////////// IMAGE UPLOAD BOILERPLATE //////////////////

// multer saves files to our hard drive:
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    // where should our files be saved?:
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    // each file we upload has a different unique name, original name at the end:
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    // limit added (2MB):
    limits: {
        fileSize: 2097152,
    },
});

////////////////// GET AND POST ROUTES //////////////////

////////// GET DATA FOR SITE //////////

app.get("/images", (req, res) => {
    db.getInfoAndImage()
        .then((results) => {
            // console.log("results to bring on site:", results);
            res.json(results.reverse());
        })
        .catch((err) => {
            console.log("index.js, catch for getInfoAndImage:", err);
        });
});

////////// POST DATA FROM SITE - UPLOAD TO AWS & PUT IN DATABASE //////////

// "single" is a method of uploader
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    // console.log("index.js POST /upload, uploaded (req.)file:", req.file); // uploaded file
    filename = req.file.filename;
    console.log("index.js POST /upload, changed filename:", filename);
    console.log("index.js POST /upload, config.s3Url", config.s3Url);
    let url = config.s3Url + filename;
    console.log("index.js POST /upload, complete new url:", url);

    // console.log("index.js POST /upload, uploaded input:", req.body); // input fields from client
    username = req.body.username;
    console.log("index.js POST /upload, username:", username);
    title = req.body.title;
    console.log("index.js POST /upload, title:", title);
    description = req.body.description;
    console.log("index.js POST /upload, description:", description);

    if (req.file) {
        db.insertInfoAndImageUrl(url, username, title, description)
            .then((response) => {
                // console.log("RETURNING INSERT data from database:", response);
                userInsert = response.rows[0];
                console.log(
                    "index.js POST /upload, response from db.insertInfoAndImageUrl, userInsert:",
                    userInsert
                );
                res.json({
                    userInsert,
                    // success: true,
                });
            })
            .catch((err) => {
                console.log("catch in POST /upload to database", err);
            });
    } else {
        res.json({
            success: false,
        });
    }
});

////////// GET DATA FOR MODULE //////////

app.get("/modal-id/:id", (req, res) => {
    let modalInfoAndComments = [];
    console.log("index.js, get modal id:", req.params.id);

    // get image info for modal
    db.getModalInfo(req.params.id)
        .then((modalInfoResults) => {
            console.log("index.js, results after modalInfo:", modalInfoResults);
            modalInfoAndComments.push(modalInfoResults);
            console.log(
                "index.js, modalInfoAndComments after db.getModalInfo ran:",
                modalInfoAndComments
            );
        })
        .then(() => {
            return db.getComments(req.params.id);
        })

        // get comments for selected image
        .then((commentResults) => {
            console.log(
                "index.js, results reversed after getComments:",
                commentResults.reverse()
            );
            modalInfoAndComments.push(commentResults);
            console.log(
                "index.js, modalInfoAndComments after db.getComments ran:",
                modalInfoAndComments
            );
            res.json(modalInfoAndComments);
        })
        .catch((err) => {
            console.log("index.js, catch for getModalInfo & getComments:", err);
        });
});

////////// GET COMMENTS FOR MODULE //////////
app.post("/comment", (req, res) => {
    console.log("index.js POST /comment, req.params:", req.params);
    console.log("index.js POST /comment, req.body:", req.body);
    commenter = req.body.commenter;
    console.log("index.js POST /comment, commenter:", commenter);
    comment = req.body.comment;
    console.log("index.js POST /comment, comment:", comment);
    image_id = req.body.image_id;
    console.log("index.js POST /comment, image_id:", image_id);

    db.insertCurrentComment(commenter, comment, image_id)
        .then((currentComment) => {
            console.log("RETURNING INSERT data from database:", currentComment);
            userProp = currentComment.rows[0];
            console.log(
                "index.js POST /comment, response from db.insertCurrentComment, userProp:",
                userProp
            );
            res.json({
                userProp,
            });
        })
        .catch((err) => {
            console.log("catch in POST /comment to database", err);
        });
});

app.listen(8080, () => console.log("index.js: IB server is listening."));
