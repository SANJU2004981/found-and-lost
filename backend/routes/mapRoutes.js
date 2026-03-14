const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get combined map-friendly data for both lost and found items
router.get('/', async (req, res) => {
    try {
        // Fetch simplified lost items - excluding recovered ones
        const { data: lostData, error: lostError } = await supabase
            .from('lost_items')
            .select('id, title, location, latitude, longitude, image_url, created_at, status')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null)
            .neq('status', 'recovered');

        if (lostError) {
            return res.status(400).json({ error: lostError.message });
        }

        // Fetch simplified found items
        const { data: foundData, error: foundError } = await supabase
            .from('found_items')
            .select('id, title, location, latitude, longitude, image_url, created_at')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null);

        if (foundError) {
            return res.status(400).json({ error: foundError.message });
        }

        // Add 'type' fields and combine the arrays
        const mapReadyLostItems = lostData.map(item => ({ ...item, type: 'lost' }));
        const mapReadyFoundItems = foundData.map(item => ({ ...item, type: 'found' }));

        const combinedMapData = [...mapReadyLostItems, ...mapReadyFoundItems];

        res.status(200).json(combinedMapData);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching map data.' });
    }
});

module.exports = router;
