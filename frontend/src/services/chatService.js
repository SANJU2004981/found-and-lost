import API from "./api";

const API_URL = "/api/messages";

const chatService = {
  getMessages: async (chatId) => {
    // Note: In this project, chatId corresponds to the itemId
    const response = await API.get(`${API_URL}/${chatId}`);
    return response.data;
  },

  sendMessage: async (chatId, messageData) => {
    const response = await API.post(`${API_URL}`, { ...messageData, item_id: chatId });
    return response.data;
  }
};

export default chatService;
