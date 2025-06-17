import express from "express";
import mongoose from "mongoose";
import Delivery from "../models/Delivery.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/deliveries/:shopId — Add new delivery
router.post("/:shopId", authMiddleware, async (req, res) => {
  const { shopId } = req.params;
  const { supplier, items, date, time, status } = req.body;

  try {
    const newDelivery = new Delivery({
      shop: new mongoose.Types.ObjectId(shopId),
      supplier,
      items,
      date,
      time,
      status
    });

    const saved = await newDelivery.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving delivery:", err);
    res.status(500).json({ error: "Failed to save delivery" });
  }
});
// GET /api/deliveries/:shopId — Get all deliveries for a shop
router.get("/:shopId", authMiddleware, async (req, res) => {
  const { shopId } = req.params;

  try {
    const deliveries = await Delivery.find({ shop: new mongoose.Types.ObjectId(shopId) });
    res.status(200).json(deliveries);
  } catch (err) {
    console.error("Error fetching deliveries:", err);
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
});



export default router;
