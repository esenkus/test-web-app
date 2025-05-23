const express = require("express");
const app = express();
const path = require("path");
const PORT = 8080;

const userRoutes = require("./routes/userRoutes");

app.use(express.static(path.join(__dirname, "../frontend")));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

// global request logger, remove in production
app.use((req, res, next) => {
    const log = `${new Date().toISOString()} - ${req.method} ${req.url}`;
    console.log(log);
    next();
});

app.use("/users", userRoutes);

app.listen(PORT, () => {
    console.log("Up and running!");
});
