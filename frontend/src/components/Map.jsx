import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to update map center when props change
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center);
    return null;
}

const Map = ({ center, zoom = 13, markers = [], onMapClick, draggableMarker, onMarkerDragEnd }) => {
    // Default center (e.g., New York) if none provided
    const defaultCenter = [40.7128, -74.0060];
    const mapCenter = center || defaultCenter;

    return (
        <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 z-0">
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={mapCenter} />

                {markers.map((marker, idx) => (
                    <Marker key={idx} position={marker.position}>
                        {marker.popup && <Popup>{marker.popup}</Popup>}
                    </Marker>
                ))}

                {draggableMarker && (
                    <Marker
                        position={draggableMarker.position}
                        draggable={true}
                        eventHandlers={{
                            dragend: (e) => {
                                if (onMarkerDragEnd) {
                                    const marker = e.target;
                                    const position = marker.getLatLng();
                                    onMarkerDragEnd([position.lat, position.lng]);
                                }
                            }
                        }}
                    >
                        <Popup>Drag to adjust location</Popup>
                    </Marker>
                )}

            </MapContainer>
        </div>
    );
};

export default Map;
