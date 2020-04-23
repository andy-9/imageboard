const express = require("express");
const app = express();

app.use(express.static("public"));

let cities = [
    {
        name: "Berlin",
        country: "DE",
    },
    {
        name: "Guayaquil",
        country: "Ecuador",
    },
    {
        name: "Sheffield",
        country: "UK",
    },
    {
        name: "Amman",
        country: "Jordan",
    },
];

// route has to match the route in axios
app.get("/cities", (req, res) => {
    console.log("/cities route has been hit!");
    // no res.render, only res.json, that's how we respond to the frontend
    res.json(cities);
});

app.listen(8080, () => console.log("IB server is listening."));
