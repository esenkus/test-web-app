const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const PORT = 8080;

app.use(express.static(path.join(__dirname, "../frontend")));

app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);
app.use(bodyParser.json());

app.listen(PORT, () => {
    console.log("Up and running!");

    // log all requests coming in
    app.use((req, res, next) => {
        const log = `${new Date().toISOString()} - ${req.method} ${req.url}`;
        console.log(log);
        next();
    });

    app.get("/users", (req, res) => {
        res.status(200).json({"message": "Users endpoint hit"});
    });
});
