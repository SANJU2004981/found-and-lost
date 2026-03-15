import API from './api';

const API_URL = '/api/found';

const createFoundItem = async (formData) => {
    try {
        const response = await API.post(API_URL, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to create found item' };
    }
};

const getAllFoundItems = async () => {
    try {
        const response = await API.get(API_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch found items' };
    }
};

const getFoundItemById = async (id) => {
    try {
        const response = await API.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch found item details' };
    }
};

const updateFoundItem = async (id, formData) => {
    try {
        const response = await API.put(`${API_URL}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to update found item' };
    }
};

const deleteFoundItem = async (id) => {
    try {
        const response = await API.delete(`${API_URL}/${id}`);
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
