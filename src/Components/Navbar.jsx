import React, { useEffect, useState } from "react";
import { auth } from "../scripts/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';

import "../css files/navbar.css";

const Navbar = () => {
  const [NavComponents, setNavComponents] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/Auth");
      setShowLogoutModal(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleOverlayClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setNavComponents(false);
      setIsClosing(false);
    }, 500); // Match animation duration
  };

  return (
    <div className="text-white relative">
      {NavComponents && (
        <div
          className={`overlay fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 bg-opacity-95 z-50 flex justify-evenly items-center ${
            isClosing ? "close" : "open"
          }`}
        >
          {/* Close Icon */}
          <button
            onClick={handleOverlayClose}
            className="absolute top-4 right-4 text-white text-3xl z-50"
          >
            <FaTimes />
          </button>

          {/* Navigation Links */}
          <div className="navComponent justify-center items-center w-fit">
            <ul className="flex flex-col w-fit justify-center items-center space-y-6">
              <li>
                <Link to="/" className="px-4 py-2 rounded interactive-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="px-4 py-2 rounded interactive-link">
                  About
                </Link>
              </li>
              <li>
                <Link to="/our_team" className="px-4 py-2 rounded interactive-link">
                  Our Team
                </Link>
              </li>
              <li>
                <Link to="/campus_embassador" className="px-4 py-2 rounded interactive-link">
                  Embassador
                </Link>
              </li>
              <li>
                <Link to="/pass" className="px-4 py-2 rounded interactive-link">
                  Pass
                </Link>
              </li>
              <li>
                <Link to="/pronight" className="px-4 py-2 rounded interactive-link">
                  Pro Nights
                </Link>
              </li>
            </ul>
          </div>

          {/* Floating Image */}
          <div className="w-1/2 h-full relative hidden md:block">
            <img
              src="https://via.placeholder.com/300"
              alt="Overlay Visual"
              className="absolute right-10 top-1/4 w-3/4 max-w-sm animate-float"
            />
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-black">
            <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
            <p className="mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <div className="flex justify-between items-center px-4 py-3">
        <div>
          <Link to="/">Logo</Link>
        </div>

        {/* Main Navigation (Visible in PC) */}
        <ul className="hidden lg:flex justify-between gap-x-3 bg-black rounded-xl p-2">
          <li>
            <Link to="/sponsor" className="hover:bg-black px-4 py-2 rounded">
              Sponsor
            </Link>
          </li>
          <li>
            <Link to="/event" className="hover:bg-black px-4 py-2 rounded">
              Events
            </Link>
          </li>
          <li>
            {!user ? (
              <Link to="/Auth" className="hover:bg-black px-4 py-2 rounded">
                Login
              </Link>
            ) : (
              <Link  className="hover:bg-black px-4 py-2 rounded" onClick={() => setShowLogoutModal(true)}>
                  Logout
              </Link>
            )}
          </li>
          <li className="flex gap-x-4">
            {user ? (
              <Link
                to="/profile"
                onClick={() => setNavComponents(false)}
                className="px-4 py-2 rounded"
              >
                Profile
              </Link>
            ) : null}
            <Link
              to="/schedule"
              className="hover:bg-black px-4 py-2 rounded"
            >
              Schedule
            </Link>
          </li>
        </ul>

        {/* Hamburger Icon */}
        <div
          onClick={() => setNavComponents(true)}
          className="cursor-pointer text-2xl"
        >
          {NavComponents ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </div>
  );
};

export default Navbar;