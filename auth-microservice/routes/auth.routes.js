import { Router } from "express";
import passport from "passport";
import {
  getProfile,
  logout,
  googleAuthCallback,
  updateProfile,
  manualRegister,
  manualLogin,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";


const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleAuthCallback,
);

router.post("/register", manualRegister);
router.post("/login", manualLogin);
router.post("/update", authenticateToken,  updateProfile);
router.get("/profile", authenticateToken, getProfile);
router.post("/logout", authenticateToken, logout);

export default router;
