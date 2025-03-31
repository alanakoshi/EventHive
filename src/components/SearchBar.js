import { useState } from "react";

const SearchBar = ({ items }) => {
    const [query, setQuery] = useState("");
    
    // const filteredItems = items.filter(item => 
    //   item.toLowerCase().includes(query.toLowerCase())
    // );
    
    return (
        <div className="search">
            <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
        </div>
    );
  };
  
  export default SearchBar;
  