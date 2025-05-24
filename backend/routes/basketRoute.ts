import express from "express";
import { basketController } from "../controllers/basketController";
import { authenticate } from "../middleware/authMiddleware";

class BasketRoute {
  private readonly router: express.Router;

  constructor() {
    this.router = express.Router();

    this.router.get("/", authenticate, basketController.getBasket);
    this.router.post("/", authenticate, basketController.addToBasket);
    this.router.put("/:id", authenticate, basketController.updateBasketItem);
    this.router.delete("/:id", authenticate, basketController.removeFromBasket);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export const basketRoute = new BasketRoute().getRouter();
