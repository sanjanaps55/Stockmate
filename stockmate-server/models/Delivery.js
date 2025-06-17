import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  supplier: String,
  items: String,
  date: String,
  time: String,
  status: { type: String, enum: ["Pending", "Confirmed"], default: "Pending" }
});


const Delivery = mongoose.model("Delivery", deliverySchema);
export default Delivery;
