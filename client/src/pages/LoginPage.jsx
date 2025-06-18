import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: "https://stockmate-66d8.onrender.com"
});


export default function LoginPage() {
  const navigate = useNavigate();

const [name, setName] = useState('');
const [password, setPassword] = useState('');


const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await api.post('/api/auth/login', {
      name,
      password,
    });

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      alert('Login successful');
      navigate('/dashboard');
    }
  } catch (err) {
    console.error(err);
    alert('Login failed');
  }
};



  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Floating Blocks */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[15%] left-[20%] w-36 h-36 bg-[#9EF281] rounded-xl opacity-10 animate-float-slow transform rotate-45"></div>
        <div className="absolute top-[65%] left-[70%] w-44 h-44 bg-[#9EF281] rounded-xl opacity-10 animate-float-medium transform -rotate-12"></div>
        <div className="absolute top-[75%] left-[15%] w-28 h-28 bg-[#9EF281] rounded-xl opacity-10 animate-float-fast transform rotate-90"></div>
        <div className="absolute top-[25%] left-[75%] w-32 h-32 bg-[#9EF281] rounded-xl opacity-10 animate-float-slow transform -rotate-45"></div>
        <div className="absolute top-[45%] left-[10%] w-40 h-40 bg-[#9EF281] rounded-xl opacity-10 animate-float-medium transform rotate-180"></div>
      </div>

      {/* Content */}
      <div className="bg-green-800/90 p-8 rounded-xl shadow-lg max-w-md w-full text-white space-y-6 backdrop-blur-sm relative z-10">
        <h2 className="text-3xl font-bold text-center">Login to StockMate</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Username / Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded bg-green-900/90 border border-green-700 text-white focus:outline-none focus:ring-2 focus:ring-[#9EF281] transition-all duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-green-900/90 border border-green-700 text-white focus:outline-none focus:ring-2 focus:ring-[#9EF281] transition-all duration-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#9EF281] text-green-900 font-semibold py-2 rounded hover:bg-[#8FE172] transition transform hover:scale-105 duration-300"
          >
            Login
          </button>
          <div className="text-center text-sm">
            <a href="#" className="text-[#9EF281] hover:text-[#8FE172] transition-colors duration-300">
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
