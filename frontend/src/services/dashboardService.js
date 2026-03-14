import axios from 'axios';
import authService from './authService';

const BASE_URL = 'http://localhost:5000/api';

const getUserItems = async (type) => {
    try {
        const user = authService.getCurrentUser();
        if (!user || (!user.id && !user.sub)) {
            throw new Error('User not authenticated');
        }

        const userId = user.id || user.sub;
        const session = authService.getSession();
        
        // Corrected endpoints to match backend routes
        const endpoint = type === 'lost' ? '/lost' : '/found';
        
        const response = await axios.get(`${BASE_URL}${endpoint}?user_id=${userId}`, {
            headers: {
                Authorization: `Bearer ${session?.access_token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: `Failed to fetch user ${type} items` };
    }
};

const getMyLostItems = () => getUserItems('lost');
const getMyFoundItems = () => getUserItems('found');

const dashboardService = {
    getMyLostItems,
    getMyFoundItems
};

export default dashboardService;
