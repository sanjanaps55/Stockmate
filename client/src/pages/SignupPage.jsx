import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const validatePassword = () => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    return regex.test(password);
  };


const handleSignup = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post('http://localhost:5000/api/auth/signup', {
      name,
      phone,
      password,
    });

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      alert('Signup successful');
      navigate('/dashboard');
    }
  } catch (err) {
    console.error(err);
    alert('Signup failed');
  }
};


  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Floating Blocks */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-32 h-32 bg-[#9EF281] rounded-xl opacity-10 animate-float-slow transform rotate-12"></div>
        <div className="absolute top-[60%] left-[75%] w-40 h-40 bg-[#9EF281] rounded-xl opacity-10 animate-float-medium transform -rotate-12"></div>
        <div className="absolute top-[80%] left-[10%] w-24 h-24 bg-[#9EF281] rounded-xl opacity-10 animate-float-fast transform rotate-45"></div>
        <div className="absolute top-[20%] left-[80%] w-28 h-28 bg-[#9EF281] rounded-xl opacity-10 animate-float-slow transform -rotate-180"></div>
        <div className="absolute top-[40%] left-[5%] w-36 h-36 bg-[#9EF281] rounded-xl opacity-10 animate-float-medium transform rotate-90"></div>
      </div>

      {/* Content */}
      <div className="bg-green-800/90 p-8 rounded-xl shadow-lg max-w-md w-full text-white space-y-6 backdrop-blur-sm relative z-10">
        <h2 className="text-3xl font-bold text-center">Create Your Account</h2>
        {error && <p className="text-red-300 text-sm text-center">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded bg-green-900/90 border border-green-700 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone Number</label>
            <input
              type="tel"
              pattern="[0-9]{10}"
              placeholder="10 digit number"
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 rounded bg-green-900/90 border border-green-700 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-green-900/90 border border-green-700 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2 rounded bg-green-900/90 border border-green-700 text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#9EF281] text-green-900 font-semibold py-2 rounded hover:bg-[#8FE172] transition transform hover:scale-105 duration-300"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
