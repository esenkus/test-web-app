const {JsonDB, Config} = require("node-json-db");

let database = new JsonDB(new Config("./services/database.json", true, true));

module.exports = database;