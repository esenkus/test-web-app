import express, {Request, Response} from "express";
import database from "../services/database";
import {User} from "../entities/user";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    database.getData("/users").then((users: User[]) => {
        res.status(200).json(users);
    }, (error) => {
        res.status(500).json({error: "Failed to fetch users " + error});
    });
});

export default router;