import { React, useState, useEffect } from 'react';
import { read, auth, write } from '../scripts/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import the toast function
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

const SingleComponent = ({ eventpath, eventName, eventDescription }) => {
    const user = auth.currentUser;
    const navigate = useNavigate(); // Use useNavigate hook for navigation

    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [isRegistered, setIsRegistered] = useState(false);

    // Fetch the list of users already registered for the event
    useEffect(() => {
        if (!eventpath || !user?.uid) return; // Make sure eventpath and user UID are valid

        const fetchEventData = async () => {
            const eventDocPath = `events/${eventpath}`; // Full path to the event document
            const eventData = await read(eventDocPath); // Reading event data from Firebase
            if (eventData && eventData.registeredUsers) {
                // Check if the user is in the registeredUsers array
                const isUserRegistered = eventData.registeredUsers.some(uid => uid === user.uid);
                setRegisteredUsers(eventData.registeredUsers);
                setIsRegistered(isUserRegistered); // Update registration status
            }
        };

        fetchEventData();
    }, [eventpath, user?.uid]); // Re-run when eventpath or user UID changes

    const checkUserLogin = () => {
        if (!user) {
            toast.error("Please log in first.", { autoClose: 5000 }); // Toast for login alert
            navigate('/Auth'); 
            return false;
        }
        return true;
    };

    // Register User for the event
    const handleRegister = async () => {
        if (!checkUserLogin()) return;
    
        if (!isRegistered) {
            const updatedUsers = [...registeredUsers, user.uid];
    
            // Fetch the existing joinedSingleEvent array for the user
            const userDoc = await read(`users/${user.uid}`);
            const existingJoinedEvents = Array.isArray(userDoc?.joinedSingleEvent) 
                ? userDoc.joinedSingleEvent 
                : []; // Ensure it's an array
    
            const updatedUserJoinedEvents = [...existingJoinedEvents, eventpath];
    
            // Update the event's registered users
            const eventDocPath = `events/${eventpath}`; // Full path to the event document
            await write(eventDocPath, { registeredUsers: updatedUsers }, { merge: true }); // Use merge to avoid overwriting
    
            // Update the user's joinedSingleEvent array
            await write(`users/${user.uid}`, { joinedSingleEvent: updatedUserJoinedEvents }, { merge: true });
    
            setRegisteredUsers(updatedUsers);
            setIsRegistered(true);
            toast.success("Successfully registered!", { autoClose: 5000 }); // Toast for success
        } else {
            toast.info("You are already registered for this event.", { autoClose: 5000 }); // Toast for already registered
        }
    };    

    // Unregister User from the event
    const handleUnregister = async () => {
        if (!checkUserLogin()) return;

        if (isRegistered) {
            const updatedUsers = registeredUsers.filter(uid => uid !== user.uid);
            const updatedUserJoinedEvents = (user?.joinedSingleEvent || []).filter(event => event !== eventpath);

            // Update the event's registered users
            const eventDocPath = `events/${eventpath}`; // Full path to the event document
            await write(eventDocPath, { registeredUsers: updatedUsers });

            // Update the user's joinedSingleEvent
            await write(`users/${user.uid}`, { joinedSingleEvent: updatedUserJoinedEvents });

            setRegisteredUsers(updatedUsers);
            setIsRegistered(false);
            toast.success("Successfully unregistered!", { autoClose: 5000 }); // Toast for success
        } else {
            toast.info("You are not registered for this event.", { autoClose: 5000 }); // Toast for not registered
        }
    };

    return (
        <div className="flex border rounded-lg shadow-md max-w-3xl mx-auto overflow-hidden">
            <div className="flex-2 p-6">
                <h2 className="text-2xl font-bold mb-4">{eventName}</h2>
                <p className="text-gray-600 mb-6">{eventDescription}</p>
                <div>
                    <button 
                        onClick={handleRegister} 
                        disabled={isRegistered} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-400">
                        {isRegistered ? "Already Registered" : "Register"}
                    </button>
                    {isRegistered && (
                        <button 
                            onClick={handleUnregister} 
                            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none">
                            Unregister
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SingleComponent;

