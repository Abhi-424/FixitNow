import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
   const { user } = useAuth();
   const [activeTab, setActiveTab] = useState("overview"); // overview, users, providers, bookings, services

   // Data States
   const [stats, setStats] = useState({ users: 0, providers: 0, bookings: 0 });
   const [users, setUsers] = useState([]);
   const [providers, setProviders] = useState([]);
   const [bookings, setBookings] = useState([]);
   const [services, setServices] = useState([]);

   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // Service Form State (for adding/editing)
   const [serviceForm, setServiceForm] = useState({
      name: '', description: '', category: 'Plumbing', basePrice: 0, imageUrl: '', isActive: true
   });
   const [isEditingService, setIsEditingService] = useState(null); // ID if editing

   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = async () => {
      try {
         setLoading(true);
         const storedUser = localStorage.getItem('user');
         const userData = storedUser ? JSON.parse(storedUser) : null;
         const token = userData?.token;

         if (!token) {
            setError('No authentication token found. Please login again.');
            setLoading(false);
            return;
         }

         const headers = { 'Authorization': `Bearer ${token}` };

         // Parallel fetching
         const [statsRes, usersRes, providersRes, bookingsRes, servicesRes] = await Promise.all([
            fetch('http://localhost:5000/api/admin/stats', { headers }),
            fetch('http://localhost:5000/api/admin/users', { headers }),
            fetch('http://localhost:5000/api/admin/providers', { headers }),
            fetch('http://localhost:5000/api/admin/bookings', { headers }),
            fetch('http://localhost:5000/api/services/admin/all', { headers }) // admin - includes inactive
         ]);

         if (statsRes.ok) setStats(await statsRes.json());
         if (usersRes.ok) setUsers(await usersRes.json());
         if (providersRes.ok) setProviders(await providersRes.json());
         if (bookingsRes.ok) setBookings(await bookingsRes.json());
         if (servicesRes.ok) setServices(await servicesRes.json());

      } catch (err) {
         console.error("Error fetching admin data:", err);
         setError("Failed to load dashboard data.");
      } finally {
         setLoading(false);
      }
   };

   // User/Provider Status Updates
   const handleStatusUpdate = async (userId, newStatus) => {
      try {
         const storedUser = localStorage.getItem('user');
         const userData = storedUser ? JSON.parse(storedUser) : null;
         const token = userData?.token;

         if (!token) {
            alert('Please login again');
            return;
         }

         const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus })
         });
         if (res.ok) {
            alert(`User status updated to ${newStatus} successfully!`);
            fetchData(); // Refresh all data
         } else {
            const errorData = await res.json();
            alert("Failed to update status: " + (errorData.message || 'Unknown error'));
         }
      } catch (err) {
         console.error(err);
         alert("Error updating status: " + err.message);
      }
   };

   // Booking Status Updates
   const handleBookingStatus = async (bookingId, newStatus) => {
      if (!window.confirm(`Are you sure you want to force status to ${newStatus}?`)) return;
      try {
         const storedUser = localStorage.getItem('user');
         const userData = storedUser ? JSON.parse(storedUser) : null;
         const token = userData?.token;

         if (!token) {
            alert('Please login again');
            return;
         }

         const res = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus })
         });
         if (res.ok) {
            alert(`Booking status updated to ${newStatus} successfully!`);
            fetchData();
         } else {
            const errorData = await res.json();
            alert("Failed to update booking status: " + (errorData.message || 'Unknown error'));
         }
      } catch (err) {
         console.error(err);
         alert("Error updating booking status: " + err.message);
      }
   };

   // Service Management
   const handleServiceSubmit = async (e) => {
      e.preventDefault();
      try {
         const storedUser = localStorage.getItem('user');
         const userData = storedUser ? JSON.parse(storedUser) : null;
         const token = userData?.token;

         if (!token) {
            alert('Please login again');
            return;
         }

         const url = isEditingService
            ? `http://localhost:5000/api/services/${isEditingService}`
            : 'http://localhost:5000/api/services';

         const method = isEditingService ? 'PUT' : 'POST';

         const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(serviceForm)
         });

         if (res.ok) {
            setServiceForm({ name: '', description: '', category: 'Plumbing', basePrice: 0, imageUrl: '', isActive: true });
            setIsEditingService(null);
            fetchData(); // refresh services
            alert(isEditingService ? "Service updated successfully!" : "Service created successfully!");
         } else {
            const errorData = await res.json();
            alert("Failed to save service: " + (errorData.message || 'Unknown error'));
         }
      } catch (err) {
         console.error(err);
         alert("Error saving service: " + err.message);
      }
   };

   const deleteService = async (id) => {
      if (!window.confirm("Are you sure? This will deactivate the service and prevent new bookings.")) return;
      try {
         const storedUser = localStorage.getItem('user');
         const userData = storedUser ? JSON.parse(storedUser) : null;
         const token = userData?.token;

         if (!token) {
            alert('Please login again');
            return;
         }

         const res = await fetch(`http://localhost:5000/api/services/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
         });
         if (res.ok) {
            alert('Service deactivated successfully!');
            fetchData();
         } else {
            alert('Failed to deactivate service');
         }
      } catch (err) {
         console.error(err);
         alert("Error deactivating service");
      }
   }

   const toggleServiceStatus = async (id, currentStatus) => {
      try {
         const storedUser = localStorage.getItem('user');
         const userData = storedUser ? JSON.parse(storedUser) : null;
         const token = userData?.token;

         if (!token) {
            alert('Please login again');
            return;
         }

         const res = await fetch(`http://localhost:5000/api/services/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ isActive: !currentStatus })
         });
         if (res.ok) {
            alert(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
            fetchData();
         } else {
            alert('Failed to update service status');
         }
      } catch (err) {
         console.error(err);
         alert("Error updating service status");
      }
   }

   const startEditService = (service) => {
      setServiceForm({
         name: service.name,
         description: service.description,
         category: service.category,
         basePrice: service.basePrice,
         imageUrl: service.imageUrl,
         isActive: service.isActive !== undefined ? service.isActive : true
      });
      setIsEditingService(service._id);
      setActiveTab("services");
   }


   if (loading) return <div className="min-h-screen flex items-center justify-center bg-blue-50 text-blue-900 font-bold text-xl">Loading Dashboard...</div>;
   if (error) return <div className="min-h-screen flex items-center justify-center bg-blue-50 text-red-500 font-bold text-xl">{error}</div>;

   return (
      <div className="min-h-screen bg-blue-50 font-sans text-gray-800 pt-20">
         <header className="bg-white shadow-sm border-b border-gray-200 py-6 sticky top-0 z-10">
            <div className="container mx-auto px-6 flex justify-between items-center">
               <div>
                  <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
                  <p className="text-gray-500 text-sm">Welcome back, {user?.username || 'Administrator'}</p>
               </div>
               <div className="flex space-x-2">
                  {['overview', 'users', 'providers', 'bookings', 'services'].map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg capitalize font-medium transition ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
            </div>
         </header>

         <main className="container mx-auto px-6 py-10">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
               <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 text-2xl font-bold">U</div>
                        <div><p className="text-gray-500 text-sm font-medium">Total Users</p><h3 className="text-2xl font-bold text-blue-900">{stats.users}</h3></div>
                     </div>
                     <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 text-2xl font-bold">P</div>
                        <div><p className="text-gray-500 text-sm font-medium">Providers</p><h3 className="text-2xl font-bold text-blue-900">{stats.providers}</h3></div>
                     </div>
                     <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4 text-2xl font-bold">B</div>
                        <div><p className="text-gray-500 text-sm font-medium">Bookings</p><h3 className="text-2xl font-bold text-blue-900">{stats.bookings}</h3></div>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md">
                     <h3 className="text-lg font-bold text-blue-900 mb-4">Quick Actions</h3>
                     <div className="flex gap-4">
                        <button onClick={() => setActiveTab('services')} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-bold">Add New Service</button>
                        <button onClick={() => setActiveTab('providers')} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-bold">Verify Providers</button>
                     </div>
                  </div>
               </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
               <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-100"><h2 className="text-xl font-bold text-blue-900">User Management</h2></div>
                  <table className="w-full text-left">
                     <thead className="bg-blue-50 text-blue-900 font-bold uppercase text-xs">
                        <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Action</th></tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                           <tr key={u._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-bold">{u.username}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                              <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                              <td className="px-6 py-4">
                                 {u.status === 'Blocked' ?
                                    <button onClick={() => handleStatusUpdate(u._id, 'Active')} className="text-green-600 font-bold text-sm">Unblock</button> :
                                    <button onClick={() => handleStatusUpdate(u._id, 'Blocked')} className="text-red-600 font-bold text-sm">Block</button>
                                 }
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {/* PROVIDERS TAB */}
            {activeTab === 'providers' && (
               <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-100"><h2 className="text-xl font-bold text-blue-900">Provider Management</h2></div>
                  <table className="w-full text-left">
                     <thead className="bg-blue-50 text-blue-900 font-bold uppercase text-xs">
                        <tr><th className="px-6 py-4">Provider</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th></tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {providers.map(p => (
                           <tr key={p._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-bold">{p.username}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{p.email}</td>
                              <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'Verified' ? 'bg-green-100 text-green-700' : p.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span></td>
                              <td className="px-6 py-4 flex gap-2">
                                 {p.status === 'Pending' && <button onClick={() => handleStatusUpdate(p._id, 'Verified')} className="px-3 py-1 bg-green-500 text-white rounded text-xs font-bold">Approve</button>}
                                 {p.status !== 'Blocked' && <button onClick={() => handleStatusUpdate(p._id, 'Blocked')} className="px-3 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">Block</button>}
                                 {p.status === 'Blocked' && <button onClick={() => handleStatusUpdate(p._id, 'Verified')} className="px-3 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">Unblock</button>}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
               <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-100"><h2 className="text-xl font-bold text-blue-900">All Bookings</h2></div>
                  <table className="w-full text-left">
                     <thead className="bg-blue-50 text-blue-900 font-bold uppercase text-xs">
                        <tr><th className="px-6 py-4">Service</th><th className="px-6 py-4">User</th><th className="px-6 py-4">Provider</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Intervention</th></tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {bookings.map(b => (
                           <tr key={b._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium">{b.service}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{b.user?.username || 'Deleted User'}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{b.provider?.username || 'Unassigned'}</td>
                              <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{b.status}</span></td>
                              <td className="px-6 py-4 flex gap-2">
                                 <button onClick={() => handleBookingStatus(b._id, 'Cancelled')} className="text-red-500 text-xs font-bold hover:underline">Force Cancel</button>
                                 <button onClick={() => handleBookingStatus(b._id, 'Pending')} className="text-orange-500 text-xs font-bold hover:underline">Reset</button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === 'services' && (
               <div className="space-y-8">
                  <div className="bg-white p-6 rounded-xl shadow-md">
                     <h3 className="text-lg font-bold text-blue-900 mb-4">{isEditingService ? 'Edit Service' : 'Add New Service'}</h3>
                     <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Service Name" className="border p-2 rounded" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} required />
                        <select className="border p-2 rounded" value={serviceForm.category} onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })} required>
                           <option value="Plumbing">Plumbing</option>
                           <option value="Electrical">Electrical</option>
                           <option value="Home Repairs">Home Repairs</option>
                           <option value="AC Repair">AC Repair</option>
                           <option value="Painting">Painting</option>
                           <option value="Cleaning">Cleaning</option>
                           <option value="Carpentry">Carpentry</option>
                           <option value="Pest Control">Pest Control</option>
                           <option value="Gardening">Gardening</option>
                           <option value="Technology">Technology</option>
                           <option value="Appliance">Appliance</option>
                           <option value="Pets">Pets</option>
                           <option value="Moving">Moving</option>
                           <option value="Decorating">Decorating</option>
                           <option value="Event">Event</option>
                           <option value="Other">Other</option>
                        </select>
                        <input type="number" placeholder="Base Price ($)" className="border p-2 rounded" value={serviceForm.basePrice} onChange={e => setServiceForm({ ...serviceForm, basePrice: parseFloat(e.target.value) })} required />
                        <input type="text" placeholder="Image URL" className="border p-2 rounded" value={serviceForm.imageUrl} onChange={e => setServiceForm({ ...serviceForm, imageUrl: e.target.value })} />
                        <textarea placeholder="Description" className="border p-2 rounded md:col-span-2" rows="2" value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} required></textarea>
                        <div className="flex items-center gap-2">
                           <label className="flex items-center cursor-pointer">
                              <input type="checkbox" className="mr-2" checked={serviceForm.isActive} onChange={e => setServiceForm({ ...serviceForm, isActive: e.target.checked })} />
                              <span className="text-sm font-medium">Active Service</span>
                           </label>
                        </div>
                        <div className="flex gap-2 md:col-start-2">
                           <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">{isEditingService ? 'Update Service' : 'Create Service'}</button>
                           {isEditingService && <button type="button" onClick={() => { setIsEditingService(null); setServiceForm({ name: '', description: '', category: 'Plumbing', basePrice: 0, imageUrl: '', isActive: true }); }} className="px-4 py-2 bg-gray-200 rounded font-bold">Cancel</button>}
                        </div>
                     </form>
                  </div>

                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                     <div className="p-6 border-b border-gray-100"><h2 className="text-xl font-bold text-blue-900">Service Catalog</h2></div>
                     <table className="w-full text-left">
                        <thead className="bg-blue-50 text-blue-900 font-bold uppercase text-xs">
                           <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Price</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {services.map(s => (
                              <tr key={s._id} className={`hover:bg-gray-50 ${!s.isActive ? 'bg-gray-50' : ''}`}>
                                 <td className="px-6 py-4 font-medium">{s.name}</td>
                                 <td className="px-6 py-4 text-sm text-gray-500">{s.category}</td>
                                 <td className="px-6 py-4">${s.basePrice}</td>
                                 <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                       {s.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => startEditService(s)} className="text-blue-600 font-bold text-xs hover:underline">Edit</button>
                                    <button onClick={() => toggleServiceStatus(s._id, s.isActive)} className={`font-bold text-xs hover:underline ${s.isActive ? 'text-orange-600' : 'text-green-600'}`}>
                                       {s.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    {s.isActive && <button onClick={() => deleteService(s._id)} className="text-red-600 font-bold text-xs hover:underline">Delete</button>}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

         </main>
      </div>
   );
};

export default AdminDashboard;
