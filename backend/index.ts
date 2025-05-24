import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { userRoute } from "./routes/userRoute";
import { authRoute } from "./routes/authRoute";
import cors, { CorsOptions } from "cors";
import { productRoute } from "./routes/productRoute";

const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, "../../frontend")));

const corsOptions: CorsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// global request logger, remove in production
app.use((req: Request, res: Response, next: NextFunction) => {
  const log = `${new Date().toISOString()} - ${req.method} ${req.url}`;
  console.log(log);
  next();
});

app.use("/users", userRoute);
app.use("/auth", authRoute);
app.use("/products", productRoute);

app.listen(PORT, () => {
  console.log("Up and running!");
});
