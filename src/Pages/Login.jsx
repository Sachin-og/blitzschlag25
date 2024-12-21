import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { app, write, read } from '../scripts/firebase'; // Ensure `read` is implemented to fetch data
import { toast } from 'react-toastify'; // Import toast from react-toastify

const Login = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/profile');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address', { autoClose: 5000 }); // Toast for invalid email
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        toast.success("Login Successful", { autoClose: 5000 }); // Toast for successful login
        navigate('/profile');
      })
      .catch((error) => {
        toast.error(`Login Error: ${error.message}`, { autoClose: 5000 }); // Toast for login error
      });
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const signInMethods = await fetchSignInMethodsForEmail(auth, user.email);
      if (signInMethods.length > 0 && !signInMethods.includes('google.com')) {
        toast.error("This email is already registered with a different method. Please log in using that method.", { autoClose: 5000 }); // Toast for email already registered
        return;
      }

      const userRef = await read(`users/${user.uid}`);
      if (!userRef) {
        await write(`users/${user.uid}`, {
          email: user.email,
          name: user.displayName || user.email.split('@')[0], // Fallback to email prefix if no displayName
          joinedSingleEvent: {}, 
          joinedTeamsEvent: {}, 
        });
      }

      toast.success("Google Sign-In Successful", { autoClose: 5000 }); // Toast for Google sign-in success
      navigate('/profile');
    } catch (error) {
      toast.error(`Google Sign-In Error: ${error.message}`, { autoClose: 5000 }); // Toast for Google sign-in error
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center h-full w-full mt-5">
      <div className="grid gap-8">
        <section
          id="back-div"
          className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl opacity-80"
        >
          <div className="border-8 border-transparent rounded-xl bg-white dark:bg-[#0d1117] shadow-xl p-6 m-2">
            <h1 className="text-5xl font-bold text-center cursor-default dark:text-gray-300 text-gray-900">
              Login
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-1 text-lg dark:text-gray-300">Email</label>
                <input
                  id="email"
                  className="border p-2 shadow-md dark:bg-neutral-700 dark:text-gray-300 dark:border-gray-700 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105 duration-300"
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-1 text-lg dark:text-gray-300">Password</label>
                <input
                  id="password"
                  className="border p-2 shadow-md dark:bg-neutral-700 dark:text-gray-300 dark:border-gray-700 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105 duration-300"
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <a href="#" className="text-blue-400 text-sm transition hover:underline">Forget your password?</a>
              <button
                className="w-full p-3 mt-4 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:scale-105 transition transform duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="submit"
              >
                LOGIN
              </button>
            </form>
            <button
              onClick={handleGoogleSignIn}
              className="w-full p-3 mt-4 text-white bg-red-500 rounded-lg hover:scale-105 transition transform duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Sign in with Google
            </button>
            <div className="flex flex-col mt-4 text-sm text-center dark:text-gray-300">
              <p>
                Don't have an account?
                <button onClick={toggleForm} className="text-blue-400 transition hover:underline">{'\u00A0'}Sign Up</button>
              </p>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>
                By signing in, you agree to our
                <a href="#" className="text-blue-400 transition hover:underline">{'\u00A0'}Terms{'\u00A0'}</a>
                and
                <a href="#" className="text-blue-400 transition hover:underline">{'\u00A0'}Privacy Policy</a>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
