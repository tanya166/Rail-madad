import React, { useState } from 'react';
import axios from 'axios';
import './Form.css';
import complaintImage from '../assets/complaint-image.png';

function ComplaintForm() {
  const [pnr, setPnr] = useState('');
  const [subject, setSubject] = useState('');
  const [media, setMedia] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Backend API URL - adjust this to match your backend server
  const API_BASE_URL = 'http://localhost:8080'; // Change this to your backend URL

  const validateForm = () => {
    let formErrors = {};

    if (!pnr || !/^\d{10}$/.test(pnr)) {
      formErrors.pnr = 'PNR must be a 10-digit number';
    }

    if (!subject || subject.trim().length === 0) {
      formErrors.subject = 'Subject is required';
    }

    if (!media) {
      formErrors.media = 'Media upload is required';
    } else {
      // Validate image type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff'];
      if (!allowedTypes.includes(media.type)) {
        formErrors.media = 'Please upload a valid image file (JPEG, PNG, GIF, BMP, WebP, or TIFF)';
      }
      // Validate image size (20MB limit)
      else if (media.size > 20 * 1024 * 1024) {
        formErrors.media = 'Image size must be less than 20MB';
      }
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous states
    setSubmitSuccess(false);
    setSubmitError('');

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('pnr', pnr);
      formData.append('subject', subject.trim());
      formData.append('image', media); // The backend expects 'image' as the field name

      console.log('Submitting complaint:', {
        pnr,
        subject: subject.trim(),
        fileName: media.name,
        fileSize: `${(media.size / 1024 / 1024).toFixed(2)}MB`
      });

      // Send data to backend
      const response = await axios.post(`${API_BASE_URL}/submit-complaint`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for image processing
      });

      console.log('Complaint submitted successfully:', response.data);
      
      // Show success state
      setSubmitSuccess(true);
      setSubmitError('');

      // Reset form after successful submission
      setTimeout(() => {
        setPnr('');
        setSubject('');
        setMedia(null);
        setSubmitSuccess(false);
        // Reset file input
        const fileInput = document.getElementById('media');
        if (fileInput) {
          fileInput.value = '';
        }
      }, 3000);

    } catch (error) {
      console.error('Error submitting complaint:', error);
      
      let errorMessage = 'Failed to submit complaint. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        errorMessage = 'Request timed out. The image might be too large or processing is taking longer than expected.';
      }

      setSubmitError(errorMessage);
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMedia(file);
      
      // Clear any previous media error
      if (errors.media) {
        setErrors(prev => ({ ...prev, media: '' }));
      }
    }
  };

  return (
    <div className="complaint-container">
      <div className="complaint-form">
        <h1 className='complaint-heading text-[#0A2640]'>Raise a complaint</h1>
        
        {submitSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <strong>Success!</strong> Your complaint has been submitted successfully. 
            Our AI system has analyzed your image and generated a detailed description.
          </div>
        )}

        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="pnr">Enter your PNR</label>
            <input
              type="text"
              id="pnr"
              placeholder="PNR Number (10 digits)"
              value={pnr}
              onChange={(e) => setPnr(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.pnr && <span className="error red-text">{errors.pnr}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              placeholder="Describe your complaint in 20-30 words"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.subject && <span className="error red-text">{errors.subject}</span>}
          </div>

          <div className="form-group media-upload">
            <label htmlFor="media">Media</label>
            <div className="media-placeholder">
              <input
                type="file"
                id="media"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/webp,image/tiff"
                onChange={handleMediaUpload}
                style={{ display: 'none' }}
                disabled={isSubmitting}
              />
              <label htmlFor="media" style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                <span className="plus-icon">+</span>
                <p>
                  {media ? (
                    <>
                      {media.name}
                      <br />
                      <small>Size: {(media.size / 1024 / 1024).toFixed(2)}MB</small>
                    </>
                  ) : (
                    'Add media (required) - Max 20MB'
                  )}
                </p>
              </label>
            </div>
            {errors.media && <span className="error red-text">{errors.media}</span>}
          </div>

          <div className='flex justify-center'>
            <button 
              type="submit" 
              className={`submit-button ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Processing...
                </>
              ) : (
                'Submit Complaint'
              )}
            </button>
          </div>

          {isSubmitting && (
            <div className="text-center mt-4 text-gray-600">
              <p>🤖 AI is analyzing your image and generating description...</p>
              <p className="text-sm">This may take 10-30 seconds depending on image complexity.</p>
            </div>
          )}
        </form>
      </div>

      <div className="complaint-image">
        <img src={complaintImage} alt="Complaint" />
      </div>
    </div>
  );
}

export default ComplaintForm;