import express from "express";
import InventoryItem from "../models/InventoryItem.js";

const router = express.Router();

// ✅ Get inventory for a shop
router.get("/:shopId", async (req, res) => {
  const items = await InventoryItem.find({ shop: req.params.shopId });
  res.json(items);
});

// ✅ Add item to a shop's inventory
router.post("/:shopId", async (req, res) => {
  console.log("📦 Incoming data:", req.body); // ✅ Debug line

  try {
    const item = new InventoryItem({
      name: req.body.name,
      qty: req.body.qty,
      price: req.body.price,
      total: req.body.total,
      category: req.body.category, // ✅ Make sure this is extracted
      expiry: req.body.expiry,
      shop: req.params.shopId
    });

    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error saving item:", err);
    res.status(500).json({ error: "Failed to save inventory item" });
  }
});


// ✅ Delete item
router.delete("/item/:itemId", async (req, res) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.itemId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// ✅ Update item with total
router.put("/item/:itemId", async (req, res) => {
  try {
    const { name, qty, price, expiry } = req.body;
    const total = qty * price;

    const updated = await InventoryItem.findByIdAndUpdate(
      req.params.itemId,
      { name, qty, price, expiry, total }, // ✅ recalculate total
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

export default router;
