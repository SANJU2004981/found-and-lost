import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import './LocationPickerMap.css';

/**
 * LocationPickerMap
 * Interactive map component for selecting coordinates during item reporting.
 * Supports clicking to mark and "Use My Current Location" functionality.
 */
const LocationPickerMap = ({ onLocationSelect, initialLat, initialLng }) => {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const markerRef = useRef(null);
    const [coords, setCoords] = useState({ 
        lat: initialLat || 11.0168, 
        lng: initialLng || 76.9558 
    });
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize Map
        const map = L.map(mapRef.current).setView([coords.lat, coords.lng], 13);
        leafletMapRef.current = map;

        // Tile Layer (OSM Color)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Fix default icon issues
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Add initial marker if exists
        const marker = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);
        markerRef.current = marker;

        // Handle Map Click
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            updateLocation(lat, lng);
        });

        // Handle Marker Drag
        marker.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            updateLocation(lat, lng);
        });

        // Force layout recalc
        setTimeout(() => {
            map.invalidateSize();
        }, 300);

        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, []);

    const updateLocation = (lat, lng) => {
        const newCoords = { 
            lat: parseFloat(lat.toFixed(6)), 
            lng: parseFloat(lng.toFixed(6)) 
        };
        setCoords(newCoords);
        if (markerRef.current) {
            markerRef.current.setLatLng([newCoords.lat, newCoords.lng]);
        }
        if (leafletMapRef.current) {
            leafletMapRef.current.panTo([newCoords.lat, newCoords.lng]);
        }
        onLocationSelect(newCoords.lat, newCoords.lng);
    };

    const handleUseCurrentLocation = (e) => {
        e.preventDefault(); // Prevent form submission
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                updateLocation(latitude, longitude);
                if (leafletMapRef.current) {
                    leafletMapRef.current.setZoom(16);
                }
                setIsLocating(false);
            },
            (err) => {
                console.error('Geolocation error:', err);
                alert('Unable to retrieve your location. Please check browser permissions.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    return (
        <div className="location-picker-container">
            <div className="picker-header">
                <div className="picker-instructions">
                    <span className="picker-icon">📍</span>
                    <div>
                        <strong>Select Coordinates</strong>
                        <p>Click on the map or drag the marker to pinpoint the exact area.</p>
                    </div>
                </div>
                <button 
                    className="btn btn-sm btn-outline btn-locate" 
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                >
                    {isLocating ? 'Locating...' : '🎯 Use My Current Location'}
                </button>
            </div>

            <div ref={mapRef} className="picker-map-canvas" />

            <div className="picker-footer">
                <div className="coord-badge">
                    <label>Lat:</label>
                    <code>{coords.lat}</code>
                </div>
                <div className="coord-badge">
                    <label>Lng:</label>
                    <code>{coords.lng}</code>
                </div>
            </div>
        </div>
    );
};

export default LocationPickerMap;
