import { useParams } from "react-router-dom";
import { useEffect } from "react";

const ADMIN_PASSWORD = "admin123";
import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState("monthly");
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [newDelivery, setNewDelivery] = useState({
    supplier: "",
    items: "",
    date: "",
    time: "",
    status: "Pending"
  });
  const { shopId } = useParams();
  const [shopData, setShopData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:5000/api/summary/${shopId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        console.log("Shop data fetched:", data);
      } catch (err) {
        console.error("Error fetching shop summary:", err);
      }
    };

    fetchData();
  }, [shopId]);

  useEffect(() => {
  async function fetchSummaryAndDeliveries() {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const summaryRes = await fetch(`http://localhost:5000/api/summary/${shopId}`, { headers });
      const summary = await summaryRes.json();
      setShopData({
      todayTotal: summary?.dailyData?.reduce((sum, item) => sum + item.value, 0),
      transactionsToday: summary?.transactionsToday || 0,
      itemsSoldToday: summary?.itemsSoldToday || 0,
      weeklyTotal: summary?.weeklyData?.reduce((sum, item) => sum + item.value, 0),
      avgBasketValue: summary?.avgBasketValue || "0.00",
      managerName: summary?.managerName || "Manager" // ✅ added this
    });



      setMonthlyData(summary?.monthlyData || []);
      setWeeklyData(summary?.weeklyData || []);
      setDailyData(summary?.dailyData || []);
      setLowStockProducts(summary?.lowStockItems || []);

      // 💡 Update Category Percentages
      const topCategories = summary?.categoryData || [];
      const totalCategoryValue = topCategories.reduce((acc, item) => acc + item.value, 0);
      const formattedCategories = topCategories.map(item => ({
        ...item,
        percentage: totalCategoryValue ? `${Math.round((item.value / totalCategoryValue) * 100)}%` : "0%"
      }));
      setCategoryData(formattedCategories);


      // Deliveries
      const deliveryRes = await fetch(`http://localhost:5000/api/deliveries/${shopId}`, { headers });
      const deliveries = await deliveryRes.json();
      setUpcomingDeliveries(deliveries || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  }

  if (shopId) fetchSummaryAndDeliveries();
}, [shopId]);


 

  const getActiveData = () => {
    switch (activeTab) {
      case "monthly": return monthlyData;
      case "weekly": return weeklyData;
      case "daily": return dailyData;
      default: return [];
    }
  };

  const getChartTitle = () => {
    switch (activeTab) {
      case "monthly": return "Monthly Sales Summary";
      case "weekly": return "Weekly Sales Summary";
      case "daily": return "Daily Sales Summary";
      default: return "Sales Summary";
    }
  };
  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setNewDelivery((prev) => ({ ...prev, [name]: value }));
};

const handleSubmitDelivery = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`http://localhost:5000/api/deliveries/${shopId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...newDelivery, shopId })
    });

    if (!res.ok) throw new Error("Failed to add delivery");

    const added = await res.json();
    setUpcomingDeliveries((prev) => [...prev, added]);
    setShowDeliveryForm(false);
    setNewDelivery({
      supplier: "",
      items: "",
      date: "",
      time: "",
      status: "Pending"
    });
  } catch (err) {
    console.error("Error submitting delivery:", err);
  }
};

const handleDeleteClick = (index) => {
  setDeleteIndex(index);
  setShowDeleteConfirm(true);
};

const handleCancelDelete = () => {
  setDeleteIndex(null);
  setShowDeleteConfirm(false);
};

const handleConfirmDelete = async () => {
  const token = localStorage.getItem("token");
  const deliveryToDelete = upcomingDeliveries[deleteIndex];

  try {
    await fetch(`http://localhost:5000/api/deliveries/${shopId}/${deliveryToDelete._id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const updatedDeliveries = [...upcomingDeliveries];
    updatedDeliveries.splice(deleteIndex, 1);
    setUpcomingDeliveries(updatedDeliveries);
    setShowDeleteConfirm(false);
    setDeleteIndex(null);
  } catch (err) {
    console.error("Error deleting delivery:", err);
  }
};




  return (
    <div className="flex h-screen bg-green-900">
      {/* Left Sidebar */}
      <div className="w-48 bg-green-950 flex flex-col">
        <div className="p-5 border-b border-green-800 flex items-center">
          <span className="text-[#9EF281] font-bold text-lg">STOCKMATE</span>
        </div>
        
        <div className="flex-1 p-5 space-y-3">
          <a href="/dashboard" className="flex items-center space-x-3 text-white hover:text-[#9EF281]">
            <span>Dashboard</span>
          </a>
          
          <a href={`/shop/${shopId}/analysis`} className="flex items-center space-x-3 text-white hover:text-[#9EF281]">
            <span>Analytics</span>
          </a>
          
          <a href={`/shop/${shopId}/inventory`} className="flex items-center space-x-3 text-white hover:text-[#9EF281]">
            <span>Inventory</span>
          </a>
          
          <div 
          onClick={() => setShowDeliveryForm(true)} 
          className="flex items-center space-x-3 text-white hover:text-[#9EF281] cursor-pointer"
        >
          <span>Deliveries</span>
        </div>

  
          <a href={`/shop/${shopId}/billing`} className="flex items-center space-x-3 text-white hover:text-[#9EF281]">
            <span>Billing</span>
          </a>
        </div>
        
        <div className="p-5 text-white text-sm">
          <button className="flex items-center space-x-2">
            <span>LOG OUT</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top Navigation */}
        <div className="bg-white p-4 flex items-center justify-end border-b">
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="font-medium text-gray-800">{shopData?.managerName || "Manager"}</span>
                <span className="text-xs text-gray-500">Store Manager</span>
              </div>
                  <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {shopData?.managerName?.[0]?.toUpperCase() || "M"}
                </div>

            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 p-6 bg-gray-50 overflow-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Daily Sales Overview */}
            <div className="col-span-4 bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Today's Sales Overview</h3>
                  <div className="text-xs text-gray-400 mt-1">Updated 15 minutes ago</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center mt-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-green-100 flex items-center justify-center">
                    <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      ₹{dailyData.reduce((sum, item) => sum + item.value, 0)}
                    </div>
                      <div className="text-xs text-gray-500">Today</div>
                    </div>
                  </div>
                  <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                    +18%
                  </div>
                </div>
              </div>
              
              <div className="flex justify-around mt-6">
                <div className="text-center">
                  <div className="text-gray-400 text-xs">Transactions</div>
                  <div className="text-gray-600 text-sm">
                    {shopData?.transactionsToday ?? "Loading..."}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-gray-400 text-xs">Avg. Basket</div>
                  <div className="text-gray-600 text-sm">
                    Avg Basket: ₹{shopData?.avgBasketValue ?? "Loading..."}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-gray-400 text-xs">Items Sold</div>
                    <div className="text-gray-600 text-sm">
                       {shopData?.itemsSoldToday ?? "Loading..."}
                    </div>
                </div>
              </div>
            </div>
            
            {/* Category Performance */}
            <div className="col-span-4 bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between">
                <h3 className="text-gray-500 text-sm font-medium">Category Performance</h3>
                <div className="bg-gray-100 text-xs px-2 py-1 rounded text-gray-500">Weekly</div>
              </div>
              
              <div className="flex justify-around items-center mt-6">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-green-100 p-1">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                          {item.percentage}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">{item.name}</div>
                    <div className="text-xs text-gray-400">₹{item.value}K</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Upcoming Deliveries */}
            <div className="col-span-4 bg-white rounded-xl shadow-sm p-5 flex flex-col">
              <div className="flex justify-between">
                <h3 className="text-gray-500 text-sm font-medium mb-4">Upcoming Deliveries</h3>
                <div className="bg-gray-100 text-xs px-2 py-1 rounded text-gray-500">This Week</div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3">
                {upcomingDeliveries.map((delivery, index) => (
                  <div key={index} className="border-l-4 border-green-500 bg-green-50 pl-3 py-2 pr-2 rounded-r-lg relative">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-800">{delivery.supplier}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          delivery.status === 'Confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {delivery.status}
                        </span>
                        <button
                          onClick={() => handleDeleteClick(index)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
                          title="Delete delivery"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{delivery.items}</div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs font-medium text-gray-700">{delivery.date}</span>
                      <span className="text-xs text-gray-500">{delivery.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sales Summary with Tabs */}
            <div className="col-span-8 bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-700 text-lg font-medium">{getChartTitle()}</h3>
                <div className="flex items-center gap-2">
                  <button className="text-gray-400">⟲</button>
                  <button className="text-gray-400">⤢</button>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex border-b mb-4">
                <button 
                  onClick={() => setActiveTab("monthly")} 
                  className={`px-4 py-2 font-medium text-sm ${activeTab === "monthly" ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-green-600'}`}
                >
                  Monthly Summary
                </button>
                <button 
                  onClick={() => setActiveTab("weekly")} 
                  className={`px-4 py-2 font-medium text-sm ${activeTab === "weekly" ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-green-600'}`}
                >
                  Weekly Summary
                </button>
                <button 
                  onClick={() => setActiveTab("daily")} 
                  className={`px-4 py-2 font-medium text-sm ${activeTab === "daily" ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-green-600'}`}
                >
                  Daily Summary
                </button>
              </div>
              
              <div className="h-64">
                {getActiveData().length === 0 ? (
                  <div className="text-gray-500 text-sm text-center h-full flex items-center justify-center">
                    Loading chart data...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getActiveData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#C3F178" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            
            {/* Low Stock Alert */}
            <div className="col-span-4 bg-green-800 rounded-xl shadow-sm p-5 text-white">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">Low Stock Alert</h3>
                <button className="bg-green-700 rounded-full p-1.5">
                  <span className="text-lg">▶</span>
                </button>
              </div>
              
              <div className="mt-4 h-40 overflow-y-auto space-y-2">
                {lowStockProducts.map((item, index) => (
                  <div key={index} className="bg-green-700/50 rounded-lg p-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-red-300 text-sm">{item.qty}/{item.threshold}</span>
                    </div>
                    <div className="mt-1 w-full bg-green-700 h-1.5 rounded-full">
                      <div 
                        className="bg-red-400 h-1.5 rounded-full" 
                        style={{ width: `${(item.qty / item.threshold) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between">
                  <span className="text-xs text-green-300">Critical items</span>
                  <span className="text-xs text-green-300">Restock soon</span>
                </div>
                <div className="relative mt-1">
                  <div className="h-1 bg-green-700 rounded-full">
                    <div className="h-1 bg-green-300 rounded-full w-2/3"></div>
                  </div>
                  <div className="absolute left-2/3 -top-1 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="mt-4 text-sm">
                <p>3 items are below their minimum stock levels. Order more inventory to avoid stockouts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Form Popup */}
      {showDeliveryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-lg font-medium text-gray-800">Add New Delivery</h2>
              <button 
                onClick={() => setShowDeliveryForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitDelivery} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    value={newDelivery.supplier}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Items
                  </label>
                  <input
                    type="text"
                    name="items"
                    value={newDelivery.items}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. Dairy, Produce"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="text"
                      name="date"
                      value={newDelivery.date}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g. Today, Tomorrow, May 30"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="text"
                      name="time"
                      value={newDelivery.time}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g. 2:30 PM"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newDelivery.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeliveryForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 rounded text-white hover:bg-green-700"
                >
                  Add Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-lg font-medium text-red-600">Confirm Deletion</h2>
              <button 
                onClick={handleCancelDelete}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete this delivery?
                </p>
                {deleteIndex !== null && (
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="font-medium text-gray-800">
                      {upcomingDeliveries[deleteIndex]?.supplier}
                    </p>
                    <p className="text-sm text-gray-600">
                      {upcomingDeliveries[deleteIndex]?.items}
                    </p>
                    <p className="text-sm text-gray-500">
                      {upcomingDeliveries[deleteIndex]?.date} at {upcomingDeliveries[deleteIndex]?.time}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}