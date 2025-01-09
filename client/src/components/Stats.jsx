import React, { useState, useEffect } from 'react';
import './Stats.css';

const Stats = () => {
    const [complaints, setComplaints] = useState(0);
    const [complaintsSolved, setComplaintsSolved] = useState(0);
    const [feedbacks, setFeedbacks] = useState(0);

    useEffect(() => {
        const targetComplaints = 800;
        const targetComplaintsSolved = 700;
        const targetFeedbacks = 240;

        const animationDuration = 2000; // Total animation duration (in ms)
        const steps = targetComplaints + targetComplaintsSolved + targetFeedbacks;
        const stepTime = animationDuration / steps; // Time per increment

        const intervalId = setInterval(() => {
            setComplaints((prev) => (prev < targetComplaints ? prev + 1 : prev));
            setComplaintsSolved((prev) => (prev < targetComplaintsSolved ? prev + 1 : prev));
            setFeedbacks((prev) => (prev < targetFeedbacks ? prev + 1 : prev));

            if (complaints >= targetComplaints && complaintsSolved >= targetComplaintsSolved && feedbacks >= targetFeedbacks) {
                clearInterval(intervalId);
            }
        }, stepTime);

        return () => clearInterval(intervalId);
    }, [complaints, complaintsSolved, feedbacks]);

    return (
        <div className="numbers-component">
            <p className="numb">Our numbers</p>
            <div className="numbers-how">How much have we helped?</div>
            <div className="numbers">
                <div className="number">
                    {complaints}+
                    <span>Complaints</span>
                </div>
                <div className="number">
                    {complaintsSolved}+
                    <span>Complaints solved</span>
                </div>
                <div className="number">
                    {feedbacks}
                    <span>Feedbacks</span>
                </div>
            </div>
        </div>
    );
};

export default Stats;