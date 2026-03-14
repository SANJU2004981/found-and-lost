import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/map`;

const getMapItems = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch map data' };
    }
};

const mapService = {
    getMapItems,
};

export default mapService;
