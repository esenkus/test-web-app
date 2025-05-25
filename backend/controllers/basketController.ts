import { database } from "../services/database";
import { Request, Response } from "express";
import { User } from "../entities/user";
import { BasketItem } from "../entities/basket";

class BasketController {
  public getBasket(req: Request, res: Response) {
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({ error: "Not authenticated" });
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

            res.status(200).json(userBasketItems);
          },
          (error: string) => {
            res
              .status(500)
              .json({ error: "Failed to fetch user basket " + error });
          }
        );
      },
      (error: string) => {
        res.status(500).json({ error: "Failed to fetch user data " + error });
      }
    );
  }

  public addToBasket(req: Request, res: Response) {
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { productId, quantity } = req.body;

    if (!productId || isNaN(parseInt(productId))) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      return res
        .status(400)
        .json({ error: "Quantity must be a positive number" });
    }

    const productIdNum = parseInt(productId);
    const quantityNum = parseInt(quantity);

    // Check if productId exists in separate API call (don't join)
    database.getData("/products").then(
      (products) => {
        const productExists = Array.isArray(products)
          ? products.some((p) => p.id === productIdNum)
          : false;

        if (!productExists) {
          return res.status(404).json({ error: "Product not found" });
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
                  ? basketItems
                  : [];

                const existingItem = userBasketItems.find(
                  (item) =>
                    item.userId === user.id && item.productId === productIdNum
                );

                if (existingItem) {
                  existingItem.quantity += quantityNum;

                  database.push("/basketItems", userBasketItems).then(
                    () => {
                      res.status(200).json({
                        message: "Item quantity updated in basket",
                        item: existingItem,
                      });
                    },
                    (error: string) => {
                      res
                        .status(500)
                        .json({ error: "Failed to update basket " + error });
                    }
                  );
                } else {
                  const newId =
                    userBasketItems.length > 0
                      ? Math.max(...userBasketItems.map((item) => item.id)) + 1
                      : 1;

                  const newBasketItem: BasketItem = {
                    id: newId,
                    userId: user.id,
                    productId: productIdNum,
                    quantity: quantityNum,
                  };

                  userBasketItems.push(newBasketItem);

                  database.push("/basketItems", userBasketItems).then(
                    () => {
                      res.status(200).json({
                        message: "Item added to basket",
                        item: newBasketItem,
                      });
                    },
                    (error: string) => {
                      res
                        .status(500)
                        .json({ error: "Failed to update basket " + error });
                    }
                  );
                }
              },
              (error: string) => {
                res
                  .status(500)
                  .json({ error: "Failed to fetch basket items " + error });
              }
            );
          },
          (error: string) => {
            res
              .status(500)
              .json({ error: "Failed to fetch user data " + error });
          }
        );
      },
      (error: string) => {
        res
          .status(500)
          .json({ error: "Failed to check product existence " + error });
      }
    );
  }

  public removeFromBasket(req: Request, res: Response) {
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
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
              ? basketItems
              : [];

            const itemIndex = userBasketItems.findIndex(
              (item) => item.userId === user.id && item.productId === productId
            );

            if (itemIndex === -1) {
              return res.status(404).json({ error: "Item not in basket" });
            }

            userBasketItems.splice(itemIndex, 1);

            database.push("/basketItems", userBasketItems).then(
              () => {
                res.status(200).json({ message: "Item removed from basket" });
              },
              (error: string) => {
                res
                  .status(500)
                  .json({ error: "Failed to update basket " + error });
              }
            );
          },
          (error: string) => {
            res
              .status(500)
              .json({ error: "Failed to fetch basket items " + error });
          }
        );
      },
      (error: string) => {
        res.status(500).json({ error: "Failed to fetch user data " + error });
      }
    );
  }

  public updateBasketItem(req: Request, res: Response) {
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const productId = parseInt(req.params.id);
    const { quantity } = req.body;

    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      return res
        .status(400)
        .json({ error: "Quantity must be a positive number" });
    }

    const quantityNum = parseInt(quantity);

    database.getData("/users").then(
      (users: User[]) => {
        const user = users.find((u) => u.username === username);

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        database.getData("/basketItems").then(
          (basketItems: BasketItem[]) => {
            const userBasketItems = Array.isArray(basketItems)
              ? basketItems
              : [];

            const itemIndex = userBasketItems.findIndex(
              (item) => item.userId === user.id && item.productId === productId
            );

            if (itemIndex === -1) {
              return res.status(404).json({ error: "Item not in basket" });
            }

            userBasketItems[itemIndex].quantity = quantityNum;

            database.push("/basketItems", userBasketItems).then(
              () => {
                res.status(200).json({
                  message: "Basket item updated",
                  item: userBasketItems[itemIndex],
                });
              },
              (error: string) => {
                res
                  .status(500)
                  .json({ error: "Failed to update basket " + error });
              }
            );
          },
          (error: string) => {
            res
              .status(500)
              .json({ error: "Failed to fetch basket items " + error });
          }
        );
      },
      (error: string) => {
        res.status(500).json({ error: "Failed to fetch user data " + error });
      }
    );
  }
}

export const basketController = new BasketController();
