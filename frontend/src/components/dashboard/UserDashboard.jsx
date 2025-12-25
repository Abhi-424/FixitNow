import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Loader from "../common/Loader";

const UserDashboard = () => {
   const { user } = useAuth();

   // State management
   const [bookings, setBookings] = useState([]);
   const [stats, setStats] = useState({
      totalBookings: 0,
      activeServices: 0,
      completed: 0
   });
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // Fetch user bookings on component mount
   useEffect(() => {
      const fetchBookings = async () => {
         try {
            setLoading(true);
            setError(null);

            const response = await api.get('/bookings');
            const fetchedBookings = response.data;

            setBookings(fetchedBookings);

            // Calculate stats from fetched bookings
            const totalBookings = fetchedBookings.length;
            const activeServices = fetchedBookings.filter(
               b => b.status === 'In Progress'
            ).length;
            const completed = fetchedBookings.filter(
               b => b.status === 'Completed'
            ).length;

            setStats({
               totalBookings,
               activeServices,
               completed
            });

         } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Failed to load dashboard data. Please try again later.');
         } finally {
            setLoading(false);
         }
      };

      fetchBookings();
   }, []);

   // Handle confirming completion
   const handleConfirmCompletion = async (bookingId) => {
      try {
         await api.patch(`/bookings/${bookingId}/status`, { status: 'Completed' });

         // Update local state
         setBookings(prev => prev.map(b =>
            b._id === bookingId ? { ...b, status: 'Completed' } : b
         ));

         // Update stats locally (simple increment)
         setStats(prev => ({
            ...prev,
            activeServices: prev.activeServices > 0 ? prev.activeServices - 1 : 0,
            completed: prev.completed + 1
         }));

      } catch (err) {
         console.error("Failed to confirm:", err);
         alert(err.response?.data?.message || "Failed to confirm completion");
      }
   };

   // Format date for display
   const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
         month: 'short',
         day: 'numeric',
         year: 'numeric'
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
                     <h1 className="text-3xl font-bold text-blue-900">User Dashboard</h1>
                     <p className="text-gray-500">Welcome back, {user?.name || user?.username || 'User'}</p>
                  </div>
                  <Link to="/services">
                     <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-md transition transform hover:scale-105">
                        Book New Service
                     </button>
                  </Link>
               </div>

               {/* Stats Cards */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center">
                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                     </div>
                     <div>
                        <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                        <h3 className="text-2xl font-bold text-blue-900">{stats.totalBookings}</h3>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center">
                     <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4 text-orange-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <div>
                        <p className="text-gray-500 text-sm font-medium">Active Services</p>
                        <h3 className="text-2xl font-bold text-blue-900">{stats.activeServices}</h3>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center">
                     <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 text-green-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <div>
                        <p className="text-gray-500 text-sm font-medium">Completed</p>
                        <h3 className="text-2xl font-bold text-blue-900">{stats.completed}</h3>
                     </div>
                  </div>
               </div>
            </div>
         </header>

         <main className="container mx-auto px-6 py-10">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

               {/* My Bookings Table */}
               <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                     <h2 className="text-xl font-bold text-blue-900">Recent Bookings</h2>
                     <Link to="/services" className="text-orange-500 font-medium hover:underline text-sm">View All</Link>
                  </div>
                  <div className="overflow-x-auto">
                     {bookings.length > 0 ? (
                        <table className="w-full text-left">
                           <thead className="bg-blue-50 text-blue-900 font-bold uppercase text-xs">
                              <tr>
                                 <th className="px-6 py-4">Service</th>
                                 <th className="px-6 py-4">Provider</th>
                                 <th className="px-6 py-4">Date</th>
                                 <th className="px-6 py-4">Status</th>
                                 <th className="px-6 py-4">Amount</th>
                                 <th className="px-6 py-4">Action</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                              {bookings.slice(0, 5).map((booking) => (
                                 <tr key={booking._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-gray-800">{booking.service}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                       {booking.provider?.username || 'Not Assigned'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                       {formatDate(booking.scheduledDate)}
                                    </td>
                                    <td className="px-6 py-4">
                                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                             booking.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                                                booking.status === 'Waiting for Confirmation' ? 'bg-yellow-100 text-yellow-700' :
                                                   booking.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                                      'bg-orange-100 text-orange-600'
                                          }`}>
                                          {booking.status}
                                       </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">
                                       ${booking.amount || 0}
                                    </td>
                                    <td className="px-6 py-4">
                                       {booking.status === 'Waiting for Confirmation' && (
                                          <button
                                             onClick={() => handleConfirmCompletion(booking._id)}
                                             className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded shadow transition"
                                          >
                                             Confirm Done
                                          </button>
                                       )}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     ) : (
                        <div className="text-center py-12">
                           <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                           </svg>
                           <p className="text-gray-500 font-medium">No bookings yet</p>
                           <p className="text-gray-400 text-sm mt-2">Book your first service to get started!</p>
                           <Link to="/services">
                              <button className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition">
                                 Browse Services
                              </button>
                           </Link>
                        </div>
                     )}
                  </div>
               </div>

               {/* Quick Actions & Recent Activity */}
               <div className="space-y-6">

                  {/* Profile Card */}
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                     <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold text-2xl">
                           {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-blue-900">{user?.name || user?.username || 'User'}</h3>
                           <p className="text-sm text-gray-500">
                              {stats.totalBookings > 10 ? 'Gold Member' : 'Standard Member'}
                           </p>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-600 font-medium transition">
                           Edit Profile
                        </button>
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-600 font-medium transition">
                           Payment Methods
                        </button>
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-600 font-medium transition">
                           Settings
                        </button>
                     </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                     <h3 className="text-lg font-bold text-blue-900 mb-4">Recent Activity</h3>
                     {bookings.length > 0 ? (
                        <ul className="space-y-4">
                           {bookings.slice(0, 3).map((booking) => (
                              <li key={booking._id} className="flex items-start">
                                 <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${booking.status === 'Completed' ? 'bg-green-500' :
                                    booking.status === 'In Progress' ? 'bg-blue-500' : 'bg-orange-500'
                                    }`}></div>
                                 <div>
                                    <p className="text-sm text-gray-800">
                                       {booking.status === 'Completed' ? 'Booking completed' :
                                          booking.status === 'In Progress' ? 'Service in progress' :
                                             'New booking created'} - {booking.service}
                                    </p>
                                    <p className="text-xs text-gray-400">{formatDate(booking.createdAt)}</p>
                                 </div>
                              </li>
                           ))}
                        </ul>
                     ) : (
                        <p className="text-gray-500 text-sm">No recent activity</p>
                     )}
                  </div>

               </div>

            </div>
         </main>
      </div>
   );
};

export default UserDashboard;
