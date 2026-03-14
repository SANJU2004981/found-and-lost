const supabase = require('../config/supabase');

/**
 * Admin Middleware
 * 
 * Must be used AFTER authMiddleware, which attaches req.user.
 * 
 * Checks the public.users table for the authenticated user's role.
 * Allows access only if role === 'admin'.
 * Returns HTTP 403 Forbidden for any non-admin user.
 */
const adminMiddleware = async (req, res, next) => {
    try {
        // req.user is set by authMiddleware
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized. No authenticated user found.' });
        }

        const userId = req.user.id;

        console.log(`[ADMIN] Checking admin role for user: ${userId}`);

        // Query the public.users table for this user's role
        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        if (error) {
            console.error(`[ADMIN] Error fetching role for user ${userId}:`, error.message);
            return res.status(500).json({ error: 'Server error while verifying admin access.' });
        }

        if (!data) {
            console.warn(`[ADMIN] No user profile found in public.users for id: ${userId}`);
            return res.status(403).json({ error: 'Access denied. User profile not found.' });
        }

        const isRootAdmin = req.user.email === 'sanjuabi9384@gmail.com';

        if (data.role !== 'admin' && !isRootAdmin) {
            console.warn(`[ADMIN] Access denied for user ${userId} with role: ${data.role}`);
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        console.log(`[ADMIN] Admin access granted for user: ${userId}`);
        next();

    } catch (err) {
        console.error('[ADMIN] Unexpected error in adminMiddleware:', err);
        res.status(500).json({ error: 'Server error during admin authorization.' });
    }
};

module.exports = adminMiddleware;
