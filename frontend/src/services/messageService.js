import axios from 'axios';
import authService from './authService';

const BASE_URL = import.meta.env.VITE_API_URL + '/api/messages';

const getMessages = async (itemId) => {
    try {
        const session = authService.getSession();
        const response = await axios.get(`${BASE_URL}/${itemId}`, {
            headers: { Authorization: `Bearer ${session?.access_token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch messages.' };
    }
};

const sendMessage = async (messageData) => {
    try {
        const session = authService.getSession();
        const response = await axios.post(BASE_URL, messageData, {
            headers: { Authorization: `Bearer ${session?.access_token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to send message.' };
    }
};

const messageService = {
    getMessages,
    sendMessage
};

export default messageService;
