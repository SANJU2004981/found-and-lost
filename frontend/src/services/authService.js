import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/auth`;

const register = async (email, password, name) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            email,
            password,
            name,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Registration failed' };
    }
};

const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
        });
        
        if (response.data.session) {
            const session = response.data.session;
            
            // ── NEW: Fetch profile immediately after login to get the role ──
            try {
                const profileRes = await axios.get(`${API_URL}/profile`, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
                
                // Add the profile (especially the role) to the session object
                session.user.role = profileRes.data.role || 'user';
                session.user.full_name = profileRes.data.name;
            } catch (profileErr) {
                console.error("[AUTH] Failed to fetch profile after login:", profileErr);
                // Fallback to 'user' role if profile fetch fails
                session.user.role = 'user';
            }

            localStorage.setItem('supabase_session', JSON.stringify(session));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Login failed' };
    }
};

const logout = () => {
    localStorage.removeItem('supabase_session');
};

const getCurrentUser = () => {
    const session = JSON.parse(localStorage.getItem('supabase_session'));
    return session ? session.user : null;
};

const getSession = () => {
    return JSON.parse(localStorage.getItem('supabase_session'));
};

const getUserRole = () => {
    const user = getCurrentUser();
    return user ? user.role : null;
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    getSession,
    getUserRole,
};

export default authService;
