import API from './api';

const API_URL = '/api/map';

const getMapItems = async () => {
    try {
        const response = await API.get(API_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch map data' };
    }
};

const mapService = {
    getMapItems,
};

export default mapService;
