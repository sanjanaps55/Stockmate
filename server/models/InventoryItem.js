import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  name: String,
  qty: Number,
  price: Number,
  total: Number,
  category: String,
  expiry: Date,
  threshold: {
    type: Number,
    default: 10
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  }
});

const InventoryItem = mongoose.model("InventoryItem", inventorySchema);
export default InventoryItem; // ✅ Use ESM export
