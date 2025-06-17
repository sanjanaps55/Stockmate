import Shop from "../models/shop.model.js";
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
// Fetch all shops for the logged-in user
export const getShops = async (req, res) => {
  try {
    const shops = await Shop.find({ user: req.user.id });
    res.status(200).json(shops);
  } catch (err) {
    res.status(500).json({ message: "Error fetching shops" });
  }
};

// Create a new shop for the logged-in user
export const createShop = async (req, res) => {
  try {
    const shop = new Shop({
      ...req.body,
      user: req.user.id // ✅ This links shop to the logged-in user
    });
    await shop.save();
    res.status(201).json(shop);

  } catch (err) {
    res.status(500).json({ message: "Error creating shop" });
  }
};


// Delete a shop by ID (only if it belongs to the logged-in user)
export const deleteShop = async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(403).json({ message: "Incorrect password" });

    const shop = await Shop.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!shop) return res.status(404).json({ message: "Shop not found or not owned by user" });

    res.status(200).json({ message: "Shop deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting shop", error: err.message });
  }
};
export const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, user: req.user.id });
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.status(200).json(shop);
  } catch (err) {
    res.status(500).json({ message: "Error fetching shop", error: err.message });
  }
};

