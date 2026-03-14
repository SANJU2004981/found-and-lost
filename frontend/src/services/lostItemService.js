import axios from 'axios';
import authService from './authService';

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = BASE_URL + '/api/lost';

const getHeaders = (isFormData = false) => {
    const session = authService.getSession();
    const headers = {
        'Authorization': `Bearer ${session?.access_token}`
    };
    if (isFormData) {
        headers['Content-Type'] = 'multipart/form-data';
    }
    return headers;
};

const createLostItem = async (formData) => {
    try {
        const response = await axios.post(API_URL, formData, { headers: getHeaders(true) });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to create lost item' };
    }
};

const getAllLostItems = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch lost items' };
    }
};

const getLostItemById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch lost item details' };
    }
};

const updateLostItem = async (id, formData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, formData, { headers: getHeaders(true) });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to update lost item' };
    }
};

const markAsRecovered = async (id) => {
    try {
        const response = await axios.patch(`${API_URL}/${id}/recovered`, {}, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to mark as recovered' };
    }
};

const deleteLostItem = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to delete lost item' };
    }
};

const lostItemService = {
    createLostItem,
    getAllLostItems,
    getLostItemById,
    updateLostItem,
    deleteLostItem,
    markAsRecovered
};

export default lostItemService;
