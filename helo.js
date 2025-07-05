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

// Create the chatbot interface if it doesn't exist
function createChatbotInterface() {
    // Check if chatbot container already exists
    if (document.querySelector('.chatbot-container')) {
        return;
    }
    
    // Create chatbot container element
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'chatbot-container collapsed';
    chatbotContainer.innerHTML = `
        <div class="chatbot-header" id="chatbot-toggle">
            <div class="chatbot-title">
                <i class="fas fa-robot"></i>
                <span>Campus Assistant</span>
            </div>
            <div class="chatbot-controls">
                <button class="minimize-btn">
                    <i class="fas fa-minus"></i>
                </button>
            </div>
        </div>
        <div class="chatbot-body">
            <div id="chat-messages">
                <div class="message bot">
                    <div class="message-content">
                        <p>Hello! I'm your campus assistant. How can I help you today?</p>
                    </div>
                    <span class="message-time">Now</span>
                </div>
            </div>
            <div class="chatbot-input">
                <input type="text" id="user-message" placeholder="Type your message...">
                <button id="send-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add CSS styles for chatbot
    const chatbotStyles = document.createElement('style');
    chatbotStyles.textContent = `
        .chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            border-radius: 10px;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
            background-color: #fff;
            z-index: 1000;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .chatbot-container.collapsed {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            overflow: hidden;
        }
        
        .chatbot-container.collapsed .chatbot-body,
        .chatbot-container.collapsed .chatbot-title span,
        .chatbot-container.collapsed .chatbot-controls {
            display: none;
        }
        
        .chatbot-container.collapsed .chatbot-header {
            height: 60px;
            border-radius: 50%;
            padding: 0;
            justify-content: center;
        }
        
        .chatbot-container.collapsed .chatbot-title {
            justify-content: center;
            width: 100%;
        }
        
        .chatbot-container.collapsed .chatbot-title i {
            font-size: 24px;
            margin: 0;
        }
        
        .chatbot-header {
            padding: 15px;
            background-color: var(--primary-color, #4a6ef5);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        }
        
        .chatbot-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
        }
        
        .chatbot-controls button {
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.3s;
        }
        
        .chatbot-controls button:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
        
        .chatbot-body {
            height: 400px;
            display: flex;
            flex-direction: column;
        }
        
        #chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background-color: #f8f9fa;
        }
        
        .message {
            margin-bottom: 15px;
            max-width: 80%;
            position: relative;
        }
        
        .message.user {
            margin-left: auto;
            background-color: var(--primary-color, #4a6ef5);
            color: white;
            border-radius: 18px 18px 0 18px;
            padding: 10px 15px;
        }
        
        .message.bot {
            margin-right: auto;
            background-color: white;
            border: 1px solid var(--medium-gray, #ccc);
            border-radius: 18px 18px 18px 0;
            padding: 10px 15px;
        }
        
        .message-time {
            font-size: 0.7rem;
            color: var(--text-secondary, #777);
            margin-top: 5px;
            display: block;
        }
        
        .message.user .message-time {
            text-align: right;
            color: rgba(255, 255, 255, 0.7);
        }
        
        .message.typing .message-content p {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .message.typing .message-content p::after {
            content: "•••";
            animation: typing 1s infinite;
        }
        
        .chatbot-input {
            display: flex;
            padding: 10px;
            border-top: 1px solid var(--medium-gray, #ccc);
        }
        
        .chatbot-input input {
            flex: 1;
            padding: 10px;
            border: 1px solid var(--medium-gray, #ccc);
            border-radius: 20px;
            margin-right: 10px;
            outline: none;
        }
        
        .chatbot-input input:focus {
            border-color: var(--primary-color, #4a6ef5);
        }
        
        .chatbot-input button {
            background-color: var(--primary-color, #4a6ef5);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.3s;
        }
        
        .chatbot-input button:hover {
            background-color: var(--secondary-color, #3d5af1);
        }
        
        @keyframes typing {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
        }
    `;
    
    // Append elements to the document
    document.head.appendChild(chatbotStyles);
    document.body.appendChild(chatbotContainer);
}

// Main chatbot initialization function
function initChatbot() {
    // Create chatbot interface if not already present
    createChatbotInterface();
    
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatMessages = document.getElementById('chat-messages');
    const userMessageInput = document.getElementById('user-message');
    const sendButton = document.getElementById('send-btn');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const minimizeBtn = document.querySelector('.minimize-btn');
    
    // Toggle chatbot expansion/collapse when clicking on the header
    chatbotToggle.addEventListener('click', function(e) {
        // Don't toggle if clicking on the minimize button itself
        if (e.target === minimizeBtn || minimizeBtn.contains(e.target)) {
            return;
        }
        
        chatbotContainer.classList.toggle('collapsed');
    });
    
    // Minimize button functionality
    minimizeBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        chatbotContainer.classList.add('collapsed');
    });
    
    sendButton.addEventListener('click', sendMessageHandler);
    userMessageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessageHandler();
        }
    });
}

async function sendMessageHandler() {
    const userMessageInput = document.getElementById("user-message");
    const message = userMessageInput.value.trim();
    if (message === '') return;
    
    addMessageToChat('user', message);
    userMessageInput.value = '';
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
    
    // Create current time string
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
        </div>
        <span class="message-time">${timeStr}</span>
    `;
    
    // Add animation class based on sender
    if (sender === 'user') {
        messageElement.style.animation = 'slideInRight 0.3s ease forwards';
    } else {
        messageElement.style.animation = 'slideInLeft 0.3s ease forwards';
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Auto-expand chatbot if it receives a message while collapsed
    const chatbotContainer = document.querySelector('.chatbot-container');
    if (chatbotContainer.classList.contains('collapsed')) {
        chatbotContainer.classList.remove('collapsed');
    }
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const typingElement = document.createElement('div');
    typingElement.className = 'message bot typing';
    typingElement.id = 'typing-indicator';
    typingElement.innerHTML = `
        <div class="message-content">
            <p>...</p>
        </div>
        <span class="message-time">typing</span>
    `;
    chatMessages.appendChild(typingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
        return "I'm having trouble connecting to my services right now. Please try again later.";
    }
}

function handleQuickAction(action) {
    switch(action) {
        case 'book-room':
            showNotification("Redirecting to room booking page...", "info");
            // Simulate redirect
            setTimeout(() => {
                window.location.href = "booking.html";
            }, 1000);
            break;
        case 'reserve-equipment':
            showNotification("Redirecting to equipment reservation page...", "info");
            // Simulate redirect
            setTimeout(() => {
                window.location.href = "resource.html";
            }, 1000);
            break;
        case 'report-issue':
            showNotification("Redirecting to issue reporting page...", "info");
            // Simulate redirect
            setTimeout(() => {
                window.location.href = "servicerequest.html";
            }, 1000);
            break;
        case 'contact-support':
            // Open chatbot if minimized
            const chatbotContainer = document.querySelector('.chatbot-container');
            if (chatbotContainer.classList.contains('collapsed')) {
                chatbotContainer.classList.remove('collapsed');
            }
            
            // Add pre-filled message
            const userMessageInput = document.getElementById('user-message');
            if (userMessageInput) {
                userMessageInput.value = "I need support with ";
                userMessageInput.focus();
            }
            break;
    }
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Automatic removal after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initChatbot();
    
    // Add notification styling
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease forwards;
            opacity: 1;
            transition: opacity 0.3s ease;
        }
        
        .notification.success {
            background-color: #4CAF50;
        }
        
        .notification.error {
            background-color: #F44336;
        }
        
        .notification.info {
            background-color: #2196F3;
        }
        
       .notification.warning {
            background-color: #FF9800;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(notificationStyles);
    
    // Add quick action buttons if needed
    const quickActionContainer = document.createElement('div');
    quickActionContainer.className = 'quick-actions';
    quickActionContainer.innerHTML = `
   
    `;
    
    // Add quick action styles
    const quickActionStyles = document.createElement('style');
    quickActionStyles.textContent = `
        .quick-actions {
            position: fixed;
            bottom: 90px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 999;
        }
        
        .quick-actions button {
            background-color: var(--primary-color, #4a6ef5);
            color: white;
            border: none;
            border-radius: 20px;
            padding: 8px 15px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: transform 0.2s ease, background-color 0.3s;
        }
        
        .quick-actions button:hover {
            background-color: var(--secondary-color, #3d5af1);
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(quickActionStyles);
    document.body.appendChild(quickActionContainer);
});