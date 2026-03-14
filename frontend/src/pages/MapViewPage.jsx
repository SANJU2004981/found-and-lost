import React, { useEffect, useState } from 'react';
import MapComponent from '../components/MapComponent';
import lostItemService from '../services/lostItemService';
import foundItemService from '../services/foundItemService';
import './MapViewPage.css';

const MapViewPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const [lost, found] = await Promise.all([
                    lostItemService.getAllLostItems().catch(() => []),
                    foundItemService.getAllFoundItems().catch(() => []),
                ]);
                const combined = [
                    ...(lost || []).map(i => ({ ...i, type: 'lost' })),
                    ...(found || []).map(i => ({ ...i, type: 'found' }))
                ];
                setItems(combined);
            } catch (err) {
                setError('Unable to load map overlay data.');
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    const lostCount = items.filter(i => i.type === 'lost').length;
    const foundCount = items.filter(i => i.type === 'found').length;

    return (
        <div className="page-wrapper">
            <div className="map-page-header">
                <div>
                    <h1>Interactive Map View</h1>
                    <p>Geospatial visualization of local lost and found reports.</p>
                </div>
                {!loading && !error && (
                    <div className="map-summary-pills">
                        <div className="map-pill lost">
                            <span className="dot" />
                            {lostCount} Lost Items
                        </div>
                        <div className="map-pill found">
                            <span className="dot" />
                            {foundCount} Found Items
                        </div>
                    </div>
                )}
            </div>

            {error && <div className="status-card error">{error}</div>}

            <div className="map-container-outer">
                {loading ? (
                    <div className="map-loading-overlay">
                        <div className="spinner" />
                        <p>Plotting locations on high-precision map...</p>
                    </div>
                ) : (
                    <MapComponent items={items} />
                )}

                {/* Legend Overlay */}
                {!loading && (
                    <div className="map-legend">
                        <h4>Map Guide</h4>
                        <div className="legend-item">
                            <span className="marker-dot lost" />
                            <span>Lost Belongings</span>
                        </div>
                        <div className="legend-item">
                            <span className="marker-dot found" />
                            <span>Found Belongings</span>
                        </div>
                        <p className="legend-hint">Click markers for details</p>
                    </div>
                )}
            </div>

            <div className="map-footer-info">
                <span className="info-icon">💡</span>
                <p>Only items with provided GPS coordinates are displayed on the map. Items without coordinates can be found in the registry.</p>
            </div>
        </div>
    );
};

export default MapViewPage;
