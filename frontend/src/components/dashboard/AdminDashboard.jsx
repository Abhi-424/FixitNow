import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
   const { user } = useAuth();
   const [activeTab, setActiveTab] = useState("overview");
   const [stats, setStats] = useState({
      users: 0,
      providers: 0,
      bookings: 0
   });
   const [users, setUsers] = useState([]);
   const [providers, setProviders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Stats
            const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers });
            const statsData = await statsRes.json();
            if (statsRes.ok) {
               setStats(statsData);
            } else {
               console.error("Failed to fetch stats", statsData);
            }

            // Fetch Users
            const usersRes = await fetch('http://localhost:5000/api/admin/users', { headers });
            const usersData = await usersRes.json();
            if (usersRes.ok) {
               setUsers(usersData);
            } else {
               console.error("Failed to fetch users", usersData);
            }

            // Fetch Providers
            const providersRes = await fetch('http://localhost:5000/api/admin/providers', { headers });
            const providersData = await providersRes.json();
            if (providersRes.ok) {
               setProviders(providersData);
            } else {
               console.error("Failed to fetch providers", providersData);
            }

         } catch (err) {
            console.error("Error fetching admin data:", err);
            setError("Failed to load dashboard data.");
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, []);

   const handleStatusUpdate = async (userId, newStatus) => {
      try {
         const token = localStorage.getItem('token');
         const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
         });

         if (res.ok) {
            // Optimistic UI update
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
            setProviders(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
         } else {
            alert("Failed to update status");
         }
      } catch (err) {
         console.error(err);
         alert("Error updating status");
      }
   };

   const statCards = [
      { title: "Total Users", value: stats.users, icon: "Users", color: "blue" },
      { title: "Service Providers", value: stats.providers, icon: "Briefcase", color: "orange" },
      { title: "Total Bookings", value: stats.bookings, icon: "Calendar", color: "blue" },
   ];

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <div className="text-blue-900 font-bold text-xl">Loading Dashboard...</div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <div className="text-red-500 font-bold text-xl">{error}</div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-blue-50 font-sans text-gray-800 pt-20">

         {/* Dashboard Header */}
         <header className="bg-white shadow-sm border-b border-gray-200 py-6">
            <div className="container mx-auto px-6 flex justify-between items-center">
               <div>
                  <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
                  <p className="text-gray-500 text-sm">Welcome back, {user?.username || user?.email || 'Administrator'}</p>
               </div>
               <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium">
                  Download Report
               </button>
            </div>
         </header>

         <main className="container mx-auto px-6 py-10">

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               {statCards.map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center">
                     <div className={`w-14 h-14 rounded-full flex items-center justify-center mr-4 ${stat.color === 'orange' ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-600'}`}>
                        {/* Icons based on type */}
                        {stat.icon === "Users" && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                        {stat.icon === "Briefcase" && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                        {stat.icon === "Calendar" && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                     </div>
                     <div>
                        <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                        <h3 className="text-2xl font-bold text-blue-900">{stat.value}</h3>
                     </div>
                  </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

               {/* User Management Table */}
               <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                     <h2 className="text-xl font-bold text-blue-900">Recent Users</h2>
                     <Link to="#" className="text-orange-500 font-medium hover:underline text-sm">View All</Link>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-blue-50 text-blue-900 font-bold uppercase text-xs">
                           <tr>
                              <th className="px-6 py-4">Name</th>
                              <th className="px-6 py-4">Role</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {users.length > 0 ? users.slice(0, 5).map((u) => (
                              <tr key={u._id} className="hover:bg-gray-50">
                                 <td className="px-6 py-4">
                                    <p className="font-bold text-gray-800">{u.username}</p>
                                    <p className="text-xs text-gray-500">{u.email}</p>
                                 </td>
                                 <td className="px-6 py-4 text-sm text-gray-600">{u.role}</td>
                                 <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.status === 'Active' ? 'bg-green-100 text-green-700' :
                                          u.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                             u.status === 'Blocked' ? 'bg-red-100 text-red-600' : 'bg-gray-100'
                                       }`}>
                                       {u.status}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4">
                                    {u.status === 'Blocked' ? (
                                       <button onClick={() => handleStatusUpdate(u._id, 'Active')} className="text-green-500 hover:text-green-700 font-medium text-sm">Unblock</button>
                                    ) : (
                                       <button onClick={() => handleStatusUpdate(u._id, 'Blocked')} className="text-red-500 hover:text-red-700 font-medium text-sm">Block</button>
                                    )}
                                 </td>
                              </tr>
                           )) : (
                              <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No users found</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Provider Management Table */}
               <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                     <h2 className="text-xl font-bold text-blue-900">Service Providers</h2>
                     <Link to="#" className="text-orange-500 font-medium hover:underline text-sm">View All</Link>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-blue-50 text-blue-900 font-bold uppercase text-xs">
                           <tr>
                              <th className="px-6 py-4">Provider</th>
                              <th className="px-6 py-4">Location</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {providers.length > 0 ? providers.slice(0, 5).map((provider) => (
                              <tr key={provider._id} className="hover:bg-gray-50">
                                 <td className="px-6 py-4 font-bold text-gray-800">{provider.username}</td>
                                 <td className="px-6 py-4 text-sm text-gray-600">{provider.location || 'N/A'}</td>
                                 <td className="px-6 py-4 text-sm font-bold">
                                    <span className={`px-2 py-1 rounded text-xs ${provider.status === 'Verified' ? 'bg-green-100 text-green-700' :
                                          provider.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100'
                                       }`}>
                                       {provider.status}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 flex gap-2">
                                    {provider.status === "Pending" ? (
                                       <>
                                          <button onClick={() => handleStatusUpdate(provider._id, 'Verified')} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">Approve</button>
                                          <button onClick={() => handleStatusUpdate(provider._id, 'Blocked')} className="px-3 py-1 border border-orange-500 text-orange-500 text-xs font-bold rounded hover:bg-orange-50">Reject</button>
                                       </>
                                    ) : (
                                       <span className="text-sm text-gray-400 italic">Action Taken</span>
                                    )}
                                 </td>
                              </tr>
                           )) : (
                              <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No providers found</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>

            </div>

            {/* Analytics Section */}
            <div className="mt-10 bg-white p-8 rounded-xl shadow-md border border-gray-100">
               <h2 className="text-xl font-bold text-blue-900 mb-6">Platform Growth</h2>
               <div className="flex items-end space-x-4 h-48">
                  {/* Dummy Bars - In a real app, this should also be driven by API */}
                  {[40, 65, 50, 80, 55, 90, 70, 100, 85, 60, 75, 95].map((height, i) => (
                     <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer">
                        <div
                           className="w-full bg-blue-100 rounded-t-lg group-hover:bg-orange-400 transition-all duration-300 relative"
                           style={{ height: `${height}%` }}
                        >
                           <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition">
                              {height * 10} Tests
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
               <div className="flex justify-between mt-4 text-gray-400 text-xs uppercase font-bold tracking-wider">
                  <span>Jan</span><span>Dec</span>
               </div>
            </div>

         </main>
      </div>
   );
};

export default AdminDashboard;
