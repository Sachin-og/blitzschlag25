import React, { useState, useEffect } from 'react';
import { app, auth, write } from '../scripts/firebase';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, onAuthStateChanged, updateProfile } from "firebase/auth";

const SignUp = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [name, setName] = useState(''); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/profile');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pwd !== confirmPwd) {
      toast.error("Password and Confirm Password are not the same", { autoClose: 5000 });
      return;
    }
    if (pwd.length < 8) {
      toast.error("Password must be at least 8 characters long", { autoClose: 5000 });
      return;
    }

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
    
      if (methods.length > 0) {
        toast.error("An account with this email already exists.", { autoClose: 5000 });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
        const user = userCredential.user;
    
        await updateProfile(user, { displayName: name });
    
        alert("Account Created Successfully!");
    
        await write(`users/${user.uid}`, {
          email: user.email,
          name: name,
          joinedSingleEvent: {}, 
          joinedTeamsEvent: {},
        });
    
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already in use.");
      } else if (error.code === 'auth/weak-password') {
        alert("Password is too weak.");
      } else {
        alert("Error creating account: " + error.message);
      }
    }    
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center h-full w-full mt-4">
      <div className="grid gap-8 w-1/3">
        <section
          id="back-div"
          className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl"
        >
          <div className="border-8 border-transparent rounded-xl bg-white dark:bg-[#0d1117] shadow-xl p-8 m-2">
            <h1 className="text-5xl font-bold text-center cursor-default dark:text-gray-300 text-gray-900">
              Sign Up
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-lg dark:text-gray-300">Name</label>
                <input
                  type="text"
                  required
                  id="name"
                  className="border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105 duration-300"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 text-lg dark:text-gray-300">Email</label>
                <input
                  required
                  id="email"
                  className="border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105 duration-300"
                  placeholder="example@mail.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="pwd" className="block mb-2 text-lg dark:text-gray-300">Password</label>
                <input
                  type="password"
                  required
                  id="pwd"
                  className="border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105 duration-300"
                  placeholder="********"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirmpwd" className="block mb-2 text-lg dark:text-gray-300">Confirm Password</label>
                <input
                  type="password"
                  required
                  id="confirmpwd"
                  className="border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105 duration-300"
                  placeholder="********"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full p-3 mt-4 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:scale-105 transition transform duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create Account
              </button>
            </form>
            <button onClick={toggleForm} className="text-blue-400 transition hover:underline mt-6 border-inherit hover:border-gray-900 border-4 p-2 rounded-lg">
              Login
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SignUp;
