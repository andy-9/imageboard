const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

// GETS EVERYTHING FROM THE DATABASE
module.exports.getInfoAndImage = () => {
    return db
        .query(`SELECT url, username, title, description FROM images`)
        .then((result) => {
            return result.rows;
        });
};

// INSERT DATA FROM USER INTO DATABASE
module.exports.insertInfoAndImageUrl = (url, username, title, description) => {
    return db.query(
        `INSERT INTO images (url, username, title, description)
            VALUES ($1, $2, $3, $4)
            RETURNING url, username, title, description;`,
        [url, username, title, description]
    );
};
// RETURNING *;`,
