import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Loader from "../components/common/Loader";

const BookService = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        description: "",
        location: user?.location || "",
        scheduledDate: "",
        scheduledTime: ""
    });

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await api.get(`/services/${serviceId}`);
                setService(response.data);
            } catch (err) {
                console.error("Error fetching service:", err);
                setError("Failed to load service details.");
            } finally {
                setLoading(false);
            }
        };

        if (serviceId) {
            fetchService();
        }
    }, [serviceId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Combine date and time
            const datetime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

            await api.post("/bookings", {
                service: service.name,
                serviceId: service._id, // Send the ID as well
                description: formData.description,
                location: formData.location,
                scheduledDate: datetime,
                amount: service.basePrice
            });

            // Redirect to user dashboard
            navigate("/dashboard/user");
        } catch (err) {
            console.error("Booking error:", err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to submit booking. Please try again.";
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader size="lg" message="Loading service details..." />;

    if (error || !service) return (
        <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{error || "Service not found"}</h2>
            <button onClick={() => navigate("/services")} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                Back to Services
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 px-8 py-6 text-white">
                    <h1 className="text-3xl font-bold">Book Service</h1>
                    <p className="opacity-90 mt-2">Complete the form to schedule your appointment</p>
                </div>

                <div className="p-8">
                    <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-blue-900">{service.name}</h3>
                            <p className="text-gray-600 text-sm">{service.category}</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-bold text-orange-500">${service.basePrice}</span>
                            <span className="text-xs text-gray-500">Base Price</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Service Location</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <input
                                    required
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Enter your address"
                                />
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date</label>
                                <input
                                    required
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.scheduledDate}
                                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Time</label>
                                <input
                                    required
                                    type="time"
                                    value={formData.scheduledTime}
                                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Problem Description</label>
                            <textarea
                                required
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder="Describe the issue in detail..."
                            ></textarea>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-[1.02] ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Confirming Booking...
                                    </span>
                                ) : (
                                    "Confirm Booking"
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookService;
