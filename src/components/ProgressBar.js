const ProgressBar = () => {
    <div>
        <input
            type="text"
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
    </div>
}

export default ProgressBar;