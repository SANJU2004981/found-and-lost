const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// User Registration Route
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required.' });
        }

        console.log(`[AUTH] Registration attempt for: ${email}`);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name  // ✅ Must be "name" so the DB trigger reads it correctly
                }
            }
        });

        if (error) {
            console.error(`[AUTH] Supabase registration error for ${email}:`, error.message);
            return res.status(400).json({ error: error.message });
        }

        console.log(`[AUTH] User registered successfully: ${data.user?.id}`);
        res.status(201).json({ message: 'User registered successfully!', user: data.user });
    } catch (err) {
        console.error('[AUTH] Unexpected error during registration:', err);
        res.status(500).json({ error: 'Server error during registration. Please try again.' });
    }
});

// User Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        console.log(`[AUTH] Login attempt for: ${email}`);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error(`[AUTH] Login error for ${email}:`, error.message);
            return res.status(400).json({ error: error.message });
        }

        console.log(`[AUTH] User logged in successfully: ${data.user?.id}`);
        res.status(200).json({ message: 'User logged in successfully!', session: data.session });
    } catch (err) {
        console.error('[AUTH] Unexpected error during login:', err);
        res.status(500).json({ error: 'Server error during login. Please try again.' });
    }
});

// Get User Profile (including role)
const authMiddleware = require('../middleware/authMiddleware');
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            return res.status(400).json({ error: 'Profile not found.' });
        }

        // ── ROOT ADMIN FALLBACK ──
        if (req.user.email === 'sanjuabi9384@gmail.com') {
            data.role = 'admin';
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('[AUTH] Profile fetch error:', err);
        res.status(500).json({ error: 'Server error fetching profile.' });
    }
});

module.exports = router;

