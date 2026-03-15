import API from './api';

const API_URL = '/api/lost';

const createLostItem = async (formData) => {
    try {
        const response = await API.post(API_URL, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to create lost item' };
    }
};

const getAllLostItems = async () => {
    try {
        const response = await API.get(API_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch lost items' };
    }
};

const getLostItemById = async (id) => {
    try {
        const response = await API.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch lost item details' };
    }
};

const updateLostItem = async (id, formData) => {
    try {
        const response = await API.put(`${API_URL}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to update lost item' };
    }
};

const markAsRecovered = async (id) => {
    try {
        const response = await API.patch(`${API_URL}/${id}/recovered`, {});
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to mark as recovered' };
    }
};

const deleteLostItem = async (id) => {
    try {
        const response = await API.delete(`${API_URL}/${id}`);
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
