import API from "./api";

const API_URL = "/api/messages";

const chatService = {
  getMessages: async (itemId, itemType) => {
    // We send itemType as a query parameter for filtering
    const url = itemType ? `${API_URL}/${itemId}?item_type=${itemType}` : `${API_URL}/${itemId}`;
    const response = await API.get(url);
    return response.data;
  },

  sendMessage: async (itemId, messageData) => {
    // messageData should include item_type, receiver_id, message_text
    const response = await API.post(`${API_URL}`, { ...messageData, item_id: itemId });
    return response.data;
  }
};

export default chatService;
