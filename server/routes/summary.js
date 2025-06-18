// 📁 server/routes/summary.js
import express from "express";
import mongoose from "mongoose";
import Bill from "../models/Bill.js";
import InventoryItem from "../models/InventoryItem.js";
import Shop from "../models/shop.model.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:shopId", authMiddleware, async (req, res) => {
  const { shopId } = req.params;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const shop = await Shop.findById(shopId).select("manager");

    // --- Monthly Summary ---
    const monthlyDataRaw = await Bill.aggregate([
      { $match: { shop: new mongoose.Types.ObjectId(shopId) } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          value: { $sum: "$total" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthlyData = (monthlyDataRaw || []).map((d) => ({
      name: new Date(d._id.year, d._id.month - 1).toLocaleString("default", { month: "short", year: "numeric" }),
      value: d.value
    }));

    // --- Transactions Today ---
    const transactionsToday = await Bill.countDocuments({
      shop: new mongoose.Types.ObjectId(shopId),
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // --- Items Sold Today ---
    const itemsSoldAgg = await Bill.aggregate([
      {
        $match: {
          shop: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalItems: { $sum: "$items.quantity" }
        }
      }
    ]);
    const itemsSoldToday = (itemsSoldAgg[0]?.totalItems) || 0;

    // --- Weekly Summary ---
    const weeklyDataRaw = await Bill.aggregate([
      {
        $match: {
          shop: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: weekStart }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          value: { $sum: "$total" }
        }
      }
    ]);

    const weekdayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = Array(7).fill(0);
    (weeklyDataRaw || []).forEach(day => {
      weeklyData[day._id - 1] = day.value;
    });
    const weeklyFormatted = weeklyData.map((val, i) => ({ name: weekdayMap[i], value: val }));

    // --- Daily Summary ---
    const dailyDataRaw = await Bill.aggregate([
      {
        $match: {
          shop: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          value: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailyData = Array(24).fill(0);
    (dailyDataRaw || []).forEach(hour => {
      dailyData[hour._id] = hour.value;
    });
    const dailyFormatted = dailyData.map((val, i) => ({ name: `${i}:00`, value: val }));

    // --- Low Stock Items ---
    const lowStockItems = await InventoryItem.find({
      shop: shopId,
      $expr: { $lt: ["$qty", "$threshold"] }
    }).select("name qty threshold");

    // --- Category Performance ---
    const categoryAgg = await Bill.aggregate([
      {
        $match: {
          shop: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: weekStart }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.category",
          totalQty: { $sum: "$items.quantity" },
          totalSales: { $sum: "$items.subtotal" }
        }
      },
      { $sort: { totalQty: -1 } },
      { $limit: 3 }
    ]);

    const totalQtySum = categoryAgg.reduce((acc, cur) => acc + cur.totalQty, 0);
    const categoryData = categoryAgg.map((cat) => ({
      name: cat._id || "Uncategorized",
      value: (cat.totalSales / 1000).toFixed(1),
      percentage: totalQtySum ? `${Math.round((cat.totalQty / totalQtySum) * 100)}%` : "0%"
    }));

    // --- Avg Basket Value ---
    const todayTotal = dailyFormatted.reduce((sum, d) => sum + d.value, 0);
    const avgBasketValue = transactionsToday > 0 ? (todayTotal / transactionsToday).toFixed(2) : "0.00";

    // --- Final Response ---
    res.json({
      monthlyData,
      weeklyData: weeklyFormatted,
      dailyData: dailyFormatted,
      lowStockItems,
      categoryData,
      transactionsToday,
      itemsSoldToday,
      avgBasketValue,
      managerName: shop?.manager || "Manager"
    });
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ error: "Failed to fetch summary data" });
  }
});

export default router;
