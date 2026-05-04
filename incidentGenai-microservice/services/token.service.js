import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const cookieOptionsAccess = {
  httpOnly: true,
  secure: true,
  maxAge: 30 * 60 * 1000,
  sameSite: "none",
  domain: ".sumeet.app",
};

export const cookieOptionsRefresh = {
  httpOnly: true,
  secure: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  domain: ".sumeet.app",
};

export const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "30m",
  });

  const refreshToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
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
