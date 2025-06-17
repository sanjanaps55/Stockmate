import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { Search, Plus, Calendar, Package, DollarSign, X, Calculator, Tag } from 'lucide-react';

export default function EnhancedInventoryPage() {
  const { shopId } = useParams();
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    qty: "",
    price: "",
    total: "",
    category: "",
    expiry: ""
  });

  // Category options with custom expiry warning periods (in days)
  const categoryOptions = [
    { name: "Food & Beverages", warningDays: 7 },
    { name: "Fruits & Vegetables", warningDays: 3 },
    { name: "Dairy & Eggs", warningDays: 5 },
    { name: "Meat & Seafood", warningDays: 2 },
    { name: "Bakery & Bread", warningDays: 3 },
    { name: "Snacks & Confectionery", warningDays: 30 },
    { name: "Frozen Foods", warningDays: 60 },
    { name: "Canned & Packaged Foods", warningDays: 90 },
    { name: "Spices & Seasonings", warningDays: 180 },
    { name: "Cooking Oil & Vinegar", warningDays: 60 },
    { name: "Personal Care", warningDays: 180 },
    { name: "Health & Medicine", warningDays: 30 },
    { name: "Household Cleaning", warningDays: 365 },
    { name: "Stationery & Office", warningDays: 730 },
    { name: "Electronics & Accessories", warningDays: 365 },
    { name: "Clothing & Textiles", warningDays: 730 },
    { name: "Home & Kitchen", warningDays: 365 },
    { name: "Sports & Recreation", warningDays: 365 },
    { name: "Automotive", warningDays: 180 },
    { name: "Hardware & Tools", warningDays: 730 },
    { name: "Baby & Kids Products", warningDays: 90 },
    { name: "Pet Supplies", warningDays: 90 },
    { name: "Garden & Plants", warningDays: 180 },
    { name: "Books & Media", warningDays: 730 },
    { name: "Miscellaneous", warningDays: 30 }
  ];

  useEffect(() => {
    async function fetchInventory() {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:5000/api/inventory/${shopId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        setItems(data);
        console.log("shopId in InventoryPage:", shopId);
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
      }
    }

    if (shopId) fetchInventory();
  }, [shopId]);

  // Calculate total when qty or price changes
  useEffect(() => {
    const qty = parseFloat(formData.qty) || 0;
    const price = parseFloat(formData.price) || 0;
    const calculatedTotal = qty * price;
    
    if (calculatedTotal !== parseFloat(formData.total)) {
      setFormData(prev => ({ ...prev, total: calculatedTotal.toString() }));
    }
  }, [formData.qty, formData.price]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.qty || !formData.price || !formData.category || !formData.expiry) return;

    const token = localStorage.getItem("token");
    
    if (editingItem) {
      handleUpdateItem(editingItem._id);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/inventory/${shopId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          qty: parseInt(formData.qty),
          price: parseFloat(formData.price),
          total: parseFloat(formData.total),
          category: formData.category,
          expiry: formData.expiry
        })
      });

      const newItem = await res.json();
      setItems(prev => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData({ name: "", qty: "", price: "", total: "", category: "", expiry: "" });
      setShowForm(false);
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/inventory/item/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(prev => prev.filter(item => item._id !== itemId));
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const handleUpdateItem = async (itemId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/inventory/item/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          qty: parseInt(formData.qty),
          price: parseFloat(formData.price),
          total: parseFloat(formData.total),
          category: formData.category,
          expiry: formData.expiry
        })
      });

      const updatedItem = await res.json();
      setItems(prev =>
        prev.map(item => (item._id === itemId ? updatedItem : item)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setFormData({ name: "", qty: "", price: "", total: "", category: "", expiry: "" });
      setShowForm(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  const handleEditClick = (item) => {
    // Format the date for the input field (YYYY-MM-DD format)
    const formattedExpiry = new Date(item.expiry).toISOString().split('T')[0];
    
    setFormData({
      name: item.name,
      qty: item.qty.toString(),
      price: item.price.toString(),
      total: item.total ? item.total.toString() : (item.qty * item.price).toString(),
      category: item.category || "",
      expiry: formattedExpiry
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ name: "", qty: "", price: "", total: "", category: "", expiry: "" });
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Function to format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Function to determine if an item is expiring soon based on category
  const getExpiryStatus = (dateString, category) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const differenceInTime = expiryDate - today;
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    // Find the category configuration
    const categoryConfig = categoryOptions.find(cat => cat.name === category);
    const warningDays = categoryConfig ? categoryConfig.warningDays : 14; // Default to 14 days
    
    if (differenceInDays < 0) {
      return { status: 'expired', message: 'Expired!', color: 'red' };
    } else if (differenceInDays <= warningDays) {
      return { 
        status: 'expiring', 
        message: `Expires in ${differenceInDays} day${differenceInDays === 1 ? '' : 's'}!`, 
        color: 'yellow' 
      };
    } else {
      return { status: 'good', message: '', color: 'green' };
    }
  };

  return (
    <div className="min-h-screen bg-green-50 text-green-900">
      {/* Header */}
      <div className="bg-green-800 p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-green-500" size={18} />
          </div>
          
          {/* Add Item Button */}
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Count Summary */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <p className="text-green-800">
            Showing {filteredItems.length} of {items.length} items
            {search && ` matching "${search}"`}
          </p>
        </div>

        {/* Grid Layout */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
            {filteredItems.map((item, idx) => {
              const expiryInfo = getExpiryStatus(item.expiry, item.category);
              const displayTotal = item.total || (item.qty * item.price);
              
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className={`p-1 ${
                    expiryInfo.color === 'red' ? 'bg-red-500' : 
                    expiryInfo.color === 'yellow' ? 'bg-yellow-400' : 
                    'bg-green-500'
                  }`}></div>
                  <div className="p-3">
                    <h3 className="text-base font-bold text-green-800 truncate" title={item.name}>
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center text-sm text-green-700 mt-2">
                      <Package size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">Qty: <strong>{item.qty}</strong></span>
                    </div>
                    
                    <div className="flex items-center text-sm text-green-700 mt-1">
                      <DollarSign size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">₹<strong>{item.price}</strong>/item</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-green-700 mt-1">
                      <Calculator size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">Total: ₹<strong>{displayTotal}</strong></span>
                    </div>
                    
                    {item.category && (
                      <div className="flex items-center text-sm text-green-700 mt-1">
                        <Tag size={14} className="mr-1 flex-shrink-0" />
                        <span className="text-xs font-medium truncate" title={item.category}>
                          {item.category}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex items-center text-sm mt-1 ${
                      expiryInfo.color === 'red' ? 'text-red-600' : 
                      expiryInfo.color === 'yellow' ? 'text-yellow-600' : 
                      'text-green-700'
                    }`}>
                      <Calendar size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">{formatDate(item.expiry)}</span>
                    </div>
                    
                    {expiryInfo.message && (
                      <p className={`mt-1 text-xs font-medium ${
                        expiryInfo.color === 'red' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {expiryInfo.message}
                      </p>
                    )}

                    {/* Edit and Delete buttons */}
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        onClick={() => handleEditClick(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium"
                        onClick={() => handleDeleteItem(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-green-800">No items found matching your search.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingItem ? "Update Item" : "Add New Item"}</h2>
              <button 
                onClick={handleCloseForm}
                className="text-white hover:text-green-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Item Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter item name"
                  className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Quantity</label>
                <input
                  type="number"
                  name="qty"
                  placeholder="Enter quantity"
                  className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.qty}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Price per item (₹)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="Enter price per item"
                  className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Category</label>
                <select
                  name="category"
                  className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((category, index) => (
                    <option key={index} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formData.category && (
                  <p className="text-xs text-gray-600 mt-1">
                    Warning period: {categoryOptions.find(cat => cat.name === formData.category)?.warningDays || 14} days before expiry
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Total (₹)</label>
                <input
                  type="number"
                  name="total"
                  placeholder="Total amount"
                  className="w-full px-4 py-2 rounded border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.total}
                  readOnly
                />
                <p className="text-xs text-gray-600 mt-1">Auto-calculated: Quantity × Price per item</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Expiry Date</label>
                <input
                  type="date"
                  name="expiry"
                  className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.expiry}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleAddItem}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}