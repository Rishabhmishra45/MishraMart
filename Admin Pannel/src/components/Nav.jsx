import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import { authDataContext } from '../context/AuthContext';
import { adminDataContext } from '../context/AdminContext';

const Nav = () => {
  const navigate = useNavigate();
  const { serverUrl } = useContext(authDataContext);
  const { getAdmin } = useContext(adminDataContext);

  const logOut = async () => {
    try {
      const result = await axios.get(serverUrl + '/api/auth/logout', {
        withCredentials: true,
      });
      console.log(result.data);
      getAdmin();
      navigate('/login');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full h-[60px] bg-[#dcdbdbf8] fixed top-0 left-0 z-10 flex items-center justify-between px-4 md:px-8 shadow-md shadow-black select-none">
      {/* Logo + text */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <div className="flex-shrink-0 flex items-center h-[150px]">
          <img
            src={logo}
            alt="Logo"
            draggable={false}
            className="max-h-[180px] h-full w-auto object-contain"
          />
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={logOut}
        className="bg-black text-white px-4 py-2 rounded-2xl cursor-pointer hover:bg-gray-800 transition-colors text-sm sm:text-base
        "
      >
        LogOut
      </button>
    </div>
  );
};

export default Nav;
