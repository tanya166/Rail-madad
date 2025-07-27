import React from 'react';
import './Help.css';

// Import all images as modules
import ticketsImage from '../assets/tickets.png';
import tickMarkImage from '../assets/Group 210.png';
import vector1Image from '../assets/Vector1.png';
import starImage from '../assets/star.png';
import vector2Image from '../assets/Vector2.png';
import chatbotImage from '../assets/chatbot.png';

const Help = () => {
    return (
        <div className="homepage">
            <div className="hero">
                <div className="hero-image">
                    <img src={ticketsImage} alt="Hero Image" className="hero-image" />
                </div>
                
                <div className="hero-content items-center">
                    <h2 className='mb-10 font-semibold text-xl text-wrap'>We connect our customers with the best, and help them keep up-and-stay open.</h2>
                    <div className='tick justify-center'>
                        <div className="tick-mark"><img src={tickMarkImage} alt="tick" />We care about our customers.</div>
                        <div className="tick-mark"><img src={tickMarkImage} alt="tick" />Guiding users through the complaint registration process.</div>
                        <div className="tick-mark"><img src={tickMarkImage} alt="tick" />We make the user complaint process easy.</div>
                    </div>
                </div>
            </div>
            
            <div className="chatbot mx-auto flex justify-center items-center">
                <div className="chatbot-content">
                    <h2 className='text-xl font-semibold'>Our chatbot provides instant, 24/7 support. It aims to improve your experience with Indian Railways' customer service.</h2>
                    <div className="box">
                        <div className="box-mark1"><img src={vector1Image} alt="vector" />Providing instant responses to common queries.</div>
                        <div className="box-mark"><img src={starImage} alt="star" />Offering 24/7 assistance to passengers.</div>
                        <div className="box-mark"><img src={vector2Image} alt="vector" />Answering frequently asked questions about railway services.</div>
                    </div>
                </div>
                <div className="chatbot-image mx-auto w-fit">
                    <img src={chatbotImage} alt="Chatbot Image" className="chatbot-image" />
                </div>
            </div>
        </div>
    );
};

export default Help;