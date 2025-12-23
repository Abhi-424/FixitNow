import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const ProviderDashboard = () => {
  const { user } = useAuth();
  
  // Dummy Data
  const [requests, setRequests] = useState([
    { id: 1, user: "Alice Johnson", service: "Leaky Faucet Repair", location: "123 Maple St", date: "Today, 2:00 PM" },
    { id: 2, user: "Sarah Connor", service: "Pipe Replacement", location: "456 Oak Ave", date: "Tomorrow, 10:00 AM" },
  ]);

  const [activeJobs, setActiveJobs] = useState([
    { id: 101, user: "John Doe", service: "Bathroom Fitting", location: "789 Pine Ln", status: "In Progress" },
  ]);

  const handleAccept = (id) => {
    alert(`Accepted request #${id}`);
  };

  const handleReject = (id) => {
    setRequests(requests.filter(req => req.id !== id));
  };

  return (
    <div className="min-h-screen bg-blue-50 font-sans text-gray-800 pt-20">
      
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
             <div className="mb-4 md:mb-0">
               <h1 className="text-3xl font-bold text-blue-900">Provider Dashboard</h1>
               <p className="text-gray-500">Welcome back, {user?.name || user?.username || 'Provider'}</p>
             </div>
             <div className="flex space-x-4">
               <div className="text-right">
                  <p className="text-sm text-gray-500">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">$1,250.00</p>
               </div>
             </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
             <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center">
                   <div>
                      <p className="text-blue-200 text-sm font-medium">New Requests</p>
                      <h3 className="text-3xl font-bold">{requests.length}</h3>
                   </div>
                   <div className="bg-blue-500 p-3 rounded-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                   </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <div className="flex justify-between items-center">
                   <div>
                      <p className="text-gray-500 text-sm font-medium">Active Jobs</p>
                      <h3 className="text-3xl font-bold text-blue-900">{activeJobs.length}</h3>
                   </div>
                   <div className="bg-orange-100 p-3 rounded-lg">
                      <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                   </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <div className="flex justify-between items-center">
                   <div>
                      <p className="text-gray-500 text-sm font-medium">Jobs Completed</p>
                      <h3 className="text-3xl font-bold text-blue-900">45</h3>
                   </div>
                   <div className="bg-green-100 p-3 rounded-lg">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           
           {/* Incoming Requests */}
           <div>
              <h2 className="text-xl font-bold text-blue-900 mb-6">Incoming Requests</h2>
              {requests.length > 0 ? (
                 <div className="space-y-4">
                    {requests.map((req) => (
                       <div key={req.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:border-blue-300 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <h3 className="font-bold text-lg text-blue-900">{req.service}</h3>
                                <p className="text-gray-600 text-sm">{req.user}</p>
                             </div>
                             <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded font-bold">New</span>
                          </div>
                          
                          <div className="flex items-center text-gray-500 text-sm mb-2">
                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                             {req.location}
                          </div>
                          <div className="flex items-center text-gray-500 text-sm mb-6">
                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             {req.date}
                          </div>

                          <div className="flex space-x-3">
                             <button 
                               onClick={() => handleAccept(req.id)}
                               className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition"
                             >
                                Accept
                             </button>
                             <button 
                               onClick={() => handleReject(req.id)}
                               className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2 rounded-lg transition"
                             >
                                Decline
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="text-center py-10 bg-white rounded-xl shadow border border-gray-100">
                    <p className="text-gray-500">No new requests.</p>
                 </div>
              )}
           </div>

           {/* Active Jobs */}
           <div>
              <h2 className="text-xl font-bold text-blue-900 mb-6">Active Jobs</h2>
              {activeJobs.length > 0 ? (
                 <div className="space-y-4">
                    {activeJobs.map((job) => (
                       <div key={job.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <h3 className="font-bold text-lg text-blue-900">{job.service}</h3>
                                <p className="text-gray-600 text-sm">{job.user}</p>
                             </div>
                             <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded font-bold">In Progress</span>
                          </div>
                          
                          <div className="flex items-center text-gray-500 text-sm mb-2">
                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                             {job.location}
                          </div>

                          <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-lg transition text-sm">
                             View Details
                          </button>
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="text-center py-10 bg-white rounded-xl shadow border border-gray-100">
                    <p className="text-gray-500">No active jobs.</p>
                 </div>
              )}
           </div>

        </div>

      </main>
    </div>
  );
};

export default ProviderDashboard;
