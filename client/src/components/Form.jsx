import React, { useState } from 'react';
import './Form.css';
import complaintImage from '../assets/complaint-image.png';
import train from '../assets/train.jpg';

function ComplaintForm() {
  const [pnr, setPnr] = useState('');
  const [subject, setSubject] = useState('');
  const [media, setMedia] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let formErrors = {};

    if (!pnr || !/^\d{10}$/.test(pnr)) {
      formErrors.pnr = 'PNR must be a 10-digit number';
    }

    if (!subject) {
      formErrors.subject = 'Subject is required';
    }

    if (!media) {
      formErrors.media = 'Media upload is required';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Form is valid, proceed with submission
      console.log('Form submitted:', { pnr, subject, media });
    } else {
      console.log('Form has errors');
    }
  };

  const handleMediaUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
    }
  };

  return (

    <div className="complaint-container">
      <div className="complaint-form">
        <h1 className='complaint-heading text-[#0A2640]'>Raise a complaint</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="pnr">Enter your PNR</label>
            <input
              type="text"
              id="pnr"
              placeholder="PNR Number"
              value={pnr}
              onChange={(e) => setPnr(e.target.value)}
            />
            {errors.pnr && <span className="error red-text">{errors.pnr}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              placeholder="20-30 words"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            {errors.subject && <span className="error red-text">{errors.subject}</span>}
          </div>

          <div className="form-group media-upload">
            <label htmlFor="media">Media</label>
            <div className="media-placeholder">
              <input
                type="file"
                id="media"
                onChange={handleMediaUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="media">
                <span className="plus-icon">+</span>
                <p>{media ? media.name : 'Add media (required)'}</p>
              </label>
            </div>
            {errors.media && <span className="error red-text">{errors.media}</span>}
          </div>

          <div className='flex justify-center'>
            <button type="submit" className='submit-button'>Submit Complaint</button>
          </div>
        </form>
      </div>

      <div className="complaint-image">
        <img src={complaintImage} alt="Complaint" />
      </div>
    </div>

  );
}

export default ComplaintForm;