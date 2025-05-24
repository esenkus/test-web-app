import { JsonDB, Config } from "node-json-db";
import fs from "fs";

class Database {
  private db: JsonDB;
  private static readonly TEMPLATE_DB_PATH = "./services/database.initial.json";
  private static readonly WORKING_DB_PATH = "./services/database.working.json";

  constructor() {
    this.initializeDatabase();
    this.db = new JsonDB(new Config(Database.WORKING_DB_PATH, true, true, "/"));
  }

  private initializeDatabase() {
    // copy initial database so that initial data does not get corrupted
    if (!fs.existsSync(Database.WORKING_DB_PATH)) {
      fs.copyFileSync(Database.TEMPLATE_DB_PATH, Database.WORKING_DB_PATH);
      console.log("Created working database from template");
    }
  }

  public get database(): JsonDB {
    return this.db;
  }
}

export const database: JsonDB = new Database().database;
