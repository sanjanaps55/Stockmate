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

dotenv.config();

const app = express();



const allowedOrigins = [
  'http://localhost:5173',
  'https://stockmate-topaz.vercel.app',
  'https://*.vercel.app'   // allow any Vercel subdomain (wildcard)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin: ' + origin));
    }
  },
  credentials: true
}));


app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api", billingRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/deliveries", deliveryRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => {
      console.log("🚀 Server running on port 5000\n✅ MongoDB Connected");
    });
  })
  .catch(err => {
    console.error("❌ Mongo Error:", err);
  });
