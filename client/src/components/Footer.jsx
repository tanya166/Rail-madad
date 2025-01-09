import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/landingpage');
    window.scrollTo(0, 0); // Scroll to the top of the page
  };

  return (
    <div className="madad-railmadad border-t-stone-200 border-t-2">
      <div className="logo1">
        <div className='flex items-center gap-4 ml-4'>
          <img src="src/assets/madad-logo.jpg" alt="Madad logo" />
          <span className="madad-text">Madad</span>
        </div>
        <div className="platform">
          An online platform that allows railway passengers in India to register their complaints and seek assistance related to various railway services.
        </div>
      </div>
      <div className="madad">
        <div>
          <h3 className='font-bold'>RailMadad</h3>
        </div>
        <div className="links">
          <div>
            {/* Scroll to the top when Home is clicked */}
            <Link to="/" onClick={handleHomeClick}>Home</Link>
          </div>
          <div>
            <Link to="/about">Services</Link>
          </div>
        </div>
      </div>
      <div className="resources">
        <div>
          <h3 className='font-bold'>Resources</h3>
        </div>
        <div className="links">
          <div>
            <Link to="/complain">Add complaint</Link>
          </div>
          <div>
            <Link to="/queryresult">Know your query status</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;

