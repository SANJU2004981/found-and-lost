import API from './api';

const BASE_URL = '/api/messages';

const getMessages = async (itemId) => {
    try {
        const response = await API.get(`${BASE_URL}/${itemId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch messages.' };
    }
};

const sendMessage = async (messageData) => {
    try {
        const response = await API.post(BASE_URL, messageData);
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
