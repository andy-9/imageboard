const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

// GETS EVERYTHING FROM TABLE "IMAGES"
module.exports.getInfoAndImage = () => {
    return db
        .query(
            `SELECT *
            FROM images
            ORDER BY id DESC
            LIMIT 9;`
        )
        .then((result) => {
            return result.rows;
        });
};

// LOAD MORE IMAGES WHEN BUTTON IS CLICKED
exports.getMoreImages = (lastId) => {
    return db
        .query(
            `SELECT *, (
                SELECT id FROM images
                ORDER BY id ASC
                LIMIT 1)
            AS lowest_id FROM images
            WHERE id < $1
            ORDER BY id DESC
            LIMIT 9;`,
            [lastId]
        )
        .then((moreImages) => {
            // console.log(
            //     "db.js, moreImages.rows in getMoreImages:",
            //     moreImages.rows
            // );
            return moreImages.rows;
        });
};

// INSERT DATA FROM USER INTO TABLE "IMAGES"
module.exports.insertInfoAndImageUrl = (url, username, title, description) => {
    return db.query(
        `INSERT INTO images (url, username, title, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *;`,
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

// INSERT CURRENT COMMENT IN TABLE "COMMENTS"
module.exports.insertCurrentComment = (username, comment, image_id) => {
    return db.query(
        `INSERT INTO comments (username, comment, image_id)
        VALUES ($1, $2, $3)
        RETURNING *;`,
        [username, comment, image_id]
    );
};

// DELETE IMAGE & COMMENTS
module.exports.deleteImage = (id) => {
    return db.query(
        `DELETE FROM images
        WHERE images.id =
        (SELECT image_id
        FROM comments);`
    );
};
