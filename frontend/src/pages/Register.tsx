import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reload } from 'vite-plugin-ssr/client/router'
import logo from '../assets/heyopey.jpg'

const AuthCard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email:'',
    password:'',
  })
  const onSignin = async () => {
    try {
      console.log("Logging in user:", user);
  
      const resp = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/auth/signin`,
        user,
        { withCredentials: true }
      );
    
      if (resp.data.success) {
        toast.success('You are logged in successfully', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        navigate('/');
        window.location.reload();
      } else {
        toast.error(resp.data.message || 'Login failed', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
  
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong during login";
  
      toast.error(message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };
  
  
  return (
    <div className='w-dvw h-dvh flex justify-center items-center'>
    <div className="max-w-sm w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className='w-[100%] flex justify-center items-center flex-col mb-3'>
      <img className='w-[60%] items-center' src={logo} alt="logo" />
      {/* <h2 className="text-2xl font-semibold mb-2 text-black">Welcome Back!</h2> */}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Email</label>
        <input
          type="email"
          placeholder="m@example.com"
          value={user.email} 
          onChange={(e)=>setUser({...user, email: e.target.value})}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold mb-1">Password</label>
          {/* <a href="#" className="text-sm text-gray-600">Forgot your password?</a> */}
        </div>
        <input
          type="password"
          value={user.password} 
        onChange={(e)=>setUser({...user, password: e.target.value})}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
        />
      </div>

      <button onClick={onSignin} className="w-full bg-black text-white py-2 rounded-md font-semibold">
        Login
      </button>

      <p className="text-sm text-center mt-4">
        {/* Don't have an account? <a href="/signup" className="text-black font-semibold underline">Signup</a> */}
        powered by heux.ai
      </p>
    </div>
    </div>
  );
};

export default AuthCard;