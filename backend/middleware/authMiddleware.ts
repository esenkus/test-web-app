import { Request, Response, NextFunction } from "express";
import { jwtService } from "../services/jwt";

// Extend Express Request to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
        permissions: string[];
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1]; // Assuming Bearer token

  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  if (!jwtService.validJwt(token)) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const payload = jwtService.decodeJwt(token);

  // Set user on request object (not in body)
  req.user = {
    username: payload.sub as string,
    permissions: payload.permissions as string[],
  };

  next();
};
