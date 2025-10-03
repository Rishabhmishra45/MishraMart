import express from 'express';
import { chatWithBot, getChatSuggestions } from '../controller/chatbotController.js';

const chatbotRoutes = express.Router();

chatbotRoutes.post('/chat', chatWithBot);
chatbotRoutes.get('/suggestions', getChatSuggestions);

export default chatbotRoutes;