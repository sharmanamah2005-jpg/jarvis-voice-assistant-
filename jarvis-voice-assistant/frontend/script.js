class JarvisAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.conversationHistory = [];
        this.backendUrl = 'http://localhost:5000'; // Change to your deployed backend URL
        this.wakeWord = 'hey jarvis';
        
        this.elements = {
            micBtn: document.getElementById('micBtn'),
            chatLog: document.getElementById('chatLog'),
            textInput: document.getElementById('textInput'),
            sendBtn: document.getElementById('sendBtn'),
            statusIndicator: document.querySelector('.status-indicator'),
            commandsHud: document.querySelector('.commands-hud')
        };
        
        this.initSpeechRecognition();
        this.initEventListeners();
        this.addSystemMessage('J.A.R.V.I.S. online and ready. Say "Hey Jarvis" or click the mic to start.');
        this.speak('J.A.R.V.I.S. online and ready for your commands, sir.');
    }
    
    initSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.addMessage('Speech recognition not supported in this browser.', 'ai');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI();
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    // Show interim results
                    this.elements.textInput.value = transcript;
                }
            }
            if (finalTranscript) {
                this.handleVoiceInput(finalTranscript.toLowerCase());
            }
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI();
            this.elements.textInput.value = '';
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateUI();
            this.elements.textInput.value = '';
        };
    }
    
    initEventListeners() {
        this.elements.micBtn.addEventListener('click', () => this.toggleListening());
        this.elements.sendBtn.addEventListener('click', () => this.sendTextMessage());
        this.elements.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendTextMessage();
        });
    }
    
    toggleListening() {
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }
    
    handleVoiceInput(transcript) {
        console.log('Voice input:', transcript);
        this.addMessage(transcript, 'user');
        this.elements.textInput.value = '';
        
        if (transcript.includes(this.wakeWord)) {
            transcript = transcript.replace(new RegExp(`^${this.wakeWord}`, 'i'), '').trim();
            if (transcript) {
                this.processCommand(transcript);
            } else {
                this.speak('Yes sir?');
                // Continuous listening after wake word
                setTimeout(() => this.recognition.start(), 500);
            }
        } else {
            this.processCommand(transcript);
        }
    }
    
    sendTextMessage() {
        const message = this.elements.textInput.value.trim();
        if (message) {
            this.addMessage(message, 'user');
            this.elements.textInput.value = '';
            this.processCommand(message);
        }
    }
    
    async processCommand(message) {
        this.conversationHistory.push({ role: 'user', content: message });
        
        try {
            // Show typing indicator
            this.addMessage('Typing...', 'ai');
            
            const response = await fetch(`${this.backendUrl}/ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    history: this.conversationHistory.slice(-10) // Last 10 messages
                })
            });
            
            const data = await response.json();
            this.addMessage(data.response, 'ai');
            this.conversationHistory.push({ role: 'assistant', content: data.response });
            
            if (data.response) {
                this.speak(data.response);
            }
        } catch (error) {
            const fallbackResponse = this.getFallbackResponse(message);
            this.addMessage(fallbackResponse, 'ai');
            this.conversationHistory.push({ role: 'assistant', content: fallbackResponse });
            this.speak(fallbackResponse);
        }
    }
    
    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('time')) return `The current time is ${new Date().toLocaleTimeString()}`;
        if (lowerMessage.includes('date')) return `Today is ${new Date().toLocaleDateString()}`;
        if (lowerMessage.includes('weather')) return 'Weather information requires backend connection';
        if (lowerMessage.includes('thank')) return 'You are welcome, sir.';
        return 'I can provide basic responses without internet. Please check your backend server.';
    }
    
    addMessage(text, sender) {
        // Remove typing indicator if exists
        const typingMsg = this.elements.chatLog.querySelector('.typing');
        if (typingMsg) typingMsg.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        this.elements.chatLog.appendChild(messageDiv);
        this.elements.chatLog.scrollTop = this.elements.chatLog.scrollHeight;
    }
    
    updateUI() {
        document.body.classList.toggle('listening', this.isListening);
        this.elements.micBtn.classList.toggle('listening', this.isListening);
        this.elements.statusIndicator.className = `status-indicator ${this.isListening ? 'online' : 'offline'}`;
        this.elements.commandsHud.textContent = `Voice Active | Continuous Listening: ${this.isListening ? 'ON' : 'OFF'}`;
    }
    
    speak(text) {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        utterance.volume = 0.8;
        utterance.lang = 'en-US';
        
        // Try to get JARVIS-like voice
        const voices = this.synthesis.getVoices();
        const jarvisVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('microsoft') && 
            voice.lang === 'en-US' &&
            voice.name.includes('zira')
        ) || voices.find(voice => voice.lang === 'en-US');
        
        if (jarvisVoice) utterance.voice = jarvisVoice;
        
        utterance.onend = () => {
            this.updateUI();
        };
        
        this.synthesis.speak(utterance);
    }
    
    addSystemMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai system';
        messageDiv.textContent = text;
        this.elements.chatLog.appendChild(messageDiv);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new JarvisAssistant();
});

// Load voices for speech synthesis
window.speechSynthesis.onvoiceschanged = () => {
    // Voices loaded
};
