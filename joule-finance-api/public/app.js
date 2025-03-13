document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const chatHistory = document.getElementById('chatHistory');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // Current session ID for maintaining conversation context
    let currentSessionId = null;

    // Auto-resize the textarea as user types
    userInput.addEventListener('input', () => {
        // Reset height to auto to get the actual scrollHeight
        userInput.style.height = 'auto';
        // Set height to scrollHeight
        userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
    });

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessageToChat('user', message);
        
        // Clear and reset input
        userInput.value = '';
        userInput.style.height = 'auto';
        userInput.focus();
        
        // Show loading indicator
        const loadingEl = showLoadingIndicator();
        
        // Disable send button during request
        sendButton.disabled = true;
        
        try {
            // Send to API and get response
            const response = await sendMessageToAPI(message, currentSessionId);
            
            // Remove loading indicator
            if (loadingEl) chatHistory.removeChild(loadingEl);
            
            // Store the session ID for context
            currentSessionId = response.sessionId;
            
            // Add assistant message to chat
            addMessageToChat('assistant', response.text);
        } catch (error) {
            // Remove loading indicator
            if (loadingEl) chatHistory.removeChild(loadingEl);
            
            // Add error message
            addMessageToChat('assistant', 'Sorry, I encountered an error processing your request. Please try again.');
            console.error('Error:', error);
        } finally {
            // Re-enable send button
            sendButton.disabled = false;
            
            // Scroll to bottom of chat
            scrollToBottom();
        }
    });

    // Function to send message to API
    async function sendMessageToAPI(message, sessionId = null) {
        try {
            // Debug log the request
            debugLog('Sending to API:', { message, sessionId });
            
            const payload = {
                message: message
            };
            
            // Add session ID if we have one
            if (sessionId) {
                payload.sessionId = sessionId;
            }
            
            // Send the request
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            // Debug log the raw response
            debugLog('Raw API response:', response);
            
            if (!response.ok) {
                throw new Error(`API returned status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Debug log the parsed data
            debugLog('Parsed API data:', data);
            
            return data;
        } catch (error) {
            console.error('Error calling API:', error);
            throw error;
        }
    }

    // Function to add a message to the chat
    function addMessageToChat(role, content) {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message', role);
        
        // Add avatar
        const avatarEl = document.createElement('div');
        avatarEl.classList.add('avatar');
        
        const imgEl = document.createElement('img');
        imgEl.src = role === 'user' 
            ? 'https://placehold.co/40x40?text=U' 
            : 'https://placehold.co/40x40?text=J';
        imgEl.alt = role === 'user' ? 'User' : 'Joule Assistant';
        
        avatarEl.appendChild(imgEl);
        messageEl.appendChild(avatarEl);
        
        // Add message content
        const contentEl = document.createElement('div');
        contentEl.classList.add('message-content');
        
        const textEl = document.createElement('div');
        textEl.innerHTML = content;
        
        contentEl.appendChild(textEl);
        messageEl.appendChild(contentEl);
        
        // Add to chat history
        chatHistory.appendChild(messageEl);
        
        // Scroll to bottom
        scrollToBottom();
    }

    // Function to show loading indicator
    function showLoadingIndicator() {
        const loadingEl = document.createElement('div');
        loadingEl.classList.add('message', 'assistant');
        
        // Add avatar
        const avatarEl = document.createElement('div');
        avatarEl.classList.add('avatar');
        
        const imgEl = document.createElement('img');
        imgEl.src = 'https://placehold.co/40x40?text=J';
        imgEl.alt = 'Joule Assistant';
        
        avatarEl.appendChild(imgEl);
        loadingEl.appendChild(avatarEl);
        
        // Add loading dots
        const contentEl = document.createElement('div');
        contentEl.classList.add('message-content', 'loading');
        
        const dotsEl = document.createElement('div');
        dotsEl.classList.add('loading-dots');
        
        for (let i = 0; i < 3; i++) {
            const dotEl = document.createElement('div');
            dotEl.classList.add('dot');
            dotsEl.appendChild(dotEl);
        }
        
        contentEl.appendChild(dotsEl);
        loadingEl.appendChild(contentEl);
        
        // Add to chat history
        chatHistory.appendChild(loadingEl);
        
        // Scroll to bottom
        scrollToBottom();
        
        return loadingEl;
    }

    // Function to scroll to bottom of chat
    function scrollToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Initialize: focus the input
    userInput.focus();
});

// Add this debugging function at the top
function debugLog(message, data) {
    console.log(`%c${message}`, 'color: blue; font-weight: bold', data);
} 