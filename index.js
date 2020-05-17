const express = require("express");
const app = express();
const db = require("./db.js");
const s3 = require("./s3");
const config = require("./config");

app.use(express.static("public"));
app.use(express.json());

const truncateDate = (posttime) => {
    return (posttime = new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
        timeZone: "Etc/GMT",
    }).format(posttime));
};

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
    limits: {
        fileSize: 2097152,
    },
});

////////////////// GET AND POST ROUTES //////////////////

////////// GET DATA FOR SITE //////////

app.get("/images", (req, res) => {
    db.getInfoAndImage()
        .then((results) => {
            console.log(
                "index.js, results to bring on site for getInfoAndImage:",
                results
            );
            resrev = results;
            // resrev = results.reverse();
            res.json(results);
        })
        .catch((err) => {
            console.log("CATCH in index.js for getInfoAndImage:", err);
        });
});

////////// GET MORE DATA FOR SITE //////////
app.post("/load-more", (req, res) => {
    console.log("req.body.lastId:", req.body.lastId);
    db.getMoreImages(req.body.lastId)
        .then((moreImages) => {
            console.log("index.js, moreImages in POST /load-more:", moreImages);
            res.json(moreImages);
        })
        .catch((err) => {
            console.log("CATCH in index.js /load-more:", err);
        });
});

////////// POST DATA FROM SITE - UPLOAD TO AWS & PUT IN DATABASE //////////

// "single" is a method of uploader
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("index.js POST /upload, uploaded (req.)file:", req.file); // uploaded file
    filename = req.file.filename;
    console.log("index.js POST /upload, changed filename:", filename);
    console.log("index.js POST /upload, config.s3Url", config.s3Url);
    let url = config.s3Url + filename;
    console.log("index.js POST /upload, complete new url:", url);

    console.log("index.js POST /upload, uploaded input:", req.body); // input fields from client
    username = req.body.username;
    console.log("index.js POST /upload, username:", username);
    title = req.body.title;
    console.log("index.js POST /upload, title:", title);
    description = req.body.description;
    console.log("index.js POST /upload, description:", description);

    if (req.file) {
        db.insertInfoAndImageUrl(url, username, title, description)
            .then((response) => {
                console.log(
                    "index.js, insertInfoAndImageUrl RETURNING INSERT data from database:",
                    response
                );
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
                console.log("CATCH in POST /upload to database", err);
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
            console.log(
                "index.js, results after getModalInfo ran:",
                modalInfoResults
            );
            modalInfoResults.created_at = truncateDate(
                modalInfoResults.created_at
            );
            modalInfoAndComments.push(modalInfoResults);
            console.log(
                "index.js, modalInfoAndComments-array 1 after truncation of date:",
                modalInfoAndComments
            );
        })
        .then(() => {
            // get comments for selected image
            return db.getComments(req.params.id);
        })
        .then((commentResults) => {
            console.log("index.js, results after getComments:", commentResults);
            for (i = 0; i < commentResults.length; i++) {
                commentResults[i].created_at = truncateDate(
                    commentResults[i].created_at
                );
            }
            console.log(
                "results getComments after truncation of date:",
                commentResults
            );
            modalInfoAndComments.push(commentResults.reverse());
            console.log(
                "index.js, modalInfoAndComments-array 2 after truncation of date:",
                modalInfoAndComments
            );
            res.json(modalInfoAndComments);
        })
        .catch((err) => {
            console.log(
                "CATCH in index.js for getModalInfo & getComments:",
                err
            );
            // close modal when hash is no number:
            res.json("noNumber");
        });
});

////////// GET COMMENTS FOR MODULE //////////
app.post("/comment", (req, res) => {
    console.log("index.js POST /comment, req.params:", req.params);
    console.log("index.js POST /comment, req.body:", req.body);
    username = req.body.username;
    console.log("index.js POST /comment, username:", username);
    comment = req.body.comment;
    console.log("index.js POST /comment, comment:", comment);
    image_id = req.body.image_id;
    console.log("index.js POST /comment, image_id:", image_id);

    db.insertCurrentComment(username, comment, image_id)
        .then((currentComment) => {
            console.log(
                "index.js, insertCurrentComment RETURNING INSERT data from database:",
                currentComment
            );
            userProp = currentComment.rows[0];
            console.log(
                "index.js POST /comment, response from db.insertCurrentComment, userProp:",
                userProp
            );
            userProp.created_at = truncateDate(userProp.created_at);
            res.json({
                userProp,
            });
        })
        .catch((err) => {
            console.log("CATCH in POST /comment to database", err);
        });
});

////////// DELETE IMAGE & COMMENTS //////////

app.post("/delete", (req, res) => {
    console.log("index.js, req.body.id in post /delete:", req.body.id);
    let id = req.body.id;
    db.deleteComments(id)
        .then(db.deleteImage(id))
        .then((results) => {
            console.log(
                "results in index.js for deleteImage and deleteComments:",
                results
            );
            res.json(results);
        })
        .catch((err) => {
            console.log(
                "CATCH in index.js for deleteImage and deleteComments:",
                err
            );
        });
});

app.listen(process.env.PORT || 8080, () =>
    console.log("index.js: IB server is listening.")
);
