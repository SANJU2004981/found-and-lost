import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/api/messages";

const chatService = {
  getMessages: async (chatId) => {
    // Note: In this project, chatId corresponds to the itemId
    const response = await axios.get(`${API_URL}/${chatId}`);
    return response.data;
  },

  sendMessage: async (chatId, messageData) => {
    // chatId is passed for API consistency, though the current backend uses a flat POST /api/messages
    // We append it to match the requested service signature, but the backend may need adjustment or we use a wrapper
    const response = await axios.post(`${API_URL}`, { ...messageData, item_id: chatId });
    return response.data;
  }
};

export default chatService;
