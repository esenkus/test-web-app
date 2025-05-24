import { database } from "../services/database";
import { Request, Response } from "express";
import { User } from "../entities/user";

class UserController {
  public getUsers(req: Request, res: Response) {
    database.getData("/users").then(
      (users: User[]) => {
        const safeUsers = users.map(({ password, ...rest }) => rest);
        res.status(200).json(safeUsers);
      },
      (error: string) => {
        res.status(500).json({ error: "Failed to fetch users " + error });
      }
    );
  }
}

export const userController = new UserController();
