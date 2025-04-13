import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const createAccessToken = (userId: string) => {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: "15m" });
};

export const createRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: "7d" });
};