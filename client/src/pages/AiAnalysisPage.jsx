import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom'; // To get shopId from URL

export default function AiAnalysisPage() {
  const { shopId } = useParams(); // Ensure your route provides shopId
  console.log("✅ Loaded AI page for shop:", shopId);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', message: 'Welcome! How can I help with your inventory analysis today?' }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [suggestions, setSuggestions] = useState([
    "How much atta was sold in April?",
    "Which products are running low on stock?",
    "Compare April sales with March",
    "Show me sales trends for dairy products"
  ]);
  const [report, setReport] = useState(null); // Report is now dynamic

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/analytics/${shopId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReport(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
      }
    };

    if (shopId) fetchReport();
  }, [shopId]);

  const sendMessage = async (message = chatInput) => {
  if (!message.trim()) return;

  setChatHistory(prev => [...prev, { role: 'user', message }]);
  setChatInput('');
  setIsAnalyzing(true);

  try {
    const res = await axios.post("http://localhost:5000/api/ai/chat", { message });
    const aiReply = res.data.reply || "Sorry, I didn't get that.";
    setChatHistory(prev => [...prev, { role: 'ai', message: aiReply }]);
  } catch (error) {
    console.error("AI backend error:", error);
    setChatHistory(prev => [...prev, { role: 'ai', message: "Sorry, something went wrong." }]);
  }

  setIsAnalyzing(false);
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const selectSuggestion = (suggestion) => {
    setChatInput(suggestion);
    sendMessage(suggestion);
  };

  
 if (!report) {
    return (
      <div className="p-10">
        <h2 className="text-2xl font-bold text-gray-600">Loading report...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      
      {/* Left Section: Reports */}
      <div className="lg:w-2/3 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-900">GREEN MART INSIGHTS</h1>
          <div className="flex space-x-2">
            <button 
              className={`px-4 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-green-900 text-white' : 'bg-white text-green-900 border border-green-900'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${activeTab === 'insights' ? 'bg-green-900 text-white' : 'bg-white text-green-900 border border-green-900'}`}
              onClick={() => setActiveTab('insights')}
            >
              Insights
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${activeTab === 'inventory' ? 'bg-green-900 text-white' : 'bg-white text-green-900 border border-green-900'}`}
              onClick={() => setActiveTab('inventory')}
            >
              Inventory
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Report Overview Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-green-900">{report.title}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex flex-col mb-4">
                    <span className="text-gray-600 text-sm">Total Items Sold</span>
                    <span className="text-2xl font-bold text-green-900">{report.totalSold.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">Top Products</span>
                    <ul className="mt-1">
                      {report.topProducts.slice(0, 3).map((product, i) => (
                        <li key={i} className="flex items-center mb-1">
                          <span className="text-green-900 mr-2">{i + 1}.</span> {product}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <div className="flex flex-col mb-4">
                    <span className="text-gray-600 text-sm">Total Revenue</span>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-green-900">₹{report.totalRevenue.toLocaleString()}</span>
                      <span className={`text-sm ${report.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {report.revenueGrowth > 0 ? '↑' : '↓'} {Math.abs(report.revenueGrowth)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">Top Categories</span>
                    <ul className="mt-1">
                      {report.topCategories.slice(0, 3).map((category, i) => (
                        <li key={i} className="flex items-center mb-1">
                          <span className="text-green-900 mr-2">{i + 1}.</span> {category}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sales Trend Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">📈 Sales Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={report.salesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#1f5334" />
                    <YAxis stroke="#1f5334" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#1f5334', color: '#1f5334' }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
                    />
                    <Bar dataKey="sales" fill="#1f5334" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Observations */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">📍 Key Observations</h3>
              <ul className="space-y-3">
                {report.observations.map((obs, i) => (
                  <li key={i} className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5 mr-3">
                      <div className="w-2 h-2 bg-green-900 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Smart Recommendations</h3>
              <ul className="space-y-3">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5 mr-3">
                      <div className="w-2 h-2 bg-green-900 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Category Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">🍩 Sales Distribution by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {report.categoryData.map((category, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
                      <div 
                        className="bg-green-900 h-4 rounded-full" 
                        style={{ width: `${category.value}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600">{category.name}</div>
                    <div className="font-semibold text-green-900">{category.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Low Stock Alert */}
            <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-700">Low Stock Alert</h3>
              </div>
              
              <div className="space-y-4">
                {report.lowStockItems.map((item, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-red-100 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">Current: {item.stock} units | Reorder at: {item.reorderLevel} units</div>
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                      Reorder
                    </button>
                  </div>
                ))}
              </div>
              
              <button className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex justify-center items-center">
                <span>Generate Purchase Order for All Low Stock Items</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Inventory Health */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">📦 Inventory Health</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Overall Stock Health</span>
                  <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-900 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="font-semibold text-green-900">85%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Stock Turnover Rate</span>
                  <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                  <span className="font-semibold text-green-900">62%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Reorder Efficiency</span>
                  <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-900 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="font-semibold text-green-900">78%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Section: AI Chat */}
      <div className="lg:w-1/3 bg-green-900 border-l border-green-800 p-6 flex flex-col h-screen overflow-hidden">
        {/* Chat Header */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-white">SmartMart AI Assistant</h2>
          </div>
          <p className="text-sm text-green-100 mb-4">
            Ask me anything about your store's performance and inventory!
          </p>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto mb-4 space-y-4">
          {chatHistory.map((chat, index) => (
            <div 
              key={index} 
              className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  chat.role === 'user' 
                    ? 'bg-white text-green-900' 
                    : 'bg-green-800 text-white'
                }`}
              >
                {chat.message}
              </div>
            </div>
          ))}
          
          {isAnalyzing && (
            <div className="flex justify-start">
              <div className="bg-green-800 text-white rounded-lg p-3 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span>Analyzing data...</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Quick Suggestions */}
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button 
              key={index}
              onClick={() => selectSuggestion(suggestion)}
              className="bg-green-800 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-full"
            >
              {suggestion}
            </button>
          ))}
        </div>
        
        {/* Chat Input */}
        <div>
          <div className="bg-white rounded-full px-4 py-2 flex items-center">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              className="bg-transparent flex-grow text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
            />
            <button 
              className="ml-3 bg-green-900 text-white px-4 py-1.5 rounded-full font-semibold hover:bg-green-800 transition disabled:opacity-50"
              onClick={() => sendMessage()}
              disabled={!chatInput.trim() || isAnalyzing}
            >
              {isAnalyzing ? '...' : 'Ask →'}
            </button>
          </div>
        </div>
        
        {/* Chat Footer */}
        <div className="mt-4 text-center text-xs text-green-100">
          🔒 AI analysis based on real-time store data • Updated 2 minutes ago
        </div>
      </div>
    </div>
  );
}