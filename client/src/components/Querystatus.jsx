import React, { useState } from 'react';
import './Querystatus.css';

function Querystatus() {
  const [pnr, setPnr] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [status, setStatus] = useState("");

  const handlePlayClick = () => {
    // Validate PNR: must be 10 digits long and numeric
    if (pnr.length !== 10 || !/^\d+$/.test(pnr)) {
      setStatus("Enter a valid 10-digit PNR.");
      return; // Exit the function if the input is invalid
    }

    setShowAnimation(true);
    setStatus("");

    setTimeout(() => {
      setShowAnimation(false);
      // Call the API here (simulate with a status update)
      setStatus("Query Status: Confirmed");
    }, 3000);
  };

  return (
    <div className="container1">
      <img
        src="src/assets/waves1.png"
        alt="Train Image"
        className="train-image"
      />
      <div className="content1 mb-40">
        <div className="input-container flex items-center scale-105">
          <input
            type="text"
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
            placeholder="Enter Your PNR Number"
            className="pnr-input"
          />
          <div className="play-container" onClick={handlePlayClick}>
            <span className="play-symbol h-4 w-4 cursor-pointer">▶</span>
          </div>
        </div>

        {/* Display the dinosaur animation */}
        {showAnimation && (
          <div className="dinosaur-animation mt-20">
            <img
              src="src/assets/dinosaur.png"
              alt="Dinosaur"
              className="dinosaur h-20"
            />
          </div>
        )}

        {/* Display PNR status or error message */}
        <div className="status">{status}</div>
      </div>
    </div>
  );
}

export default Querystatus;
