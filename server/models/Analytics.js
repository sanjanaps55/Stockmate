import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Shop'
  },
  title: String,
  totalSold: Number,
  totalRevenue: Number,
  previousMonthRevenue: Number,
  revenueGrowth: Number,
  topProducts: [String],
  topCategories: [String],
  observations: [String],
  recommendations: [String],
  salesData: [{ month: String, sales: Number }],
  categoryData: [{ name: String, value: Number }],
  lowStockItems: [{
    name: String,
    stock: Number,
    reorderLevel: Number
  }]
}, { timestamps: true });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
