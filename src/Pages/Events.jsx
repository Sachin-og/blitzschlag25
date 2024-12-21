import React, { useState } from "react";
import { read, auth, write } from '../scripts/firebase';
import { useNavigate } from 'react-router-dom';
import SingleComponent from "../Components/single";
import TeamComponent from "../Components/team";
import eventsData from '../scripts/eventData';
import { toast } from 'react-toastify'; // Import toast from react-toastify

const Events = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [activeTab, setActiveTab] = useState("flagship");
  const [teamCode, setTeamCode] = useState("");

  const checkUserLogin = () => {
    if (!user) {
      toast.error("Please log in first.", { autoClose: 5000 }); // Toast for login error
      navigate('/Auth'); // Use navigate to redirect to the login page
      return false;
    }
    return true;
  };

  const handleJoinTeam = async () => {
    if (!checkUserLogin()) return; // Check if the user is logged in
  
    if (!teamCode) {
      toast.error("Invalid Team Code", { autoClose: 5000 }); // Toast for invalid team code
      return;
    }
  
    // Fetch the team document
    const teamDoc = await read(`teams/${teamCode}`);
    if (!teamDoc) {
      toast.error("Team not found", { autoClose: 5000 }); // Toast for team not found
      return;
    }
  
    // Extract the event path (stored in 'event' attribute of the team)
    const eventPath = teamDoc.event;
    if (!eventPath) {
      toast.error("Event data for this team is missing.", { autoClose: 5000 }); // Toast for missing event data
      return;
    }
  
    // Retrieve event data for max team size
    const eventDoc = await read(`events/${eventPath}`);
    // || !eventDoc.maxTeamSize
    if (!eventDoc) {
      toast.error("Event data is missing or incomplete.", { autoClose: 5000 }); // Toast for incomplete event data
      return;
    }
  
    const maxTeamSize = eventDoc.maxTeamSize;
  
    // Check if the user has already joined a team for this event
    const userDoc = await read(`users/${user.uid}`);
    const registeredEvents = Array.isArray(userDoc?.joinedTeamsEvent) ? userDoc.joinedTeamsEvent : [];
  
    // Prevent joining another team for the same event
    if (registeredEvents.some(event => event.eventpath === eventPath)) {
      toast.info("You have already joined a team for this event. You cannot join another team.", { autoClose: 5000 }); // Toast for already joined event
      return;
    }
  
    // Check if the user is already a member of this team
    if (teamDoc.members.includes(user.uid)) {
      toast.info("You are already a member of this team.", { autoClose: 5000 }); // Toast for already a team member
      return;
    }
  
    // Check if the team has reached its max capacity
    if (teamDoc.members.length >= maxTeamSize) {
      toast.error("This team is full.", { autoClose: 5000 }); // Toast for team full
      return;
    }
  
    // Update the team's members array to include the current user
    await write(
      `teams/${teamCode}`,
      {
        members: [...teamDoc.members, user.uid], // Add user to members array
      },
      { merge: true } // Prevent overwriting other fields
    );
  
    // Update the user's document to track the joined team and event
    await write(
      `users/${user.uid}`,
      {
        joinedTeamsEvent: [...registeredEvents, { eventpath: eventPath, teamCode }],
      },
      { merge: true } // Avoid overwriting other user data
    );
  
    toast.success("Successfully joined the team!", { autoClose: 5000 }); // Toast for success
  };
  
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Events</h1>
      <div className="mb-5 flex justify-center">
        <form onSubmit={(e) => { e.preventDefault(); handleJoinTeam(); }}>
          <input
            type="text"
            placeholder="Enter Team Code"
            value={teamCode}
            onChange={(e) => setTeamCode(e.target.value)}
            className="w-96 mr-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none">
            Join Team
          </button>
        </form>
      </div>
      <div className="flex justify-center space-x-4 mb-6">
        {Object.keys(eventsData).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"
            } hover:bg-blue-500 hover:text-white focus:outline-none`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div>
        {eventsData[activeTab].map((event, index) => (
          // Conditionally render SingleComponent or TeamComponent based on event type
          event.type === "singleEvent" ? (
            <SingleComponent
              key={index}
              eventName={event.name}
              eventDescription={event.description}
              eventpath={event.eventPath}
            />
          ) : (
            <TeamComponent
              key={index}
              eventName={event.name}
              eventDescription={event.description}
              eventpath={event.eventPath}
            />
          )
        ))}
      </div>
    </div>
  );
};

export default Events;
