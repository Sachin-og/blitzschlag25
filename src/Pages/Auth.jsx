import React, { useState } from 'react';
import Login from './Login'; // Adjust the import path as necessary
import SignUp from './SignUp'; // Adjust the import path as necessary

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="grid gap-8 w-full">
        {isLogin ? (
          <Login toggleForm={toggleForm} />
        ) : (
          <SignUp toggleForm={toggleForm} />
        )}
        {/* <div className="flex flex-col mt-4 text-sm text-center">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={toggleForm} className="text-blue-400 transition hover:underline">
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default Auth; 