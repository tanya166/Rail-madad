import React, { useState } from 'react';
import axios from 'axios';
import './Querystatus.css';

function Querystatus() {
  const [pnr, setPnr] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Backend API URL
  const API_BASE_URL = 'http://localhost:8080';

  const handlePlayClick = async () => {
    // Validate PNR: must be 10 digits long and numeric
    if (pnr.length !== 10 || !/^\d+$/.test(pnr)) {
      setStatus("Enter a valid 10-digit PNR.");
      return;
    }

    setLoading(true);
    setShowAnimation(true);
    setStatus("");

    try {
      console.log('🔍 Fetching complaint status for PNR:', pnr);

      // Fetch complaints from Firebase via backend
      const response = await axios.get(`${API_BASE_URL}/complaints/${pnr}`, {
        timeout: 10000, // 10 second timeout
      });

      console.log('📊 Received response:', response.data);

      // Show animation for 3 seconds then display result
      setTimeout(() => {
        setShowAnimation(false);
        setLoading(false);
        
        if (response.data.complaints && response.data.complaints.length > 0) {
          const complaints = response.data.complaints;
          
          // Count status types
          const pendingCount = complaints.filter(c => c.status === 'Pending').length;
          const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
          
          // Create status message
          let statusMessage = `PNR ${pnr}: `;
          
          if (resolvedCount > 0 && pendingCount > 0) {
            statusMessage += `${resolvedCount} Resolved, ${pendingCount} Pending`;
          } else if (resolvedCount > 0) {
            statusMessage += `All ${resolvedCount} complaints Resolved ✅`;
          } else if (pendingCount > 0) {
            statusMessage += `${pendingCount} complaints Pending ⏳`;
          }
          
          setStatus(statusMessage);
        } else {
          setStatus(`No complaints found for PNR: ${pnr}`);
        }
      }, 3000);

    } catch (err) {
      console.error('❌ Error fetching complaints:', err);
      
      setTimeout(() => {
        setShowAnimation(false);
        setLoading(false);
        
        if (err.response && err.response.status === 404) {
          setStatus(`No complaints found for PNR: ${pnr}`);
        } else {
          let errorMessage = "Failed to fetch status. ";
          
          if (err.response) {
            errorMessage += err.response.data?.error || "Please try again.";
          } else if (err.request) {
            errorMessage += "Check your internet connection.";
          } else if (err.code === 'ECONNABORTED') {
            errorMessage += "Request timed out.";
          } else {
            errorMessage += "Please try again.";
          }
          
          setStatus(errorMessage);
        }
      }, 3000);
    }
  };

  return (
    <div className="container1">
      <img
        src="src/assets/waves1.png"
        alt="Train Image"
        className="train-image"
      />
      <div className="content1 mb-40">
        {/* PNR Input Section */}
        <div className="input-container flex items-center scale-105">
          <input
            type="text"
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
            placeholder="Enter Your PNR Number"
            className="pnr-input"
            disabled={loading}
            maxLength={10}
          />
          <div 
            className={`play-container ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`} 
            onClick={!loading ? handlePlayClick : undefined}
          >
            <span className="play-symbol h-4 w-4">
              {loading ? '⏳' : '▶'}
            </span>
          </div>
        </div>

        {/* Animation */}
        {showAnimation && (
          <div className="dinosaur-animation mt-20">
            <img
              src="src/assets/dinosaur.png"
              alt="Dinosaur"
              className="dinosaur h-20"
            />
          </div>
        )}

        {/* Status Display */}
        {status && !showAnimation && (
          <div className={`status ${
            status.includes('Resolved') ? 'text-green-400' : 
            status.includes('Pending') ? 'text-yellow-400' : 
            status.includes('No complaints') ? 'text-blue-400' :
            'text-red-400'
          }`}>
            {status}
          </div>
        )}

        {/* Loading message */}
        {loading && showAnimation && (
          <div className="text-center mt-4 text-white">
            <p>🔍 Checking complaint status in Firebase...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Querystatus;