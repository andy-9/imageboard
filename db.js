const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

// GETS EVERYTHING FROM THE DATABASE
module.exports.getImages = () => {
    return db
        .query(`SELECT url, username, title, description FROM images`)
        .then((result) => {
            return result.rows;
        });
};
