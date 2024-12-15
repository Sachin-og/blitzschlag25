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

const Login = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 
  const auth = getAuth(app);

  // Check if the user is already logged in
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

  // Sign in with Google
  const signWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;

        // Check if the email is already registered with a different method
        const signInMethods = await fetchSignInMethodsForEmail(auth, user.email);
        if (signInMethods.length > 0 && !signInMethods.includes('google.com')) {
          alert("This email is already registered with a different method. Please log in using that method.");
          return;
        }

        // Check if user exists in Firestore
        const userRef = await read(`users/${user.uid}`);
        if (!userRef) {
          // If user does not exist, write their data
          await write(`users/${user.uid}`, {
            uid: user.uid,
            email: user.email,
            name: user.displayName || "",
            joinedSingleEvent: {}, 
            joinedTeamsEvent: {}, 
          });
        }

        navigate('/profile'); // Redirect to profile page
      })
      .catch((error) => {
        alert(`Google Sign-In Error: ${error.message}`);
      });
  };

  // Handle email and password login
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        alert("Login Successful");
        navigate('/profile'); 
      })
      .catch((error) => {
        alert(`Login Error: ${error.message}`);
      });
  };

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // alert("Google Sign-In Successful");
        navigate('/profile'); 
      })
      .catch((error) => {
        alert(`Google Sign-In Error: ${error.message}`);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center h-full w-full mt-5">
      <div className="grid gap-8 ">
        <section
          id="back-div"
          className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl"
        >
          <div className="border-8 border-transparent rounded-xl bg-white dark:bg-[#0d1117] shadow-xl p-8 m-2">
            <h1 className="text-5xl font-bold text-center cursor-default dark:text-gray-300 text-gray-900">
              Log in
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2 text-lg dark:text-gray-300">Email</label>
                <input
                  id="email"
                  className="border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105 duration-300"
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-lg dark:text-gray-300">Password</label>
                <input
                  id="password"
                  className="border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105 duration-300"
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
                LOG IN
              </button>
              <button
                onClick={handleGoogleSignIn}
                className="w-full p-3 mt-4 text-white bg-red-500 rounded-lg hover:scale-105 transition transform duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Sign in with Google
              </button>
            </form>
            <div className="flex flex-col mt-4 text-sm text-center dark:text-gray-300">
              <p>
                Don't have an account?
                <button onClick={toggleForm} className="text-blue-400 transition hover:underline">Sign Up</button>
              </p>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>
                By signing in, you agree to our
                <a href="#" className="text-blue-400 transition hover:underline">Terms</a>
                and
                <a href="#" className="text-blue-400 transition hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
