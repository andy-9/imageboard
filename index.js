const express = require("express");
const app = express();
const db = require("./db.js");
const s3 = require("./s3");
const config = require("./config");
const rateLimit = require('express-rate-limit')

app.use(express.static("public"));
app.use(express.json());

////////////////// DATE FORMATTING //////////////////
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

////////// GET DATA FOR SITE //////////
app.get("/images", (req, res) => {
    db.getInfoAndImage()
        .then((results) => {
            res.json(results);
        })
        .catch((err) => {
            console.log("CATCH in index.js for getInfoAndImage:", err);
        });
});

////////// GET MORE DATA FOR SITE //////////
app.post("/load-more", (req, res) => {
    db.getMoreImages(req.body.lastId)
        .then((moreImages) => {
            res.json(moreImages);
        })
        .catch((err) => {
            console.log("CATCH in index.js /load-more:", err);
        });
});

////////// POST DATA FROM SITE - UPLOAD TO AWS & PUT IN DATABASE //////////
// "single" is a method of uploader

// limit upload to 5 images/h
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 create account requests per `window` (here, per hour)
    message:
        'Too many accounts created from this IP, please try again after an hour',
    standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (request, response) => "snowflake",
})

app.post("/upload", uploadLimiter, uploader.single("file"), s3.upload, (req, res) => {
    filename = req.file.filename;
    let url = config.s3Url + filename;
    username = req.body.username;
    title = req.body.title;
    description = req.body.description;

    if (req.file) {
        db.insertInfoAndImageUrl(url, username, title, description)
            .then((response) => {
                userInsert = response.rows[0];
                res.json({
                    userInsert,
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

    db.getModalInfo(req.params.id)
        .then((modalInfoResults) => {
            modalInfoResults.created_at = truncateDate(
                modalInfoResults.created_at
            );
            modalInfoAndComments.push(modalInfoResults);
        })
        .then(() => {
            return db.getComments(req.params.id);
        })
        .then((commentResults) => {
            for (let i = 0; i < commentResults.length; i++) {
                commentResults[i].created_at = truncateDate(
                    commentResults[i].created_at
                );
            }
            modalInfoAndComments.push(commentResults.reverse());

            res.json(modalInfoAndComments);
        })
        .catch((err) => {
            console.log(
                "CATCH in index.js for getModalInfo & getComments:",
                err
            );
            res.json("noNumber");
        });
});

////////// GET COMMENTS FOR MODULE //////////
app.post("/comment", (req, res) => {
    username = req.body.username;
    comment = req.body.comment;
    image_id = req.body.image_id;

    db.insertCurrentComment(username, comment, image_id)
        .then((currentComment) => {
            userProp = currentComment.rows[0];
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
    let id = req.body.id;
    db.deleteComments(id)
        .then(db.deleteImage(id))
        .then((results) => {
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
