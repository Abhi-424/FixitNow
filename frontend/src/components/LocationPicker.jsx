import React, { useState, useEffect } from "react";
import Map from "./Map";
import axios from "axios";

const LocationPicker = ({ onLocationSelect, initialLocation, markers = [] }) => {
    const [address, setAddress] = useState(initialLocation?.address || "");
    const [coordinates, setCoordinates] = useState(
        initialLocation?.coordinates
            ? [initialLocation.coordinates[1], initialLocation.coordinates[0]] // [lat, lng]
            : null
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Sync initial location
    useEffect(() => {
        if (initialLocation?.coordinates) {
            const [lng, lat] = initialLocation.coordinates;
            setCoordinates([lat, lng]);
        }
    }, [initialLocation]);

    // 🔍 Manual address search
    const handleSearch = async () => {
        if (!address.trim()) {
            setError("Please enter an address");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await axios.get(
                "https://nominatim.openstreetmap.org/search",
                {
                    params: {
                        q: address,
                        format: "json",
                        limit: 1,
                    },
                }
            );

            if (res.data.length === 0) {
                setError("Address not found");
                return;
            }

            const { lat, lon, display_name } = res.data[0];
            const coords = [parseFloat(lat), parseFloat(lon)];

            setCoordinates(coords);
            setAddress(display_name);

            onLocationSelect?.({
                address: display_name,
                coordinates: [parseFloat(lon), parseFloat(lat)], // backend format [lng, lat]
            });
        } catch (err
            
        ) {
            setError("Failed to fetch location");
        } finally {
            setLoading(false);
        }
    };

    // 📍 Auto detect location (GPS)
    const handleAutoDetect = () => {
        if (!navigator.geolocation) {
            setError("Geolocation not supported");
            return;
        }

        setLoading(true);
        setError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const coords = [latitude, longitude];

                setCoordinates(coords);

                onLocationSelect?.({
                    address: "Current Location",
                    coordinates: [longitude, latitude],
                });

                setLoading(false);
            },
            () => {
                setError("Location permission denied");
                setLoading(false);
            }
        );
    };

    // 🧲 Marker drag handler
    const handleMarkerDrag = (lat, lng) => {
        setCoordinates([lat, lng]);

        onLocationSelect?.({
            address,
            coordinates: [lng, lat],
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address or city"
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Searching..." : "Search"}
                </button>

                <button
                    type="button"
                    onClick={handleAutoDetect}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                    📍 Detect
                </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {coordinates && (
                <Map
                    center={coordinates}
                    draggableMarker={{ position: coordinates }}
                    onMarkerDragEnd={handleMarkerDrag}
                    markers={markers}
                />
            )}
        </div>
    );
};

export default LocationPicker;
