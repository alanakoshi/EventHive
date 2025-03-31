import { useState } from "react";
import { Link } from 'react-router-dom';
import SearchBar from "./components/SearchBar";
import ProgressBar from "./components/ProgressBar";

const InviteCohost = ({ progress = 20 }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [coHosts, setCoHosts] = useState([
    { name: "Frank", avatar: "F" },
    { name: "Alicia White", avatar: "A" },
    { name: "Hamster", avatar: "H" },
  ]);

  const removeCoHost = (name) => {
    setCoHosts(coHosts.filter((coHost) => coHost.name !== name));
  };

  return (
    <div>
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 rounded-3xl" style={{ backgroundColor: '#EAC645' }}>
            <div className="w-full max-w-md">
            <div className="flex items-center justify-between text-white">
            <Link to="/plan" className="button-tile button-back">&lt;</Link>
            {/* <div>
                <input
                
                placeholder="Bar..."
                style={{
                    display: "flex",          // Enable flexbox
                    flexDirection: "column",  // Stack items vertically
                    alignItems: "center",     // Center items horizontally
                    padding: "8px",
                    margin: "0 auto",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "32px",
                }}
                ></input>
            </div> */}
            <h2 className="text-xl font-bold">Invite Co-host</h2>
            <span className="text-sm">{progress}%</span>
        </div>
        <div className="w-full bg-white h-2 rounded-full mt-2">
          <div className="bg-yellow-800 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <SearchBar></SearchBar>
        <div className="mt-4">
          {coHosts.map((coHost) => (
            <div key={coHost.name} className="flex items-center justify-between bg-yellow-600 text-white p-3 rounded-lg mt-2">
              <div className="flex items-center">
                {coHost.avatar.startsWith("http") ? (
                  <img src={coHost.avatar} alt={coHost.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold">
                    {coHost.avatar}
                  </div>
                )}
                <span className="ml-3">{coHost.name}</span>
              </div>
              <button onClick={() => removeCoHost(coHost.name)}>
                X
              </button>
            </div>
          ))}
        </div>
        </div>
            <div className="mt-auto w-full max-w-md">
                <button className="w-full bg-yellow-500 text-white p-4 rounded-lg text-lg font-bold shadow-md">
                Next
                </button>
            </div>
        </div>
        <div className="grid-buttons">
            <Link to="/invite-cohost" className="button-tile button-plan">Next</Link>
        </div>
    </div>
  );
};

export default InviteCohost;