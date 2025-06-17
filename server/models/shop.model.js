import mongoose from "mongoose";
import { authMiddleware } from "../middleware/authMiddleware.js";

 

const shopSchema = new mongoose.Schema({
  name: String,
  location: String,
  manager: String,
  contact: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

export default mongoose.model("Shop", shopSchema);
