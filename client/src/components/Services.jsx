import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Services.css';

import imagea from '../assets/img-1.svg';
import imageb from '../assets/img-2.svg';
import imagec from '../assets/img-3.svg';

function OurServices() {
  const navigate = useNavigate();

  const handleCardClick = (cardId) => {
    switch(cardId) {
      case 'feedback':
        navigate('/feedback');
        break;
      case 'query':
        navigate('/query');
        break;
      case 'complain':
        navigate('/complain');
        break;
      default:
        break;
    }
  };

  return (
    <div className="our-services">
      <h2 className='service-heading'>Our Services</h2>
      <p className='service-heading2'>We help you with all your issues</p>
      <div className="service-cards">
        {/* card1 */}
        <div className='card1 one' onClick={() => handleCardClick('feedback')} style={{cursor: 'pointer'}}>
          <div className="complaint-image5">
            <img src={imagea} alt="Complaint" />
          </div>
          <div className='head-1'>Feedback</div>
          <div className='desc1'>Provision for feedback on complaint resolution</div>
          <div className='explore'>Explore page</div>
        </div>
        {/* card2 */}
        <div className='card1' onClick={() => handleCardClick('query')} style={{cursor: 'pointer'}}>
          <div className="complaint-image5">
            <img src={imageb} alt="Complaint" />
          </div>
          <div className='head-1'>Know your query status</div>
          <div className='desc1'>Real-time tracking of complaint status</div>
          <div className='explore'>Explore page</div>
        </div>
        {/* card3 */}
        <div className='card3' onClick={() => handleCardClick('complain')} style={{cursor: 'pointer'}}>
          <div className="complaint-image5">
            <img src={imagec} alt="Complaint" />
          </div>
          <div className='head-1'>Customer support</div>
          <div className='desc1'>Chatbot for easy customer support</div>
          <div className='explore'>Explore page</div>
        </div>
      </div>
    </div>
  );
}

export default OurServices;