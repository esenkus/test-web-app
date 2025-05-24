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
      }
    );
  }

  public getProductById(req: Request, res: Response) {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    database.getData("/products").then(
      (products: Product[]) => {
        const product = products.find((p) => p.id === productId);

        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(product);
      },
      (error: string) => {
        res.status(500).json({ error: "Failed to fetch product " + error });
      }
    );
  }
}

export const productController: ProductController = new ProductController();
