import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  customerName: String,
  items: [
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    category: String, // ✅ Add this line
    quantity: Number,
    price: Number,
    subtotal: Number
  }
],

  subtotal: Number,
  tax: Number,
  discount: Number,
  total: Number,
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Bill = mongoose.model("Bill", billSchema);
export default Bill;
