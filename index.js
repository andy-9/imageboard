const express = require("express");
const app = express();
const db = require("./db.js");

app.use(express.static("public"));

app.get("/images", (req, res) => {
    return db
        .getImages()
        .then((results) => {
            res.json(results.reverse());
            console.log(
                "response for getImages in index.js:",
                results.reverse()
            );
        })
        .catch((err) => {
            console.log("catch for getImages in index.js:", err);
        });
});

app.listen(8080, () => console.log("IB server is listening."));
