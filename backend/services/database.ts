import {JsonDB, Config} from "node-json-db";

const database = new JsonDB(new Config("./services/database.json", true, true));

export default database;