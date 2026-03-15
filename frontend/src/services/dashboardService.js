import API from './api';
import authService from './authService';

const BASE_URL = '/api';

const getUserItems = async (type) => {
    try {
        const user = authService.getCurrentUser();
        if (!user || (!user.id && !user.sub)) {
            throw new Error('User not authenticated');
        }

        const userId = user.id || user.sub;
        const endpoint = type === 'lost' ? '/lost' : '/found';
        
        const response = await API.get(`${BASE_URL}${endpoint}?user_id=${userId}`);
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
