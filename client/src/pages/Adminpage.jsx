import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Adminpage = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch all queries from the API
        // axios.get('https://api.example.com/queries') // Replace with actual API
        //     .then(response => {
        //         setQueries(response.data); // Assuming the data is in response.data
        //         setLoading(false);
        //     })
        //     .catch(err => {
        //         setError(err);
        //         setLoading(false);
        //     });

        setQueries(
            [
                {
                    "id": 1,
                    "pnr": "ABC123",
                    "image": "src/assets/img-1.png",
                    "queryGenerated": "Why is my train delayed?",
                    "subject": "Train Delay",
                    "status": "Pending"
                },
                {
                    "id": 2,
                    "pnr": "XYZ789",
                    "image": "src/assets/img-1.png",
                    "queryGenerated": "Ticket not confirmed",
                    "subject": null,
                    "status": "Pending"
                },
                {
                    "id": 2,
                    "pnr": "XYZ789",
                    "image": "src/assets/img-1.png",
                    "queryGenerated": "Ticket not confirmed",
                    "subject": null,
                    "status": "Pending"
                }
            ]
        )
    }, []);

    // Handle status change by the admin
    const handleStatusChange = (index, newStatus) => {
        const updatedQueries = [...queries];
        updatedQueries[index].status = newStatus;
        setQueries(updatedQueries);

        // You can also make a POST or PUT request here to update the status on the server
        axios.post(`https://api.example.com/queries/${updatedQueries[index].id}/status`, {
            status: newStatus
        }).catch(err => {
            console.error("Failed to update status", err);
        });
    };

    // if (loading) return <div className="text-center">Loading...</div>;
    // if (error) return <div className="text-center text-red-500">Error: {error.message}</div>;

    return (
        <div className="container mx-auto py-8 min-h-[70vh]">
            <h1 className="text-2xl font-bold text-center mb-6">Admin Query Management</h1>
            <table className="min-w-full table-auto border-collapse border border-gray-400">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="px-4 py-2 border">Index</th>
                        <th className="px-4 py-2 border">PNR</th>
                        <th className="px-4 py-2 border">Image</th>
                        <th className="px-4 py-2 border">Query Generated</th>
                        <th className="px-4 py-2 border">Subject</th>
                        <th className="px-4 py-2 border">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {queries.map((query, index) => (
                        <tr key={query.id} className="bg-white border-b">
                            <td className="px-4 py-2 border text-center">{index + 1}</td>
                            <td className="px-4 py-2 border text-center">{query.pnr}</td>
                            <td className="px-4 py-2 border flex justify-center items-center">
                                <img src={query.image} alt="Query" className="w-20 h-20 object-cover" />
                            </td>
                            <td className="px-4 py-2 border">{query.queryGenerated}</td>
                            <td className="px-4 py-2 border">{query.subject || "N/A"}</td>
                            <td className="px-4 py-2 border text-center">
                                <select
                                    value={query.status}
                                    onChange={(e) => handleStatusChange(index, e.target.value)}
                                    className="px-2 py-1 bg-white border rounded focus:outline-none"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Adminpage;