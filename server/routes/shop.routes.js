import express from "express";
import { createShop, getShops, deleteShop } from "../controllers/shopController.js";
import { getShopById } from "../controllers/shopController.js"; 
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getShops);
router.post("/", authMiddleware, createShop);
router.delete("/:id", authMiddleware, deleteShop);
router.get("/:id", authMiddleware, getShopById);


export default router;
