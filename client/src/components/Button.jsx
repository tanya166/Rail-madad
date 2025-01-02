import React from 'react';

function Button({ text, color }) {
    const buttonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 56px',
        borderRadius: '56px',
        backgroundColor: color,
        color: color === '#1169fe' ? '#ffffff' : '#0a2640',
        fontWeight: 700,
        fontSize: '20px',
        // border: color === '#1169fe' ? '2px solid #ffffff' : '2px solid #69e6a6'
    };

    return (
        <button style={buttonStyle}>{text}</button>
    )
}

export default Button;
