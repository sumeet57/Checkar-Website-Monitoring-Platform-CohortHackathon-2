import express from "express";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead 
} from "../controllers/notification.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const Notirouter = express.Router();


Notirouter.get("/", authenticateToken,getNotifications);
Notirouter.patch("/read-all",authenticateToken ,markAllAsRead);
Notirouter.post("/:Id/read", authenticateToken,markAsRead);

export default Notirouter;