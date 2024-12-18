import React, { useState, useEffect } from "react";
import { getAuth, updateProfile, sendEmailVerification } from "firebase/auth";
import { read, write } from "../scripts/firebase";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [joinedSingleEvents, setJoinedSingleEvents] = useState([]); // Store single events
  const [joinedTeamEvents, setJoinedTeamEvents] = useState([]); // Store team events
  const [eventsLoading, setEventsLoading] = useState(true); // Loading state for events
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setName(currentUser.displayName || "");
      setEmailVerified(currentUser.emailVerified);
      setLoading(false);

      // Fetch the user's joined events
      fetchJoinedEvents(currentUser.uid);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchJoinedEvents = async (userId) => {
    try {
      setEventsLoading(true); // Start loading
      const userDoc = await read(`users/${userId}`);

      // Ensure joinedSingleEvent and joinedTeamsEvent exist and are arrays
      const joinedSingleEvent = Array.isArray(userDoc?.joinedSingleEvent) ? userDoc.joinedSingleEvent : [];
      const joinedTeamsEvent = Array.isArray(userDoc?.joinedTeamsEvent) ? userDoc.joinedTeamsEvent : [];

      // Store single events data
      const singleEventsData = [];
      for (const eventpath of joinedSingleEvent) {
        const eventDoc = await read(`events/${eventpath}`);
        if (eventDoc) {
          singleEventsData.push({
            eventpath: eventpath,
            eventName: eventDoc.name,
            eventDescription: eventDoc.description,
          });
        } else {
          console.error(`Missing event data for Event Path: ${eventpath}`);
        }
      }

      // Store team events data
      const teamEventsData = [];
      for (const teamEvent of joinedTeamsEvent) {
        const eventDoc = await read(`events/${teamEvent.eventpath}`);
        if (eventDoc) {
          const teamDoc = await read(`teams/${teamEvent.teamCode}`);
          if (teamDoc) {
            // Fetch all team members' names based on the member uids
            const teamMembersWithNames = await Promise.all(
              teamDoc.members.map(async (memberUid) => {
                const memberDoc = await read(`users/${memberUid}`);
                return memberDoc ? memberDoc.name : "Unknown"; // Fallback to "Unknown" if no name is found
              })
            );

            teamEventsData.push({
              eventpath: teamEvent.eventpath,
              teamName: teamDoc.name,
              teamMembers: teamMembersWithNames, // Now contains all team members' names
            });
          } else {
            console.error(`Missing team data for Team Code: ${teamEvent.teamCode}`);
          }
        } else {
          console.error(`Missing event data for Event Path: ${teamEvent.eventpath}`);
        }
      }

      setJoinedSingleEvents(singleEventsData);
      setJoinedTeamEvents(teamEventsData);
    } catch (error) {
      console.error("Error fetching events: ", error);
    } finally {
      setEventsLoading(false); // End loading
    }
  };

  const handleUpdateProfile = async () => {
    if (!name) {
      alert("Name is required!");
      return;
    }

    try {
      await updateProfile(auth.currentUser, { displayName: name });

      await write(`users/${auth.currentUser.uid}`, {
        email: auth.currentUser.email,
        name: name, // Updated name
      });

      alert("Profile updated successfully");
    } catch (error) {
      alert("Error updating profile: " + error.message);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      alert("Verification email sent!");
    } catch (error) {
      alert("Error sending verification email: " + error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile Page</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={user ? user.email : ""}
            disabled
            readOnly
          />
        </div>
        <div>
          <button onClick={handleUpdateProfile}>Update Profile</button>
        </div>
      </form>

      <div>
        <p>Email Verified: {emailVerified ? "Yes" : "No"}</p>
        {!emailVerified && (
          <button onClick={handleVerifyEmail}>Verify Email</button>
        )}
      </div>

      {/* Display Joined Single Events */}
      <div>
        <h2>Joined Single Events</h2>
        {eventsLoading ? (
          <p>Loading your events...</p>
        ) : joinedSingleEvents.length === 0 ? (
          <p>You haven't joined any single events yet.</p>
        ) : (
          <ul>
            {joinedSingleEvents.map((event, index) => (
              <li key={index}>
                <strong>{event.eventName}</strong> - {event.eventDescription}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Display Joined Team Events */}
      <div>
        <h2>Joined Team Events</h2>
        {eventsLoading ? (
          <p>Loading your team events...</p>
        ) : joinedTeamEvents.length === 0 ? (
          <p>You haven't joined any team events yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Event Path</th>
                <th>Team Name</th>
                <th>Team Members</th>
              </tr>
            </thead>
            <tbody>
              {joinedTeamEvents.map((event, index) => (
                <tr key={index}>
                  <td>{event.eventpath}</td>
                  <td>{event.teamName}</td>
                  <td>
                    {event.teamMembers.length === 0
                      ? "No members"
                      : event.teamMembers.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Profile;
