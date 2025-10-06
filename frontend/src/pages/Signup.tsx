import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email:'',
    password:'',
  })
  const onLogin = async () => {
    try {
      console.log("Sending user:", user);
      const resp = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/auth/signup`,
        user,
        { withCredentials: true }
      );
      console.log("Response:", resp);
  
      if (resp.data.success) {
        toast.success('You are signed up successfully', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        navigate('/register');
      } else {
        toast.error(resp.data.message || 'Something went wrong', {
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
      console.error("Caught error during signup:", error);
  
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error occurred";
  
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
      <h2 className="text-2xl font-bold mb-2 text-black">Signup</h2>

      <p className="text-sm text-gray-600 mb-4">
        Enter your email below to Signup to your account
      </p>

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
          <a href="#" className="text-sm text-gray-600">Forgot your password?</a>
        </div>
        <input
          type="password"
          value={user.password} 
        onChange={(e)=>setUser({...user, password: e.target.value})}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
        />
      </div>

      <button onClick={onLogin} className="w-full bg-black text-white py-2 rounded-md font-semibold">
        Signup
      </button>

      <p className="text-sm text-center mt-4">
        You already have account? <a href="/register" className="text-black font-semibold underline">Login</a>
      </p>
    </div>
    </div>
  );
};

export default Signup;