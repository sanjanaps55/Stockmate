import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utils/fetchWithAuth";


export default function DashboardPage() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    manager: "",
    contact: ""
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    shopIndex: null,
    password: "",
    error: ""
  });
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchShops = async () => {
      try {
        const data = await fetchWithAuth("/api/shops");
        setShops(data);
      } catch (err) {
        console.error("Failed to fetch shops", err);
      }
    };

    fetchShops();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formError) setFormError("");
  };

  const handleAddShop = async () => {
    if (!formData.name.trim()) {
      setFormError("Shop name is required");
      return;
    }
    if (!formData.location.trim()) {
      setFormError("Location is required");
      return;
    }

    setIsLoading(true);
    setFormError("");
    const token = localStorage.getItem("token");

    try {
        const res = await fetchWithAuth("/api/shops", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const newShop = await res.json();
      setShops((prev) => [...prev, newShop]);
      setFormData({ name: "", location: "", manager: "", contact: "" });
      setIsFormOpen(false);

    } catch (err) {
      console.error("Failed to add shop", err);
      setFormError("Failed to add shop. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (e, index) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      shopIndex: index,
      password: "",
      error: ""
    });
  };

  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem("token");
    const shopId = shops[deleteModal.shopIndex]._id;

    try {
      const shopId = shops[deleteModal.shopIndex]._id;
      await fetchWithAuth(`/api/shops/${shopId}`, {
        method: "DELETE",
        body: JSON.stringify({ password: deleteModal.password }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to delete");
      }

      const updatedShops = shops.filter((_, index) => index !== deleteModal.shopIndex);
      setShops(updatedShops);
      handleDeleteCancel();
    } catch (err) {
      console.error(err);
      setDeleteModal(prev => ({
        ...prev,
        error: err.message
      }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      shopIndex: null,
      password: "",
      error: ""
    });
  };

  const handlePasswordChange = (e) => {
    setDeleteModal(prev => ({
      ...prev,
      password: e.target.value,
      error: ""
    }));
  };


  return (
    <div className="min-h-screen bg-green-900 text-white relative">
      {/* Dashboard Header */}
      <div className="w-full border-b border-green-800 px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#9EF281]">Dashboard</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-[#9EF281] text-green-900 px-6 py-2 rounded hover:bg-[#8FE172] font-semibold"
          >
            Add Shop
          </button>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Shop List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Shops</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shops.map((shop, index) => (
              <li
                key={index}
                onClick={() => navigate(`/shop/${shop._id}`)}
                className="bg-white rounded-lg w-full h-48 overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer relative group"
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteClick(e, index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  title="Delete shop"
                >
                  ✕
                </button>

                <div className="h-2/3 bg-gradient-to-b from-green-800/80 to-green-900/90 p-4">
                  <h3 className="text-lg font-semibold text-white">{shop.name}</h3>
                  <p className="text-sm text-gray-200">{shop.location}</p>
                </div>
                <div className="h-1/3 bg-green-900 p-4">
                  <p className="text-sm text-gray-200">View Details →</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sliding Form Panel */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-green-800 shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${isFormOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Add New Shop</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-gray-300 hover:text-white">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Shop Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-green-700 rounded border border-green-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9EF281]"
                placeholder="Enter shop name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-green-700 rounded border border-green-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9EF281]"
                placeholder="Enter location"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Manager Name</label>
              <input
                type="text"
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-green-700 rounded border border-green-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9EF281]"
                placeholder="Enter manager name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Contact Number</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-green-700 rounded border border-green-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9EF281]"
                placeholder="Enter contact number"
              />
            </div>

            <button
              onClick={handleAddShop}
              className="w-full bg-[#9EF281] text-green-900 px-6 py-2 rounded hover:bg-[#8FE172] font-semibold mt-6"
            >
              Save Shop
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 w-96 mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            
            {deleteModal.shopIndex !== null && (
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete "<strong>{shops[deleteModal.shopIndex]?.name}</strong>"?
              </p>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter password to confirm:
              </label>
              <input
                type="password"
                value={deleteModal.password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Password"
                autoFocus
              />
              {deleteModal.error && (
                <p className="text-red-500 text-sm mt-1">{deleteModal.error}</p>
              )}
            </div>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}