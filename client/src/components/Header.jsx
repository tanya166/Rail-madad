import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Button from './Button';
import circle from '../assets/circle.svg';
import person from '../assets/persons.svg';
import logos from '../assets/logos.svg';
import './Header.css';

function Header() {
    return (
        <header>
            <img src={circle} alt="" className='circle' />
            <img src={person} alt="" className='person' />
            <h1 className='H1'>Railway Enquiry</h1>
            <p className='T1'>An online platform that allows railway passengers in India to register their complaints and seek assistance related to various railway services.</p>
            <div className="buttons">
                {/* Add Link around the Add Complaint button */}
                <Link to="/complain">
                    <Button className='btn-header' text="Add complaint" color="#F68B43" />
                </Link>
                {/* Add Link around the More Info button */}
                <Link to="/about">
                    <Button text="More info" color='#ffff'/>
                </Link>
            </div>
            <img src={logos} alt="" className='logos1' /> {/* Logos are positioned at the bottom */}
        </header>
    );
}

export default Header;



