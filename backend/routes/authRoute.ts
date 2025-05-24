import express from "express";
import { authController } from "../controllers/authController";

class AuthRoute {
  private readonly router: express.Router;

  constructor() {
    this.router = express.Router();

    this.router.post("/login", authController.login);
    this.router.post("/register", authController.register);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export const authRoute = new AuthRoute().getRouter();
