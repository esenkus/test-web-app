import { database } from "../services/database";
import { Request, Response } from "express";
import { Review } from "../entities/review";

class ReviewController {
  public getReviews(req: Request, res: Response) {
    const productId = parseInt(req.params.productId);

    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    database.getData("/reviews").then(
      (reviews: Review[]) => {
        const productReviews = Array.isArray(reviews)
          ? reviews.filter((review) => review.productId === productId)
          : [];

        res.status(200).json(productReviews);
      },
      (error: string) => {
        res.status(500).json({ error: "Failed to fetch reviews " + error });
      },
    );
  }

  public addReview(req: Request, res: Response) {
    const username = req.body.user.username;
    const productId = parseInt(req.params.productId);
    const { rating, comment } = req.body;

    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    if (
      !rating ||
      isNaN(parseInt(rating)) ||
      parseInt(rating) < 1 ||
      parseInt(rating) > 5
    ) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ error: "Comment is required" });
    }

    database.getData("/reviews").then(
      (reviews: Review[]) => {
        const reviewsArray = Array.isArray(reviews) ? reviews : [];

        const newId =
          reviewsArray.length > 0
            ? Math.max(...reviewsArray.map((r) => r.id)) + 1
            : 1;

        const newReview: Review = {
          id: newId,
          productId,
          username,
          rating: parseInt(rating),
          comment,
          date: new Date().toISOString(),
        };

        reviewsArray.push(newReview);

        database.push("/reviews", reviewsArray).then(
          () => {
            res.status(201).json({
              message: "Review added successfully",
              review: newReview,
            });
          },
          (error: string) => {
            res.status(500).json({ error: "Failed to save review " + error });
          },
        );
      },
      (error: string) => {
        database
          .push("/reviews", [
            {
              id: 1,
              productId,
              username,
              rating: parseInt(rating),
              comment,
              date: new Date().toISOString(),
            },
          ])
          .then(
            () => {
              res.status(201).json({
                message: "Review added successfully",
                review: {
                  id: 1,
                  productId,
                  username,
                  rating: parseInt(rating),
                  comment,
                  date: new Date().toISOString(),
                },
              });
            },
            (error: string) => {
              res.status(500).json({ error: "Failed to save review " + error });
            },
          );
      },
    );
  }
}

export const reviewController = new ReviewController();
