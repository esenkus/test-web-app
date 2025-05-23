const database = require("../services/database");


const getUsers = (req, res) => {
    database.getData("/users").then((users) => {
        res.status(200).json(users);
    });
};

module.exports = {
    getUsers
};