import express, {Request, Response, NextFunction} from "express";
import path from "path";
import userRoutes from "./routes/userRoutes";

const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, "../../frontend")));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// global request logger, remove in production
app.use((req: Request, res: Response, next: NextFunction) => {
    const log = `${new Date().toISOString()} - ${req.method} ${req.url}`;
    console.log(log);
    next();
});

app.use("/users", userRoutes);

app.listen(PORT, () => {
    console.log("Up and running!");
});