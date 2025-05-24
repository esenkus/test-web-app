import express from "express";
import { userController } from "../controllers/userController";

class UserRoute {
  private readonly router: express.Router;

  constructor() {
    this.router = express.Router();

    this.router.get("/", userController.getUsers);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export const userRoute = new UserRoute().getRouter();
