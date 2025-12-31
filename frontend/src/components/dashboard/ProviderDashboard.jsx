import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Loader from "../common/Loader";

const ProviderDashboard = () => {
   const { user } = useAuth();

   // State management
   const [requests, setRequests] = useState([]);
   const [activeJobs, setActiveJobs] = useState([]);
   const [stats, setStats] = useState({
      earnings: 0,
      completedJobs: 0
   });
   const [unreadCount, setUnreadCount] = useState(0);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // Fetch provider bookings on component mount & poll
   useEffect(() => {
      fetchProviderBookings();
      const interval = setInterval(fetchProviderBookings, 10000); // Poll every 10s
      return () => clearInterval(interval);
   }, []);

   // Handle Notification Click
   const handleNotificationClick = async () => {
      if (unreadCount === 0) return;
      try {
         await api.patch('/bookings/notifications/read');
         setUnreadCount(0);
         // Rely on next poll for full refresh or detailed update?
         // For now, simpler to just reset badge. Real refresh happens via poll or manual status updates.
      } catch (err) {
         console.error("Failed to mark read:", err);
      }
   };

   const fetchProviderBookings = async () => {
      try {
         // setLoading(true); // Don't reset loading on poll if already loaded
         // if (requests.length === 0 && activeJobs.length === 0) setLoading(true); // Removed to prevent reloading flicker
         setError(null);

         const response = await api.get('/bookings/provider');
         const bookings = response.data;

         setUnreadCount(bookings.filter(b => !b.providerHasSeen).length);

         // Separate bookings into requests (Pending/Auto-Assigned) and active jobs
         const pendingRequests = bookings.filter(b => b.status === 'Pending' || b.status === 'Auto-Assigned');
         // Active jobs include Accepted, In Progress, Waiting, and Completed (for logic)
         // But usually Completed are separate. Let's keep Active as non-final ones.
         const inProgressJobs = bookings.filter(b =>
            ['Accepted', 'In Progress', 'Waiting for Confirmation'].includes(b.status)
         );
         const completedJobs = bookings.filter(b => b.status === 'Completed');

         setRequests(pendingRequests);
         setActiveJobs(inProgressJobs);

         // Calculate stats
         const totalEarnings = completedJobs.reduce((sum, booking) => sum + (booking.amount || 0), 0);
         setStats({
            earnings: totalEarnings,
            completedJobs: completedJobs.length
         });

      } catch (err) {
         console.error('Error fetching provider bookings:', err);
         setError('Failed to load dashboard data. Please try again later.');
      } finally {
         setLoading(false);
      }
   };

   // Handle status updates
   const handleStatusUpdate = async (bookingId, newStatus) => {
      try {
         await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
         fetchProviderBookings();
      } catch (err) {
         console.error("Failed to update status:", err);
         alert(err.response?.data?.message || "Failed to update status");
      }
   };

   // Helper to render action button based on status
   const renderActionButton = (booking) => {
      switch (booking.status) {
         case 'Pending':
         case 'Auto-Assigned':
            return (
               <div className="flex gap-2">
                  <button
                     onClick={() => handleStatusUpdate(booking._id, 'Accepted')}
                     className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition"
                  >
                     Accept
                  </button>
                  <button
                     onClick={() => handleStatusUpdate(booking._id, 'Declined')}
                     className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition"
                  >
                     Decline
                  </button>
               </div>
            );
         case 'Accepted':
            return (
               <button
                  onClick={() => handleStatusUpdate(booking._id, 'In Progress')}
                  className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition"
               >
                  Start Job
               </button>
            );
         case 'In Progress':
            return (
               <button
                  onClick={() => handleStatusUpdate(booking._id, 'Waiting for Confirmation')}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition"
               >
                  Mark as Completed
               </button>
            );
         case 'Waiting for Confirmation':
            return (
               <span className="text-sm text-gray-500 font-medium italic block text-center">
                  Waiting for User Confirmation...
               </span>
            );
         case 'Completed':
            return (
               <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  Finished
               </span>
            );
         default:
            return null;
      }
   };

   // Format date for display
   const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
         month: 'short',
         day: 'numeric',
         hour: 'numeric',
         minute: '2-digit'
      });
   };

   // Show loading state
   if (loading) {
      return (
         <div className="min-h-screen bg-blue-50 pt-20 flex items-center justify-center">
            <Loader size="lg" message="Loading your dashboard..." fullScreen={false} />
         </div>
      );
   }

   // Show error state
   if (error) {
      return (
         <div className="min-h-screen bg-blue-50 pt-20 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-md border border-red-200 max-w-md">
               <div className="text-center">
                  <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                     onClick={() => window.location.reload()}
                     className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                  >
                     Retry
                  </button>
               </div>
            </div>
         </div>
      );
   }

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
                  <div className="flex items-center space-x-6">
                     {/* Bell Icon */}
                     <div className="relative cursor-pointer" onClick={handleNotificationClick}>
                        <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        {unreadCount > 0 && (
                           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                              {unreadCount}
                           </span>
                        )}
                     </div>

                     <div className="text-right">
                        <p className="text-sm text-gray-500">Total Earnings</p>
                        <p className="text-2xl font-bold text-green-600">${stats.earnings.toFixed(2)}</p>
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
                           <h3 className="text-3xl font-bold text-blue-900">{stats.completedJobs}</h3>
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
                           <div key={req._id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:border-blue-300 transition-colors">
                              <div className="flex justify-between items-start mb-4">
                                 <div>
                                    <h3 className="font-bold text-lg text-blue-900">{req.service}</h3>
                                    <p className="text-gray-600 text-sm">{req.user?.username || 'Unknown User'}</p>
                                 </div>
                                 <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded font-bold">New</span>
                              </div>

                              {req.description && (
                                 <p className="text-gray-600 text-sm mb-3">{req.description}</p>
                              )}

                              <div className="flex items-center text-gray-500 text-sm mb-2">
                                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                 {typeof req.location === 'object' ? req.location.address : req.location}
                              </div>
                              <div className="flex items-center text-gray-500 text-sm mb-6">
                                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                 {formatDate(req.scheduledDate)}
                              </div>

                              <div className="mt-4">
                                 {renderActionButton(req)}
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-10 bg-white rounded-xl shadow border border-gray-100">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-500 font-medium">No new requests</p>
                        <p className="text-gray-400 text-sm mt-2">Check back later for service requests</p>
                     </div>
                  )}
               </div>

               {/* Active Jobs */}
               <div>
                  <h2 className="text-xl font-bold text-blue-900 mb-6">Active Jobs</h2>
                  {activeJobs.length > 0 ? (
                     <div className="space-y-4">
                        {activeJobs.map((job) => (
                           <div key={job._id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
                              <div className="flex justify-between items-start mb-4">
                                 <div>
                                    <h3 className="font-bold text-lg text-blue-900">{job.service}</h3>
                                    <p className="text-gray-600 text-sm">{job.user?.username || 'Unknown User'}</p>
                                 </div>
                                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${job.status === 'In Progress' ? 'bg-orange-100 text-orange-600' :
                                    job.status === 'Accepted' ? 'bg-blue-100 text-blue-600' :
                                       'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {job.status}
                                 </span>
                              </div>

                              {job.description && (
                                 <p className="text-gray-600 text-sm mb-3">{job.description}</p>
                              )}

                              <div className="flex items-center text-gray-500 text-sm mb-2">
                                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                 {typeof job.location === 'object' ? job.location.address : job.location}
                              </div>

                              <div className="mt-4">
                                 {renderActionButton(job)}
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-10 bg-white rounded-xl shadow border border-gray-100">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-500 font-medium">No active jobs</p>
                        <p className="text-gray-400 text-sm mt-2">Accept requests to start working</p>
                     </div>
                  )}
               </div>

            </div>

         </main>
      </div>
   );
};

export default ProviderDashboard;
