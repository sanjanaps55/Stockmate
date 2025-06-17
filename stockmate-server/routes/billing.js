import express from 'express';
import InventoryItem from "../models/InventoryItem.js";
import Bill from '../models/Bill.js';

const router = express.Router();

// GET inventory for shop
router.get('/inventory/:shopId', async (req, res) => {
  try {
    const inventory = await InventoryItem.find({ shop: req.params.shopId });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// POST new bill and update inventory quantities
router.post('/bill/:shopId', async (req, res) => {
  const { customerName, items, subtotal, tax, discount, total } = req.body;
  const shopId = req.params.shopId;

  try {
    const processedItems = [];

    for (const item of items) {
      // Find item from Inventory to get its category
      const itemFromDb = await InventoryItem.findOne({ _id: item._id, shop: shopId });

      if (!itemFromDb) {
        return res.status(400).json({ error: `Item with ID ${item._id} not found in inventory` });
      }

      // Decrease qty in inventory
      await InventoryItem.findOneAndUpdate(
        { _id: item._id, shop: shopId },
        { $inc: { qty: -item.quantity } },
        { new: true }
      );

      processedItems.push({
        _id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        category: itemFromDb.category // ✅ add category from DB
      });
    }

    // Save bill with enriched item details
    const bill = new Bill({
      customerName,
      items: processedItems,
      subtotal,
      tax,
      discount,
      total,
      shop: shopId,
      createdAt: new Date()
    });
    for (const item of items) {
      const itemDetails = await InventoryItem.findById(item._id);
      item.category = itemDetails?.category || "Uncategorized"; // ✅ Add category
    }


    await bill.save();
    res.status(201).json({ message: "Bill processed and saved", bill });

  } catch (err) {
    console.error("Billing error:", err);
    res.status(500).json({ error: "Failed to process bill", details: err.message });
  }
});

export default router;
