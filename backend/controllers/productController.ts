import { database } from "../services/database";
import { Request, Response } from "express";
import { Product } from "../entities/product";

class ProductController {
  public getProducts(req: Request, res: Response) {
    database.getData("/products").then(
      (products: Product[]) => {
        res.status(200).json(products);
      },
      (error: string) => {
        res.status(500).json({ error: "Failed to fetch products " + error });
      },
    );
  }
}

export const productController: ProductController = new ProductController();
