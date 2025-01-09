import React, { useEffect, useState } from "react";
import axios from "axios";
import './DataTable.css';

const DataTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Replace the URL with your API endpoint
        // axios.get("https://api.example.com/data")
        //     .then((response) => {
        //         setData(response.data); // Assuming the data is in response.data
        //         setLoading(false);
        //     })
        //     .catch((err) => {
        //         setError(err);
        //         setLoading(false);
        //     });

        setData(
            [
                {
                    "image": "src/assets/img-1.png",
                    "query": "Query 1",
                    "status": "Resolved"
                },
                {
                    "image": "src/assets/img-1.png",
                    "query": "Query 2",
                    "status": "Pending"
                },
                {
                    "image": "src/assets/img-1.png",
                    "query": "Query 3",
                    "status": "Resolved"
                },
                {
                    "image": "src/assets/img-1.png",
                    "query": "Query 4",
                    "status": "Resolved"
                },
                {
                    "image": "src/assets/logos.png",
                    "query": "Query 5",
                    "status": "Pending"
                },
                {
                    "image": "src/assets/img-1.png",
                    "query": "Query 6",
                    "status": "Pending"
                }
            ]
        )
    }, []);

    // if (loading) {
    //     return <div className="text-center">Loading...</div>;
    // }

    // if (error) {
    //     return <div className="text-center text-red-500">Error: {error.message}</div>;
    // }

    return (
        <div className="container mx-auto py-8">

            <div className="flex flex-col md:flex-row justify-between bg-gray-100 p-6 rounded-lg shadow-md mb-10">
                <div className="flex-1 text-center p-4 border-b md:border-b-0 md:border-r border-gray-300">
                    <h3 className="text-2xl font-bold text-gray-600 mt-4">Queries</h3>
                </div>
                <div className="flex-1 text-center p-4 border-b md:border-b-0 md:border-r border-gray-300">
                    <h3 className="text-lg font-semibold text-gray-600">Total queries</h3>
                    <p className="text-2xl font-bold">{'200'}</p>
                </div>
                <div className="flex-1 text-center p-4 border-b md:border-b-0 md:border-r border-gray-300">
                    <h3 className="text-lg font-semibold text-gray-600">Solved queries</h3>
                    <p className="text-2xl font-bold">{'48'}</p>
                </div>
                <div className="flex-1 text-center p-4 border-b md:border-b-0 md:border-r border-gray-300">
                    <h3 className="text-lg font-semibold text-gray-600">Your total queries</h3>
                    <p className="text-2xl font-bold">{'43'}</p>
                </div>
                <div className="flex-1 text-center p-4">
                    <h3 className="text-lg font-semibold text-gray-600">Your solved queries</h3>
                    <p className="text-2xl font-bold">{'355'}</p>
                </div>
            </div>


            {/* <h1 className="text-2xl font-bold text-center mb-6">QUERY STATUS</h1> */}
            <table className="min-w-full table-auto border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 border">No.</th>
                        <th className="px-4 py-2 border">Image</th>
                        <th className="px-4 py-2 border">Query</th>
                        <th className="px-4 py-2 border">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} className="bg-white border-b">
                            <td className="px-4 py-2 border text-center">{index + 1}</td>
                            <td className="px-4 py-2 border text-center">
                                <img src={item.image} alt="Data" className="w-20 h-20 object-cover mx-auto" />
                            </td>
                            <td className="px-4 py-2 border text-center">{item.query}</td>
                            <td className="px-4 py-2 border text-center">
                                <div className="flex items-center justify-center">
                                    {/* Blinking dot */}
                                    <span
                                        className={`h-3 w-3 rounded-full mr-2 ${item.status === 'Resolved'
                                            ? 'bg-green-500 blink'
                                            : item.status === 'Pending'
                                                ? 'bg-yellow-500 blink'
                                                : ''
                                            }`}
                                    ></span>
                                    {/* Status text */}
                                    <span className={`text-black font-bold`}>
                                        {item.status}
                                    </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;