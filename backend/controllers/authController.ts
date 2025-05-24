import { database } from "../services/database";
import { User } from "../entities/user";
import { jwtService } from "../services/jwt";
import { Request, Response } from "express";

class AuthController {
  public login(req: Request, res: Response) {
    const { username, password } = req.body;
    database.getData("/users").then(
      (users: User[]) => {
        const user = users.find(
          (user: User) =>
            user.username === username && user.password === password,
        );
        if (!user) {
          res.status(401).json("Bad username or password");
          return;
        }
        const jwt = jwtService.generateJwt(user.username, []);
        res.status(200).json(jwt);
      },
      (error) => {
        res.status(500).json({ error: "Failed to fetch users " + error });
      },
    );
  }

  public register(req: Request, res: Response) {
    const { username, password } = req.body;
    database.getData("/users").then(
      (users: User[]) => {
        const userExists = users.find(
          (user: User) => user.username === username,
        );
        if (userExists) {
          res.status(409).json("User already exists");
          return;
        }
        const newUser: User = { username: username, password: password };
        database.push("/users[]", newUser).then(
          (_) => {
            res.status(201).json("User created");
          },
          (error) => {
            res.status(500).json({ error: "Failed to create user " + error });
          },
        );
      },
      (error) => {
        res.status(500).json({ error: "Failed to fetch users " + error });
      },
    );
  }
}

export const authController: AuthController = new AuthController();
