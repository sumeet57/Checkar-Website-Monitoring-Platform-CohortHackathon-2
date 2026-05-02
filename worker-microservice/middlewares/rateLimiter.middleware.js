import { rateLimit } from "express-rate-limit";
import env from "../config/env.js";

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each ip 100 request
  message: "Too many requests from this IP, please try again after 10 minutes",
});
export const rateLimiterMiddleware = (req, res, next) => {
  limiter(req, res, next);
};
