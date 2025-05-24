import express from "express";
import { purchaseController } from "../controllers/purchaseController";
import { authenticate } from "../middleware/authMiddleware";

class PurchaseRoute {
  private readonly router: express.Router;

  constructor() {
    this.router = express.Router();

    this.router.post("/", authenticate, purchaseController.purchase);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export const purchaseRoute = new PurchaseRoute().getRouter();
