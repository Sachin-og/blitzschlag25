import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../scripts/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import "../css files/navbar.css";

const Navbar = () => {
  const [NavComponents, setNavComponents] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className=" text-white">
      {NavComponents ? (
        <div className="flex flex-col justify-center items-center py-4 space-y-4">
          <Link to="/" onClick={() => setNavComponents(false)} className="">
            Home
          </Link>
          <Link to="/about" onClick={() => setNavComponents(false)} className="">
            About
          </Link>
          <Link to="/event" onClick={() => setNavComponents(false)} className="">
            Events
          </Link>
          <Link to="/sponsor" onClick={() => setNavComponents(false)} className="">
            Sponsors
          </Link>
          <Link to="/our_team" onClick={() => setNavComponents(false)} className="">
            Our Team
          </Link>
          <Link to="/schedule" onClick={() => setNavComponents(false)} className="">
            Schedule
          </Link>
          <Link to="/campus_embassador" onClick={() => setNavComponents(false)} className="">
            Campus Ambassador
          </Link>
        </div>
      ) : (
        <div className="flex justify-between items-center px-4 py-3">
          <div>
            <Link to="/">Logo</Link>
          </div>
            <ul className="flex justify-between gap-x-3 bg-black rounded-xl p-2">
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
                  <Link to="/" onClick={handleLogout} className="px-4 py-2 rounded">
                    Logout
                  </Link>
                )}
              </li>
              <li className="flex gap-x-4">
                {user ? (
                  <Link to="/profile" onClick={() => setNavComponents(false)} className="px-4 py-2 rounded">
                    Profile
                  </Link>
                ) : null}
                <Link to="/schedule" className="hover:bg-black px-4 py-2 rounded">
                  Schedule
                </Link>
              </li>
            </ul>


          <div onClick={() => setNavComponents(true)} className="cursor-pointer">
            Hamburger
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;