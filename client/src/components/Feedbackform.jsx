import React from 'react';
import bgImage from '../assets/bgimg.svg';
import './Feedbackform.css'; // Assuming we'll create a separate CSS file

const Feedbackform = () => {
  return (
    <div className="feedback-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="content">
        <h1 className="title">Feedback</h1>
        <p className="description">
          An online platform that allows railway passengers in India to register their
        </p>
        <form className="form">
          <label htmlFor="message" className="label">Message</label>
          <textarea id="message" className="textarea" rows={4} />
          <button type="submit" className="submit-button">Submit Feedback</button>
        </form>
      </div>
    </div>
  );
};
export default Feedbackform;