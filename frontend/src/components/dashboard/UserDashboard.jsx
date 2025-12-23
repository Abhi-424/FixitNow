import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const UserDashboard = () => {
  const { user } = useAuth();
  
  // Dummy Data
  const bookings = [
    { id: 1, service: "Plumbing Repair", provider: "Mike The Plumber", date: "Oct 24, 2025", status: "Completed", amount: "$80" },
    { id: 2, service: "AC Servicing", provider: "Cool Air Pros", date: "Nov 02, 2025", status: "In Progress", amount: "$120" },
    { id: 3, service: "Home Cleaning", provider: "Sparkle Clean", date: "Nov 10, 2025", status: "Pending", amount: "$60" },
  ];

  return (
    <div className="min-h-screen bg-blue-50 font-sans text-gray-800 pt-20">
      
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
             <div className="mb-4 md:mb-0">
               <h1 className="text-3xl font-bold text-blue-900">User Dashboard</h1>
               <p className="text-gray-500">Welcome back, {user?.name || user?.username|| 'User'}</p>
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
                   <h3 className="text-2xl font-bold text-blue-900">12</h3>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4 text-orange-500">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                   <p className="text-gray-500 text-sm font-medium">Active Services</p>
                   <h3 className="text-2xl font-bold text-blue-900">2</h3>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 text-green-500">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                   <p className="text-gray-500 text-sm font-medium">Completed</p>
                   <h3 className="text-2xl font-bold text-blue-900">10</h3>
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
                <table className="w-full text-left">
                   <thead className="bg-blue-50 text-blue-900 font-bold uppercase text-xs">
                      <tr>
                         <th className="px-6 py-4">Service</th>
                         <th className="px-6 py-4">Provider</th>
                         <th className="px-6 py-4">Date</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {bookings.map((booking) => (
                         <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-bold text-gray-800">{booking.service}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{booking.provider}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{booking.date}</td>
                            <td className="px-6 py-4">
                               <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  booking.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                                  booking.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                               }`}>
                                  {booking.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-800">{booking.amount}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           </div>

           {/* Quick Actions & Recent Activity */}
           <div className="space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                 <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold text-2xl">
                       A
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-blue-900">{user?.name || user?.username|| 'User'}</h3>
                       <p className="text-sm text-gray-500">Gold Member</p>
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
                       Validations
                    </button>
                 </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                 <h3 className="text-lg font-bold text-blue-900 mb-4">Recent Activity</h3>
                 <ul className="space-y-4">
                    <li className="flex items-start">
                       <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                       <div>
                          <p className="text-sm text-gray-800">Booking #124 completed successfully.</p>
                          <p className="text-xs text-gray-400">2 hours ago</p>
                       </div>
                    </li>
                    <li className="flex items-start">
                       <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                       <div>
                          <p className="text-sm text-gray-800">Payment for Plumbing Repair received.</p>
                          <p className="text-xs text-gray-400">Yesterday</p>
                       </div>
                    </li>
                    <li className="flex items-start">
                       <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                       <div>
                          <p className="text-sm text-gray-800">New service request pending approval.</p>
                          <p className="text-xs text-gray-400">2 days ago</p>
                       </div>
                    </li>
                 </ul>
              </div>

           </div>

        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
