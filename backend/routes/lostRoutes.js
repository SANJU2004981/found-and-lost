const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });


// Get all lost items (with optional user_id query parameter)
// Also excludes 'recovered' items for public listings
// Get all lost items (with optional user_id query parameter)
router.get('/', (req, res, next) => {
    if (req.query.user_id) {
        return authMiddleware(req, res, next);
    }
    next();
}, async (req, res) => {
    await fetchItems(req, res);
});

async function fetchItems(req, res) {
    try {
        const { user_id } = req.query;

        let query = supabase
            .from('lost_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (user_id) {
            console.log(`[LOST-DASH-DEBUG] Fetching for user_id: ${user_id}, Auth user: ${req.user?.id}`);
            // Security: If fetching for a specific user, ensure it's themselves
            if (req.user && user_id !== req.user.id) {
                console.warn(`[LOST-DASH-DEBUG] UID Mismatch: Query ${user_id} vs Auth ${req.user.id}`);
                return res.status(403).json({ error: 'Access denied. You can only view your own items.' });
            }
            query = query.eq('user_id', user_id);
        } else {
            // Public view: filter out recovered items
            query = query.neq('status', 'recovered');
        }

        const { data, error } = await query;

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching lost items.' });
    }
}

// Get a single lost item
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('lost_items')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Lost item not found.' });
        }

        console.log(`[DEBUG-LOST] Retrieved item ${id}, owner: ${data.user_id}`);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching the lost item.' });
    }
});

// Post a new lost item
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, description, location, latitude, longitude } = req.body;
        const user_id = req.user.id;

        // Validate coordinates if provided
        if (latitude && longitude && latitude !== '' && longitude !== '') {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                return res.status(400).json({ error: 'Invalid latitude.' });
            }
            if (isNaN(lng) || lng < -180 || lng > 180) {
                return res.status(400).json({ error: 'Invalid longitude.' });
            }
        }

        let image_url = null;
        if (req.file) {
            const fileExt = req.file.originalname.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `lost_items/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, req.file.buffer, { contentType: req.file.mimetype });

            if (uploadError) return res.status(400).json({ error: 'Upload failed' });

            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filePath);
            image_url = publicUrlData.publicUrl;
        }

        const { data, error } = await supabase
            .from('lost_items')
            .insert([{
                title, description, location, latitude, longitude,
                user_id, image_url, status: 'active',
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) return res.status(400).json({ error: error.message });
        res.status(201).json({ message: 'Lost item reported!', item: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update OWN lost item
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const { title, description, location, latitude, longitude } = req.body;

        // 1. Check ownership
        const { data: item, error: fetchError } = await supabase
            .from('lost_items')
            .select('user_id, image_url')
            .eq('id', id)
            .single();

        if (!item || item.user_id !== user_id) {
            return res.status(403).json({ error: 'Access denied. You do not own this post.' });
        }

        let image_url = item.image_url;
        if (req.file) {
            const fileExt = req.file.originalname.split('.').pop();
            const fileName = `${Date.now()}_update.${fileExt}`;
            const filePath = `lost_items/${fileName}`;
            await supabase.storage.from('images').upload(filePath, req.file.buffer, { contentType: req.file.mimetype });
            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filePath);
            image_url = publicUrlData.publicUrl;
        }

        const { data: updatedData, error: updateError } = await supabase
            .from('lost_items')
            .update({ title, description, location, latitude, longitude, image_url })
            .eq('id', id)
            .select();

        if (updateError) return res.status(400).json({ error: updateError.message });
        res.status(200).json({ message: 'Updated successfully!', item: updatedData[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark OWN item as recovered
router.patch('/:id/recovered', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const { data: item } = await supabase.from('lost_items').select('user_id').eq('id', id).single();
        if (!item || item.user_id !== user_id) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const { data, error } = await supabase
            .from('lost_items')
            .update({ status: 'recovered' })
            .eq('id', id)
            .select();

        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ message: 'Item marked as recovered!', item: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete OWN lost item
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const { data: item } = await supabase.from('lost_items').select('user_id').eq('id', id).single();
        if (!item || item.user_id !== user_id) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const { error } = await supabase.from('lost_items').delete().eq('id', id);
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ message: 'Deleted successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
