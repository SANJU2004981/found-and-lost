import axios from 'axios';
import authService from './authService';

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = BASE_URL + '/api/found';

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

const createFoundItem = async (formData) => {
    try {
        const response = await axios.post(API_URL, formData, { headers: getHeaders(true) });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to create found item' };
    }
};

const getAllFoundItems = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch found items' };
    }
};

const getFoundItemById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch found item details' };
    }
};

const updateFoundItem = async (id, formData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, formData, { headers: getHeaders(true) });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to update found item' };
    }
};

const deleteFoundItem = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to delete found item' };
    }
};

const foundItemService = {
    createFoundItem,
    getAllFoundItems,
    getFoundItemById,
    updateFoundItem,
    deleteFoundItem,
};

export default foundItemService;
