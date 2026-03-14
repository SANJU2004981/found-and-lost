const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Get all found items
router.get('/', async (req, res, next) => {
    if (req.query.user_id) {
        return authMiddleware(req, res, () => fetchItems(req, res));
    }
    return fetchItems(req, res);
});

async function fetchItems(req, res) {
    try {
        const { user_id } = req.query;
        let query = supabase
            .from('found_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (user_id) {
            // Security: If fetching for a specific user, ensure it's themselves
            if (req.user && user_id !== req.user.id) {
                return res.status(403).json({ error: 'Access denied. You can only view your own items.' });
            }
            query = query.eq('user_id', user_id);
        }

        const { data, error } = await query;
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}

// Get single found item
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('found_items').select('*').eq('id', req.params.id).single();
        if (error) return res.status(404).json({ error: 'Item not found.' });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Post found item
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, description, location, latitude, longitude } = req.body;
        const user_id = req.user.id;
        let image_url = null;

        if (req.file) {
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const filePath = `found_items/${fileName}`;
            await supabase.storage.from('images').upload(filePath, req.file.buffer, { contentType: req.file.mimetype });
            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filePath);
            image_url = publicUrlData.publicUrl;
        }

        const { data, error } = await supabase.from('found_items').insert([{
            title, description, location, latitude, longitude, user_id, image_url,
            created_at: new Date().toISOString()
        }]).select();

        if (error) return res.status(400).json({ error: error.message });
        res.status(201).json({ message: 'Found item reported!', item: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update OWN found item
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const { title, description, location, latitude, longitude } = req.body;

        const { data: item } = await supabase.from('found_items').select('user_id, image_url').eq('id', id).single();
        if (!item || item.user_id !== user_id) return res.status(403).json({ error: 'Access denied.' });

        let image_url = item.image_url;
        if (req.file) {
            const filePath = `found_items/${Date.now()}_update`;
            await supabase.storage.from('images').upload(filePath, req.file.buffer, { contentType: req.file.mimetype });
            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filePath);
            image_url = publicUrlData.publicUrl;
        }

        const { data: updated, error } = await supabase.from('found_items')
            .update({ title, description, location, latitude, longitude, image_url })
            .eq('id', id).select();

        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ message: 'Updated!', item: updated[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete OWN found item
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const { data: item } = await supabase.from('found_items').select('user_id').eq('id', id).single();
        if (!item || item.user_id !== user_id) return res.status(403).json({ error: 'Access denied.' });

        const { error } = await supabase.from('found_items').delete().eq('id', id);
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ message: 'Deleted!' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
