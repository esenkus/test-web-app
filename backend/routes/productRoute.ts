import express from "express";
import { productController } from "../controllers/productController";

class ProductRoute {
  private readonly router: express.Router;

  constructor() {
    this.router = express.Router();

    this.router.get("/", productController.getProducts);
    this.router.get("/:id", productController.getProductById);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

export const productRoute = new ProductRoute().getRouter();
