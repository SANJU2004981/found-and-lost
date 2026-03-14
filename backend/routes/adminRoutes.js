const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ─────────────────────────────────────────────────────────
// GET /api/admin/dashboard
// Confirms admin access and returns basic user info
// ─────────────────────────────────────────────────────────
router.get('/dashboard', authMiddleware, adminMiddleware, (req, res) => {
    res.status(200).json({
        message: 'Welcome Admin',
        user: req.user
    });
});

// ─────────────────────────────────────────────────────────
// GET /api/admin/users
// Returns all registered users from public.users
// ─────────────────────────────────────────────────────────
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[ADMIN] Error fetching users:', error.message);
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('[ADMIN] Unexpected error fetching users:', err);
        res.status(500).json({ error: 'Server error fetching users.' });
    }
});

// ─────────────────────────────────────────────────────────
// GET /api/admin/lost-items
// Returns all lost items from public.lost_items
// ─────────────────────────────────────────────────────────
router.get('/lost-items', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('lost_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[ADMIN] Error fetching lost items:', error.message);
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('[ADMIN] Unexpected error fetching lost items:', err);
        res.status(500).json({ error: 'Server error fetching lost items.' });
    }
});

// ─────────────────────────────────────────────────────────
// GET /api/admin/found-items
// Returns all found items from public.found_items
// ─────────────────────────────────────────────────────────
router.get('/found-items', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('found_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[ADMIN] Error fetching found items:', error.message);
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('[ADMIN] Unexpected error fetching found items:', err);
        res.status(500).json({ error: 'Server error fetching found items.' });
    }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/admin/lost-items/:id
// Admin deletes any lost item by ID
// ─────────────────────────────────────────────────────────
router.delete('/lost-items/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`[ADMIN] Deleting lost item: ${id} by admin: ${req.user.id}`);

        const { error } = await supabase
            .from('lost_items')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`[ADMIN] Error deleting lost item ${id}:`, error.message);
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ message: `Lost item ${id} deleted successfully.` });
    } catch (err) {
        console.error('[ADMIN] Unexpected error deleting lost item:', err);
        res.status(500).json({ error: 'Server error deleting lost item.' });
    }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/admin/found-items/:id
// Admin deletes any found item by ID
// ─────────────────────────────────────────────────────────
router.delete('/found-items/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`[ADMIN] Deleting found item: ${id} by admin: ${req.user.id}`);

        const { error } = await supabase
            .from('found_items')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`[ADMIN] Error deleting found item ${id}:`, error.message);
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ message: `Found item ${id} deleted successfully.` });
    } catch (err) {
        console.error('[ADMIN] Unexpected error deleting found item:', err);
        res.status(500).json({ error: 'Server error deleting found item.' });
    }
});

module.exports = router;
