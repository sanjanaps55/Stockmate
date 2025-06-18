import express from "express";
import mongoose from "mongoose";  // <-- 🔥 Make sure this is imported
import Bill from "../models/Bill.js";
import InventoryItem from "../models/InventoryItem.js";

const router = express.Router();

const getMonthName = (date) => new Date(date).toLocaleString("default", { month: "short" });

router.get("/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;

    // 🔥 Convert shopId string to Mongo ObjectId
    const objectId = new mongoose.Types.ObjectId(shopId);

    // ✅ Fetch bills and inventory using ObjectId
    const bills = await Bill.find({ shop: objectId });
    const inventory = await InventoryItem.find({ shop: objectId });

    let totalSold = 0;
    let totalRevenue = 0;
    const productCount = {};
    const categoryCount = {};
    const monthlyRevenue = {};

    for (const bill of bills) {
      totalRevenue += bill.total;
      for (const item of bill.items) {
        totalSold += item.quantity;
        productCount[item.name] = (productCount[item.name] || 0) + item.quantity;

        const billMonth = getMonthName(bill.createdAt);
        monthlyRevenue[billMonth] = (monthlyRevenue[billMonth] || 0) + item.subtotal;
      }
    }

    const topProducts = Object.entries(productCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    for (const item of inventory) {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + item.qty;
    }
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    const salesData = Object.entries(monthlyRevenue).map(([month, sales]) => ({ month, sales }));

    const lowStockItems = inventory
      .filter((item) => item.qty < 10)
      .map((item) => ({ name: item.name, stock: item.qty, reorderLevel: 10 }));

    const observations = [
      "Sales peaked in April.",
      "Dairy products show consistent performance.",
      "Demand for grains is increasing month-over-month."
    ];

    const recommendations = [
      "Restock top-selling products like Atta & Rice.",
      "Run combo offers on snacks & beverages.",
      "Increase inventory buffer before festivals."
    ];

    res.json({
      title: "SmartMart Monthly Report",
      totalSold,
      totalRevenue,
      revenueGrowth: 12,
      topProducts,
      topCategories,
      salesData,
      observations,
      recommendations,
      categoryData: topCategories.slice(0, 5).map((name) => ({ name, value: Math.floor(Math.random() * 30) + 10 })),
      lowStockItems
    });
  } catch (err) {
    console.error("❌ Failed to generate analytics report:", err);
    res.status(500).json({ error: "Failed to generate analytics" });
  }
});

export default router;
