import React, { useState, useRef, useEffect } from 'react';
import { useParams } from "react-router-dom";

export default function SupermarketBilling() {
  const { shopId } = useParams();
  const [inventory, setInventory] = useState([]);
  
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
        console.log("Fetched inventory:", data); // Debug log
        setInventory(data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    }

    if (shopId) fetchInventory();
  }, [shopId]);

  const [cart, setCart] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', quantity: '1', barcode: '' });
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const billRef = useRef(null);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax - discount;

  // Search products
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.barcode.includes(searchQuery)
  );

  // Helper function to get current stock for an item
  const getCurrentStock = (productId) => {
    const inventoryItem = inventory.find(item => item._id === productId);
    const cartItem = cart.find(item => item._id === productId);
    
    if (!inventoryItem) return 0;
    
    console.log("Inventory item:", inventoryItem); // Debug log
    
    // Check multiple possible field names for stock/quantity
    const stockInInventory = inventoryItem.qty || inventoryItem.quantity || inventoryItem.stock || 0;
    const quantityInCart = cartItem ? cartItem.quantity : 0;
    
    console.log(`Stock for ${inventoryItem.name}: ${stockInInventory}, In cart: ${quantityInCart}`); // Debug log
    
    return Math.max(0, stockInInventory - quantityInCart);
  };

  // Helper function to get total inventory stock for an item
  const getTotalInventoryStock = (productId) => {
    const inventoryItem = inventory.find(item => item._id === productId);
    if (!inventoryItem) return 0;
    
    return inventoryItem.qty || inventoryItem.quantity || inventoryItem.stock || 0;
  };

  // Helper function to check if item is available
  const isItemAvailable = (productId, requestedQuantity = 1) => {
    return getCurrentStock(productId) >= requestedQuantity;
  };

  const handleAddToCart = (product) => {
    console.log("Trying to add product:", product); // Debug log
    
    const currentStock = getCurrentStock(product._id);
    console.log("Current stock for", product.name, ":", currentStock); // Debug log
    
    if (currentStock <= 0) {
      alert(`Sorry, ${product.name} is out of stock!`);
      return;
    }
    
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      if (currentStock > 0) {
        setCart(cart.map(item => 
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        alert(`Cannot add more ${product.name}. Only ${currentStock} available in stock.`);
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleManualItemAdd = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    
    const newItemObject = {
      _id: Date.now().toString(), // Generate unique ID for manual items
      name: newItem.name,
      price: parseFloat(newItem.price),
      quantity: parseInt(newItem.quantity) || 1,
      barcode: newItem.barcode || 'N/A',
      stock: 999 // Manual items assumed to have sufficient stock
    };
    
    setCart([...cart, newItemObject]);
    setNewItem({ name: '', price: '', quantity: '1', barcode: '' });
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Check if the item is from inventory (has stock control)
    const inventoryItem = inventory.find(item => item._id === id);
    
    if (inventoryItem) {
      // Get total available stock from inventory
      const totalInventoryStock = getTotalInventoryStock(id);
      
      if (newQuantity > totalInventoryStock) {
        alert(`Cannot set quantity to ${newQuantity}. Only ${totalInventoryStock} available in stock.`);
        return;
      }
    }
    
    setCart(cart.map(item => 
      item._id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const applyCoupon = () => {
    if (couponCode.trim().toLowerCase() === 'grocery10') {
      setDiscount(subtotal * 0.1); // 10% discount
    } else if (couponCode.trim().toLowerCase() === 'grocery20') {
      setDiscount(subtotal * 0.2); // 20% discount
    } else {
      setDiscount(0);
    }
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCouponCode('');
    setCustomerName('');
  };

  const handleBarcodeKeyPress = (e) => {
    if (e.key === 'Enter') {
      const product = inventory.find(item => item.barcode === e.target.value);
      if (product) {
        handleAddToCart(product);
        setSearchQuery('');
      }
    }
  };

  const handleProcessBill = async () => {
    // Validate stock before processing
    for (const cartItem of cart) {
      const inventoryItem = inventory.find(item => item._id === cartItem._id);
      if (inventoryItem) {
        const availableStock = inventoryItem.qty || inventoryItem.quantity || inventoryItem.stock || 0;
        if (cartItem.quantity > availableStock) {
          alert(`Insufficient stock for ${cartItem.name}. Available: ${availableStock}, Requested: ${cartItem.quantity}`);
          return false;
        }
      }
    }

    const token = localStorage.getItem("token");
    const itemsToSave = cart.map(item => ({
      _id: item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity
    }));

    const payload = {
      customerName,
      items: itemsToSave,
      subtotal: subtotal,
      tax: tax,
      discount: discount,
      total: total
    };

    try {
      const res = await fetch(`http://localhost:5000/api/bill/${shopId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        // Update local inventory to reflect the sold items
        setInventory(prevInventory => 
          prevInventory.map(item => {
            const soldItem = cart.find(cartItem => cartItem._id === item._id);
            if (soldItem) {
              const currentStock = item.qty || item.quantity || item.stock || 0;
              return {
                ...item,
                qty: Math.max(0, currentStock - soldItem.quantity),
                quantity: Math.max(0, currentStock - soldItem.quantity)
              };
            }
            return item;
          })
        );
        
        alert("Bill processed and saved!");
        return true;
      } else {
        alert("Error saving bill: " + data.error);
        return false;
      }
    } catch (err) {
      console.error("Billing error:", err);
      alert("Network error while saving bill");
      return false;
    }
  };

  const handlePrintBill = async () => {
    if (cart.length === 0) return;
    
    const billSaved = await handleProcessBill();
    if (billSaved) {
      const printContent = billRef.current;
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      
      clearCart(); // Clear cart after successful bill processing and printing
    }
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-IN') + ' ' + date.toLocaleTimeString('en-IN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-green-900 mb-6">Supermarket Billing System</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Item Selection and Addition */}
          <div className="lg:w-2/3">
            {/* Barcode Scanner Simulation */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search item or scan barcode..."
                  className="flex-grow px-4 py-3 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleBarcodeKeyPress}
                />
                <button 
                  className="bg-green-900 text-white px-6 py-3 rounded-r hover:bg-green-800"
                >
                  Search
                </button>
              </div>
            </div>
            
            {/* Product Grid */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4">Select Products</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map(product => {
                    const currentStock = getCurrentStock(product._id);
                    const isOutOfStock = currentStock <= 0;
                    
                    return (
                      <div 
                        key={product._id} 
                        className={`border border-gray-200 rounded-lg p-3 flex items-center cursor-pointer transition-colors ${
                          isOutOfStock 
                            ? 'bg-gray-100 opacity-60 cursor-not-allowed' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => !isOutOfStock && handleAddToCart(product)}
                      >
                        <div className="flex-grow">
                          <div className={`font-medium ${isOutOfStock ? 'text-gray-500' : ''}`}>
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">{product.weight}</div>
                          <div className={`font-semibold ${isOutOfStock ? 'text-gray-500' : 'text-green-900'}`}>
                            ₹{product.price.toFixed(2)}
                          </div>
                          <div className={`text-xs mt-1 ${
                            isOutOfStock ? 'text-red-500 font-medium' : 
                            currentStock <= 5 ? 'text-orange-500' : 'text-gray-600'
                          }`}>
                            {isOutOfStock ? 'Out of Stock' : `Stock: ${currentStock}`}
                          </div>
                        </div>
                        {isOutOfStock && (
                          <div className="ml-2 text-red-500 text-xs font-bold">
                            ❌
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-6 text-gray-500">
                    No products found
                  </div>
                )}
              </div>
            </div>
            
            {/* Manual Item Addition */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4">Add Manual Item</h2>
              <form onSubmit={handleManualItemAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                  min="1"
                />
                <input
                  type="text"
                  placeholder="Barcode (Optional)"
                  value={newItem.barcode}
                  onChange={(e) => setNewItem({...newItem, barcode: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button 
                  type="submit"
                  className="bg-green-900 text-white px-4 py-2 rounded hover:bg-green-800"
                >
                  Add Item
                </button>
              </form>
            </div>
            
            {/* Cart/Current Bill */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <h2 className="text-xl font-semibold p-4 bg-green-900 text-white">Current Bill</h2>
              
              {/* Cart Items */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left">Item</th>
                      <th className="py-3 px-4 text-right">Price</th>
                      <th className="py-3 px-4 text-center">Quantity</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length > 0 ? (
                      cart.map(item => {
                        const inventoryItem = inventory.find(inv => inv._id === item._id);
                        const totalInventoryStock = inventoryItem ? getTotalInventoryStock(item._id) : 999;
                        const isInventoryItem = !!inventoryItem;
                        
                        return (
                          <tr key={item._id} className="border-t border-gray-200">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  {item.weight && <div className="text-xs text-gray-500">{item.weight}</div>}
                                  {isInventoryItem && (
                                    <div className="text-xs text-gray-500">
                                      Total Available: {totalInventoryStock}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">₹{item.price.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <div className="flex justify-center">
                                <div className="flex items-center border border-gray-300 rounded">
                                  <button 
                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                  >
                                    −
                                  </button>
                                  <span className="px-3 py-1">{item.quantity}</span>
                                  <button 
                                    className={`px-2 py-1 text-gray-600 hover:bg-gray-100 ${
                                      isInventoryItem && item.quantity >= totalInventoryStock ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                    disabled={isInventoryItem && item.quantity >= totalInventoryStock}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button 
                                onClick={() => handleRemoveItem(item._id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-gray-500">
                          No items in cart
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Cart Controls */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow flex">
                      <input
                        type="text"
                        placeholder="Coupon Code"
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-l focus:outline-none"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button 
                        className="bg-green-900 text-white px-4 py-2 rounded-r hover:bg-green-800"
                        onClick={applyCoupon}
                      >
                        Apply
                      </button>
                    </div>
                    <button 
                      className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-50"
                      onClick={clearCart}
                    >
                      Clear Bill
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Final Bill */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm sticky top-4" ref={billRef}>
              {/* Bill Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-center text-green-900 mb-2">GREEN MART</h2>
                <p className="text-center text-gray-500 text-sm mb-4">123 Market Street, Cityville</p>
                <p className="text-center text-gray-500 text-sm mb-4">Tel: 123-456-7890</p>
                <p className="text-center text-sm mb-2">Invoice #: INV-{Date.now().toString().substring(7)}</p>
                <p className="text-center text-sm mb-2">Date: {formatDate()}</p>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Enter customer name"
                  />
                </div>
              </div>
              
              {/* Bill Items */}
              <div className="p-6">
                <h3 className="font-semibold mb-4">Bill Details</h3>
                
                <div className="border-b border-gray-200 pb-4 mb-4">
                  {cart.length > 0 ? (
                    cart.map((item, index) => (
                      <div key={index} className="flex justify-between mb-2 text-sm">
                        <div>
                          <span>{item.name} × {item.quantity}</span>
                        </div>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">No items added</div>
                  )}
                </div>
                
                {/* Bill Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4 border-t border-gray-200 font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Print Button */}
                <div className="mt-6">
                  <button 
                    className="w-full bg-green-900 text-white py-3 rounded-md hover:bg-green-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={handlePrintBill}
                    disabled={cart.length === 0}
                  >
                    Print Bill
                  </button>
                </div>
                
                {/* Footer */}
                <div className="mt-8 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
                  <p>Thank you for shopping with us!</p>
                  <p>Visit us again</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}