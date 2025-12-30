import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Loader from "../components/common/Loader";
import LocationPicker from "../components/LocationPicker";

const BookService = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [service, setService] = useState(null);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        description: "",
        location: null, // Expecting { type: 'Point', coordinates: [], address: '' }
        scheduledDate: "",
        scheduledTime: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Service Details
                const serviceRes = await api.get(`/services/${serviceId}`);
                setService(serviceRes.data);

                // Fetch Available Providers for this service (for Map display only)
                const providersRes = await api.get(`/services/${serviceId}/providers`);
                setProviders(providersRes.data);

                // Initialize Location from User Profile
                if (user?.location) {
                    if (typeof user.location === 'object') {
                        // Whether it has coordinates or not, we pass it. 
                        // If no coordinates, backend will geocode based on address.
                        setFormData(prev => ({ ...prev, location: user.location }));
                    } else if (typeof user.location === 'string') {
                        // Legacy string location
                        setFormData(prev => ({ ...prev, location: { address: user.location, coordinates: null, type: 'Point' } }));
                    }
                }

            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load service details or providers.");
            } finally {
                setLoading(false);
            }
        };

        if (serviceId) {
            fetchData();
        }
    }, [serviceId, user]);

    const handleLocationSelect = (loc) => {
        setFormData(prev => ({ ...prev, location: loc }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate: Must have at least an address
        if (!formData.location || !formData.location.address) {
            alert("Please select a location or enter an address.");
            return;
        }

        setSubmitting(true);

        try {
            // Combine date and time
            const datetime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

            await api.post("/bookings", {
                service: service.name,
                serviceId: service._id, // Send the ID as well
                description: formData.description,
                location: formData.location, // Sending full object
                scheduledDate: datetime,
                amount: service.basePrice,
                // provider: null // Explicitly auto-assign
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

    // Prepare markers for providers
    // Backend Logic: Provider location is likely GeoJSON object now? 
    // Or still string if not updated? 
    // Ideally we filter those with valid coordinates.
    const providerMarkers = providers
        .filter(p => p.location && p.location.coordinates && p.location.type === 'Point')
        .map(p => ({
            position: [p.location.coordinates[1], p.location.coordinates[0]], // [lat, lng]
            popup: `Provider: ${p.username}`
        }));

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-blue-600 px-8 py-6 text-white">
                        <h1 className="text-3xl font-bold">Book {service.name}</h1>
                        <p className="opacity-90 mt-2">category: {service.category}</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 font-primary">
                        Booking Details
                    </h2>

                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Base Price</span>
                            <div className="text-2xl font-bold text-blue-900">${service.basePrice}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">Providers Nearby</div>
                            <div className="font-bold text-gray-800">{providers.length} Available</div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Location Picker */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Service Location & Map</label>
                            <p className="text-xs text-gray-500 mb-2">Search your address or drag the marker to your exact location. Verify nearby providers on the map.</p>
                            <LocationPicker
                                onLocationSelect={handleLocationSelect}
                                initialLocation={formData.location}
                            // Pass provider markers if LocationPicker supports it. 
                            // Actually LocationPicker design was simple. I should update LocationPicker or just pass children? 
                            // Map.jsx handles markers prop. But LocationPicker renders Map. 
                            // Warning: My LocationPicker implementation does not accept markers prop.
                            // I will need to update LocationPicker to accept `extraMarkers` or simply render them.
                            />
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
                                        Confirm Booking & Find Provider
                                    </span>
                                ) : (
                                    "Find Me a Provider"
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
