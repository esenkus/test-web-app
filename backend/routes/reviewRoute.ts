import express from "express";
import { reviewController } from "../controllers/reviewController";
import { authenticate } from "../middleware/authMiddleware";

class ReviewRoute {
  private readonly router: express.Router;

  constructor() {
    this.router = express.Router();

    this.router.get("/:productId", reviewController.getReviews);
    this.router.post("/:productId", authenticate, reviewController.addReview);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export const reviewRoute = new ReviewRoute().getRouter();
