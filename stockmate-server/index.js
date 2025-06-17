import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import inventoryRoutes from './routes/inventory.js';
import billingRoutes from './routes/billing.js';
import aiRoutes from "./routes/ai.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import summaryRoutes from "./routes/summary.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import cors from "cors";

// ✅ Load environment variables
dotenv.config();


// ✅ Initialize Express app
const app = express();

// ✅ Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api", billingRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/deliveries", deliveryRoutes);


// ✅ Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => {
      console.log("🚀 Server running on port 5000\n✅ MongoDB Connected");
    });
  })
  .catch(err => {
    console.error("❌ Mongo Error:", err);
  });
