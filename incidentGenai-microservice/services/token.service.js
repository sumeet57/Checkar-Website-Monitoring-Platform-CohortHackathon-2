import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const cookieOptionsAccess = {
  httpOnly: true,
  secure: env.NODE === "production",
  maxAge: 30 * 60 * 1000,
  sameSite: env.NODE === "production" ? "Strict" : "None",
};

export const cookieOptionsRefresh = {
  httpOnly: true,
  secure: env.NODE === "production",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: env.NODE === "production" ? "Strict" : "None",
};

export const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
  };

  const accessToken = jwt.sign(payload, env.jwtSecret, {
    expiresIn: "30m",
  });

  const refreshToken = jwt.sign(payload, env.jwtSecret, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    return null;
  }
};

export const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, cookieOptionsRefresh);
};

export const setAccessCookie = (res, token) => {
  res.cookie("accessToken", token, cookieOptionsAccess);
};
