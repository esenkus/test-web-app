import { database } from "../services/database";
import { Request, Response } from "express";
import { User } from "../entities/user";
import { BasketItem } from "../entities/basket";
import { Purchase, PurchaseItem } from "../entities/purchase";

class PurchaseController {
  public purchase(req: Request, res: Response) {
    const username = req.body.user.username;
    const { productPrices } = req.body; // Receive prices from frontend

    if (!productPrices || typeof productPrices !== "object") {
      return res.status(400).json({ error: "Product prices are required" });
    }

    database.getData("/users").then(
      (users: User[]) => {
        const user = users.find((u) => u.username === username);

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        database.getData("/basketItems").then(
          (basketItems: BasketItem[]) => {
            const userBasketItems = Array.isArray(basketItems)
              ? basketItems.filter((item) => item.userId === user.id)
              : [];

            if (userBasketItems.length === 0) {
              return res.status(400).json({ error: "Basket is empty" });
            }

            // Calculate total amount using prices provided in request body
            let totalAmount = 0;
            for (const item of userBasketItems) {
              const price = productPrices[item.productId] || 0;
              totalAmount += price * item.quantity;
            }

            database.getData("/purchases").then(
              (purchases: Purchase[]) => {
                const purchasesArray = Array.isArray(purchases)
                  ? purchases
                  : [];
                const newId =
                  purchasesArray.length > 0
                    ? Math.max(...purchasesArray.map((p: Purchase) => p.id)) + 1
                    : 1;

                const purchaseItems: PurchaseItem[] = userBasketItems.map(
                  (item) => {
                    const price = productPrices[item.productId] || 0;
                    return {
                      id: item.id,
                      productId: item.productId,
                      quantity: item.quantity,
                      price: price,
                    };
                  },
                );

                const purchase: Purchase = {
                  id: newId,
                  userId: user.id,
                  items: purchaseItems,
                  totalAmount,
                  purchaseDate: new Date().toISOString(),
                };

                purchasesArray.push(purchase);

                database.push("/purchases", purchasesArray).then(
                  () => {
                    const remainingBasketItems = basketItems.filter(
                      (item) => item.userId !== user.id,
                    );

                    database.push("/basketItems", remainingBasketItems).then(
                      () => {
                        res.status(200).json({
                          message: "Purchase successful",
                          purchase,
                        });
                      },
                      (error: string) => {
                        res.status(500).json({
                          error: "Failed to clear basket " + error,
                        });
                      },
                    );
                  },
                  (error: string) => {
                    res
                      .status(500)
                      .json({ error: "Failed to save purchase " + error });
                  },
                );
              },
              (error: string) => {
                // Handle error with purchases array
                const purchaseItems: PurchaseItem[] = userBasketItems.map(
                  (item) => {
                    const price = productPrices[item.productId] || 0;
                    return {
                      id: item.id,
                      productId: item.productId,
                      quantity: item.quantity,
                      price: price,
                    };
                  },
                );

                const purchase: Purchase = {
                  id: 1,
                  userId: user.id,
                  items: purchaseItems,
                  totalAmount,
                  purchaseDate: new Date().toISOString(),
                };

                database.push("/purchases", [purchase]).then(
                  () => {
                    const remainingBasketItems = basketItems.filter(
                      (item) => item.userId !== user.id,
                    );

                    database.push("/basketItems", remainingBasketItems).then(
                      () => {
                        res.status(200).json({
                          message: "Purchase successful",
                          purchase,
                        });
                      },
                      (error: string) => {
                        res.status(500).json({
                          error: "Failed to clear basket " + error,
                        });
                      },
                    );
                  },
                  (error: string) => {
                    res
                      .status(500)
                      .json({ error: "Failed to save purchase " + error });
                  },
                );
              },
            );
          },
          (error: string) => {
            res
              .status(500)
              .json({ error: "Failed to fetch basket items " + error });
          },
        );
      },
      (error: string) => {
        res.status(500).json({ error: "Failed to fetch user data " + error });
      },
    );
  }
}

export const purchaseController = new PurchaseController();
