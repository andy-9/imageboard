const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

// GETS EVERYTHING FROM TABLE "IMAGES"
module.exports.getInfoAndImage = () => {
    return db.query(`SELECT * FROM images`).then((result) => {
        return result.rows;
    });
};

// INSERT DATA FROM USER INTO TABLE "IMAGES"
module.exports.insertInfoAndImageUrl = (url, username, title, description) => {
    return db.query(
        `INSERT INTO images (url, username, title, description)
            VALUES ($1, $2, $3, $4)
            RETURNING url, username, title, description;`,
        [url, username, title, description]
    );
};
// RETURNING *;`,

// GETS EVERYTHING FROM TABLE "IMAGES" FOR MODAL-ID
module.exports.getModalInfo = (id) => {
    return db
        .query(
            `SELECT * FROM images
            WHERE id=$1`,
            [id]
        )
        .then((result) => {
            return result.rows[0];
        });
};

// GET COMMENTS FROM TABLE "COMMENTS" FOR MODAL-ID
module.exports.getComments = (image_id) => {
    return db
        .query(
            `SELECT * FROM comments
            WHERE image_id=$1`,
            [image_id]
        )
        .then((result) => {
            // console.log("result in db.js in getComments:", result.rows);
            return result.rows;
        });
};
