import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logos.png';

const Navbar = () => {
  return (
    <nav className="navbar bg-gray-100 border-b-[0.5px] border-black">
      <div className="logo">
        <img src={logo} alt="" className='person' />
        <Link to="/" className="madad">Madad</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/complain">Post Your Complaint</Link></li>
        <li><Link to="/query">Query Status</Link></li>
        <li><Link to="/about">How We Help?</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;

