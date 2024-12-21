import { React, useState } from 'react';
import { read, auth, write } from '../scripts/firebase';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { toast } from 'react-toastify'; // Import toast from react-toastify

const TeamComponent = ({ eventpath, eventName, eventDescription }) => {
  const user = auth.currentUser;
  const navigate = useNavigate(); // Use useNavigate hook for navigation
  const [teamName, setTeamName] = useState("");

  const checkUserLogin = () => {
    if (!user) {
      toast.error("Please log in first.", { autoClose: 5000 }); // Toast for login error
      navigate('/Auth'); // Use navigate to redirect to the login page
      return false;
    }
    return true;
  };

  const handleCreateTeam = async () => {
    if (!checkUserLogin()) return; // Check if the user is logged in
  
    if (!teamName) {
      toast.error("Invalid Team Name", { autoClose: 5000 }); // Toast for invalid team name
      return;
    }
  
    const userDoc = await read(`users/${user.uid}`);
    const registeredEvents = Array.isArray(userDoc?.joinedTeamsEvent) ? userDoc.joinedTeamsEvent : [];
  
    // Check if the user is already registered for the event
    if (registeredEvents.some(event => event.eventpath === eventpath)) {
      toast.info("Already Registered For this Event", { autoClose: 5000 }); // Toast for already registered
      return;
    }
  
    // Generate a 6-character team code using UUID
    const generateTeamCode = () => {
      return uuidv4().split('-')[0]; // Take the first segment of the UUID
    };
  
    const newTeamCode = generateTeamCode();
  
    // 1. Read the existing event document
    const eventDoc = await read(`events/${eventpath}`);
    const existingTeams = Array.isArray(eventDoc?.registeredTeams) ? eventDoc.registeredTeams : [];
  
    // 2. Append the new team code to the registeredTeams array
    const updatedTeams = [...existingTeams, newTeamCode];
  
    // 3. Write the updated teams array back to the event document
    await write(`events/${eventpath}`, {
      registeredTeams: updatedTeams,
    });
  
    // 4. Create the team document
    await write(`teams/${newTeamCode}`, {
      name: teamName,
      event: eventpath,
      members: [user.uid],
    });
  
    // 5. Update user document to track their registration in the event
    await write(`users/${user.uid}`, {
      joinedTeamsEvent: [...registeredEvents, { eventpath, teamCode: newTeamCode }],
    });
  
    toast.success(`Team created successfully! Your Team Code: ${newTeamCode}`); // Toast for success
  };
  
  return (
    <div className="flex border rounded-lg shadow-md max-w-3xl mx-auto overflow-hidden">
      <div className="flex-2 p-6">
        <h2 className="text-2xl font-bold mb-4">{eventName}</h2>
        <p className="text-gray-600 mb-6">{eventDescription}</p>
        <div>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateTeam(); }}>
            <input
              type="text"
              placeholder="Enter Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none">
              Create Team
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamComponent;
