import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

/**
 * MapComponent
 * Renders an interactive Leaflet map with high-contrast color scheme.
 * Standard OpenStreetMap tiles used for maximum clarity and color.
 */
const MapComponent = ({ items }) => {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);

    useEffect(() => {
        // Prevent multiple initializations
        if (leafletMapRef.current) {
            leafletMapRef.current.remove();
        }

        if (!mapRef.current) return;

        /* ── 1. Fix bundler-broken default icon paths ── */
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        const lostIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            shadowSize: [41, 41],
        });

        const foundIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            shadowSize: [41, 41],
        });

        /* ── 2. Initialize the Map ── */
        // Default View: Center on San Francisco [37.7749, -122.4194] OR requested [11.0168, 76.9558]
        const map = L.map(mapRef.current).setView([11.0168, 76.9558], 13);
        leafletMapRef.current = map;

        /* ── 3. Add Tile Layer (Vibrant Color Theme) ── */
        // Switching from Dark Matter to Standard OSM for rich colors
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        /* ── 4. Force Layout Recalculation (Critical Fix) ── */
        setTimeout(() => {
            map.invalidateSize();
        }, 300);

        /* ── 5. Add Markers ── */
        if (items && items.length > 0) {
            items.forEach(item => {
                const lat = parseFloat(item.latitude);
                const lng = parseFloat(item.longitude);
                if (isNaN(lat) || isNaN(lng)) return;

                const icon = item.type === 'lost' ? lostIcon : foundIcon;
                const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString() : '';
                
                const popupContent = `
                    <div style="font-family: 'Inter', sans-serif; min-width: 180px; padding: 10px;">
                        <span style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: ${item.type === 'lost' ? '#c92a2a' : '#2b8a3e'}; margin-bottom: 4px; display: block;">
                            ${item.type === 'lost' ? '⚠️ Missing' : '🛡️ Found'}
                        </span>
                        <strong style="display:block; margin-bottom: 6px; font-size: 1rem; color: #1a1a1a; line-height: 1.2;">${item.title}</strong>
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #495057; margin-bottom: 8px;">
                            <span>📍 ${item.location_name || item.location || 'Reported Location'}</span>
                        </div>
                        <div style="border-top: 1px solid rgba(0,0,0,0.1); padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.7rem; color: #868e96;">${dateStr}</span>
                            <a href="/items" style="color: #228be6; font-size: 0.75rem; font-weight: 700; text-decoration: none;">View Detail</a>
                        </div>
                    </div>
                `;
                L.marker([lat, lng], { icon }).addTo(map).bindPopup(popupContent);
            });

            // ── 6. Auto-fit to markers ──
            const bounds = items
                .filter(i => !isNaN(parseFloat(i.latitude)) && !isNaN(parseFloat(i.longitude)))
                .map(i => [parseFloat(i.latitude), parseFloat(i.longitude)]);
            if (bounds.length > 0) {
                map.fitBounds(bounds, { maxZoom: 14, padding: [60, 60] });
            }
        }

        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, [items]);

    return (
        <div 
            ref={mapRef} 
            className="leaflet-map" 
            style={{ 
                height: '100%', 
                width: '100%', 
                borderRadius: '16px', 
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
            }}
        />
    );
};

export default MapComponent;
