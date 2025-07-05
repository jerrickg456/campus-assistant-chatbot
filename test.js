// Basic Chatbot with Gemini API Integration
const API_CONFIG = {
    gemini: {
        apiKey: "AIzaSyCfG0g6hOUndFicxfonWt3zDh7txnN_-HI", // Replace with your actual Gemini API key
        endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
    }
};

// Simple conversation context
let conversationContext = {
    chatHistory: []
};

// Create HTML for the chatbot interface
function createChatbotHTML() {
    const chatbotHTML = `
        <div class="chatbot-container">
            <div class="chatbot-header" id="chatbot-toggle">
                <div class="chatbot-title">
                    <i class="fas fa-robot"></i>
                    <span>Chatbot</span>
                </div>
                <div class="chatbot-controls">
                    <button class="minimize-btn">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            </div>
            <div class="chatbot-body">
                <div id="chat-messages"></div>
                <div class="chatbot-input">
                    <input type="text" id="user-message" placeholder="Type your message...">
                    <button id="send-btn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const chatbotContainer = document.createElement('div');
    chatbotContainer.innerHTML = chatbotHTML;
    document.body.appendChild(chatbotContainer);
}

// Main chatbot initialization function
function initChatbot() {
    if (!document.querySelector('.chatbot-container')) {
        createChatbotHTML();
    }
    
    const chatMessages = document.getElementById('chat-messages');
    const userMessageInput = document.getElementById('user-message');
    const sendButton = document.getElementById('send-btn');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotBody = document.querySelector('.chatbot-body');
    
    addMessageToChat('bot', "Hello! How can I help you today?");
    
    chatbotToggle.addEventListener('click', function() {
        chatbotBody.classList.toggle('hidden');
        const minimizeBtn = this.querySelector('.minimize-btn i');
        minimizeBtn.classList.toggle('fa-minus');
        minimizeBtn.classList.toggle('fa-plus');
    });
    
    sendButton.addEventListener('click', sendMessageHandler);
    userMessageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessageHandler();
        }
    });
}

async function sendMessageHandler() {
    const message = document.getElementById("user-message").value.trim();
    if (message === '') return;
    addMessageToChat('user', message);
    document.getElementById("user-message").value = '';
    showTypingIndicator();
    
    conversationContext.chatHistory.push({ role: 'user', message });
    try {
        const geminiResponse = await callGeminiAPI(message);
        removeTypingIndicator();
        addMessageToChat('bot', geminiResponse);
        conversationContext.chatHistory.push({ role: 'assistant', message: geminiResponse });
    } catch (error) {
        console.error("Error generating response:", error);
        removeTypingIndicator();
        addMessageToChat('bot', "Sorry, I encountered an error. Please try again.");
    }
}

function addMessageToChat(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.innerHTML = `<div class="message-content"><p>${message}</p></div>`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const typingElement = document.createElement('div');
    typingElement.className = 'message bot typing';
    typingElement.id = 'typing-indicator';
    typingElement.innerHTML = `<div class="message-content"><p>...</p></div>`;
    chatMessages.appendChild(typingElement);
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) typingIndicator.remove();
}

async function callGeminiAPI(userMessage) {
    try {
        const response = await fetch(API_CONFIG.gemini.endpoint + "?key=" + API_CONFIG.gemini.apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: userMessage }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
            })
        });
        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No response";
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initChatbot();
});
