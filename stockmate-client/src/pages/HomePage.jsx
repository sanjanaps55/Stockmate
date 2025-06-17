import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false);

  const scrollToFeatures = (e) => {
    e.preventDefault();
    const featuresSection = document.getElementById('features');
    featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToContact = (e) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative bg-green-900 text-white overflow-x-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full py-6 px-8 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#9EF281]">StockMate</h2>
          <button 
            onClick={scrollToContact}
            className="bg-green-800 hover:bg-green-700 text-[#9EF281] px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 border border-[#9EF281] hover:border-[#8FE172]"
          >
            Contact
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="h-screen w-full flex items-center relative">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            <div className="space-y-8 lg:space-y-12">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight font-serif tracking-wide">
                Start <br />
                Store Management <br />
                at Heart
              </h1>
              <p className="text-green-100 text-xl lg:text-2xl">
                Bringing intelligence to inventory management
              </p>
              {!showAuth ? (
                <button
                  onClick={() => setShowAuth(true)}
                  className="bg-[#9EF281] text-green-900 px-12 py-4 rounded-full text-lg font-semibold hover:bg-[#8FE172] transform hover:scale-105 transition-all duration-300"
                >
                  Join →
                </button>
              ) : (
                <div className="flex gap-6">
                  <Link
                    to="/login"
                    className="bg-green-800 text-white px-12 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transform hover:scale-105 transition-all duration-300"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-[#9EF281] text-green-900 px-12 py-4 rounded-full text-lg font-semibold hover:bg-[#8FE172] transform hover:scale-105 transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
            <div className="relative lg:h-[600px] flex items-center">
              <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#9EF281] rounded-full opacity-20 blur-3xl"></div>
              <div className="relative bg-green-800 rounded-2xl p-10 w-full">
                <h2 className="text-3xl font-bold mb-6">Smart Growth</h2>
                <p className="text-green-100 mb-8 text-xl">
                  Nurture Smarter.<br />
                  Grow Better.
                </p>
                <button onClick={scrollToFeatures} className="text-[#9EF281] hover:text-[#8FE172] text-lg flex items-center gap-2 group">
                  Learn More 
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Stats */}
      <section id="features" className="min-h-screen w-full bg-green-900 py-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-green-800 p-6 rounded-2xl shadow-lg hover:bg-green-800/90 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-[#9EF281] text-lg">📦</span>
                </div>
                <h3 className="text-lg font-bold text-white">Growing Inventory</h3>
              </div>
              <div className="space-y-3">
                <p className="text-green-100 text-sm">
                  Track and manage your stock with intelligent insights and automated alerts.
                </p>
                <ul className="space-y-1 text-sm text-green-200">
                  <li className="flex items-center gap-2">
                    <span className="text-[#9EF281]">•</span> Real-time stock tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#9EF281]">•</span> Low stock notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#9EF281]">•</span> Batch expiry management
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-green-800 p-6 rounded-2xl shadow-lg hover:bg-green-800/90 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-[#9EF281] text-lg">🧾</span>
                </div>
                <h3 className="text-lg font-bold text-white">Smart Billing</h3>
              </div>
              <div className="space-y-3">
                <p className="text-green-100 text-sm">
                  Streamlined POS system with instant invoice generation and stock updates.
                </p>
                <ul className="space-y-1 text-sm text-green-200">
                  <li className="flex items-center gap-2">
                    <span className="text-[#9EF281]">•</span> One-click invoicing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#9EF281]">•</span> Automatic stock adjustment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#9EF281]">•</span> Multiple payment options
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-green-800 p-6 rounded-2xl shadow-lg hover:bg-green-800/90 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-[#9EF281] text-lg">📊</span>
                </div>
                <h3 className="text-lg font-bold text-white">AI Insights</h3>
              </div>
              <div className="space-y-3">
                <p className="text-green-100 text-sm">
                  85% more accurate predictions with our AI-powered analytics system.
                </p>
                <ul className="space-y-1 text-sm text-green-200">
                  <li className="flex items-center gap-2">
                    <span className="text-[#9EF281]">•</span> Sales trend analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#9EF281]">•</span> Demand forecasting
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#9EF281]">•</span> Inventory optimization
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-green-950 text-green-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <p className="text-sm">Email: support@stockmate.ai</p>
            <p className="text-sm">Phone: +91-999-999-9999</p>
          </div>
          <div className="text-right">
            <ul className="space-y-1 text-sm">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center text-sm mt-6">
          © 2024 StockMate. All rights reserved.
        </div>
      </footer>
    </div>
  );
}