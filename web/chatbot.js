// Chatbot JavaScript
class JobWalaChatbot {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.messageHistory = [];
        this.currentContext = 'general';
        this.userPreferences = {};
        
        this.init();
        this.loadChatHistory();
        this.setupEventListeners();
    }

    init() {
        // Initialize chatbot elements
        this.toggle = document.getElementById('chatbot-toggle');
        this.container = document.getElementById('chatbot-container');
        this.messages = document.getElementById('chatbot-messages');
        this.input = document.getElementById('chatbot-input');
        this.sendBtn = document.getElementById('chatbot-send');
        this.badge = document.getElementById('chatbot-badge');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.charCount = document.getElementById('char-count');
        this.quickActions = document.getElementById('chatbot-quick-actions');

        // Add welcome message if no history
        if (this.messageHistory.length === 0) {
            this.addWelcomeMessage();
        }
    }

    setupEventListeners() {
        // Toggle chatbot
        this.toggle.addEventListener('click', () => this.toggleChatbot());
        
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Character count
        this.input.addEventListener('input', () => this.updateCharCount());

        // Quick actions
        this.quickActions.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            }
        });

        // Close/minimize buttons
        document.getElementById('chatbot-close').addEventListener('click', () => this.closeChatbot());
        document.getElementById('chatbot-minimize').addEventListener('click', () => this.minimizeChatbot());

        // Auto-resize input
        this.input.addEventListener('input', () => this.autoResizeInput());
    }

    toggleChatbot() {
        this.isOpen ? this.closeChatbot() : this.openChatbot();
    }

    openChatbot() {
        this.isOpen = true;
        this.container.classList.add('active');
        this.badge.classList.add('hidden');
        this.input.focus();
        this.scrollToBottom();
    }

    closeChatbot() {
        this.isOpen = false;
        this.container.classList.remove('active');
    }

    minimizeChatbot() {
        this.closeChatbot();
    }

    sendMessage() {
        const message = this.input.value.trim();
        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage(message, 'user');
        this.input.value = '';
        this.updateCharCount();
        this.autoResizeInput();

        // Process message
        this.processMessage(message);
    }

    addMessage(content, sender, timestamp = null) {
        const message = {
            content,
            sender,
            timestamp: timestamp || new Date().toISOString()
        };

        this.messageHistory.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
        this.saveChatHistory();
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = message.sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = `<p>${this.formatMessage(message.content)}</p>`;

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = this.formatTime(message.timestamp);

        content.appendChild(bubble);
        content.appendChild(time);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        this.messages.appendChild(messageDiv);
    }

    formatMessage(content) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return JobWalaAPI.formatIndianDate(date);
    }

    async processMessage(message) {
        this.showTyping();
        
        // Simulate processing delay
        await this.delay(1000 + Math.random() * 2000);

        const response = await this.generateResponse(message);
        this.hideTyping();
        this.addMessage(response, 'bot');
    }

    async generateResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Job search related
        if (this.containsKeywords(lowerMessage, ['job', 'work', 'employment', 'career', 'position', 'vacancy'])) {
            return this.getJobSearchResponse(message);
        }

        // Resume related
        if (this.containsKeywords(lowerMessage, ['resume', 'cv', 'curriculum', 'application', 'profile'])) {
            return this.getResumeResponse(message);
        }

        // Company related
        if (this.containsKeywords(lowerMessage, ['company', 'employer', 'organization', 'business'])) {
            return this.getCompanyResponse(message);
        }

        // Skills related
        if (this.containsKeywords(lowerMessage, ['skill', 'experience', 'qualification', 'training'])) {
            return this.getSkillsResponse(message);
        }

        // Interview related
        if (this.containsKeywords(lowerMessage, ['interview', 'meeting', 'discussion', 'questions'])) {
            return this.getInterviewResponse(message);
        }

        // Salary related
        if (this.containsKeywords(lowerMessage, ['salary', 'pay', 'compensation', 'wage', 'income'])) {
            return this.getSalaryResponse(message);
        }

        // General help
        if (this.containsKeywords(lowerMessage, ['help', 'support', 'assist', 'guide'])) {
            return this.getHelpResponse(message);
        }

        // Greeting
        if (this.containsKeywords(lowerMessage, ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'])) {
            return this.getGreetingResponse();
        }

        // Default response
        return this.getDefaultResponse(message);
    }

    containsKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }

    getJobSearchResponse(message) {
        const responses = [
            "I can help you find the perfect job! What type of position are you looking for? You can search by keywords, location, or industry.",
            "Great! Let's find you some amazing opportunities. What's your preferred job title or field? I can also help you refine your search criteria.",
            "I'd love to help you with your job search! What specific role or industry interests you? You can also tell me about your experience level.",
            "Perfect! Job searching can be exciting. What kind of work are you looking for? I can help you explore different opportunities and companies."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getResumeResponse(message) {
        const responses = [
            "I can help you create an outstanding resume! Our resume builder has 10+ professional templates. Would you like me to guide you through the process?",
            "Great choice! A strong resume is key to landing interviews. I can help you with formatting, content suggestions, and ATS optimization.",
            "Let's make your resume stand out! I can help you choose the right template, format your experience, and highlight your achievements effectively.",
            "Resume building made easy! I can guide you through creating a professional resume that gets noticed by employers. What would you like to focus on first?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getCompanyResponse(message) {
        const responses = [
            "I can help you research companies and find the best employers! What type of company are you interested in? I can show you top companies in various industries.",
            "Company research is crucial for your job search! I can help you find companies that match your values, culture preferences, and career goals.",
            "Let's explore great companies together! I can help you discover employers in your field, learn about company cultures, and find the right fit for you.",
            "Company insights at your fingertips! I can help you research potential employers, understand their values, and find companies that align with your career aspirations."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getSkillsResponse(message) {
        const responses = [
            "Skills are your career superpowers! I can help you identify your strengths, suggest skills to develop, and show you how to highlight them effectively.",
            "Let's talk about your skills! I can help you assess your current abilities, identify areas for growth, and show you how to present them to employers.",
            "Skills development is key to career success! I can help you understand which skills are in demand and how to showcase your expertise.",
            "Your skills are valuable assets! I can help you identify your unique strengths and show you how to present them in a way that impresses employers."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getInterviewResponse(message) {
        const responses = [
            "Interview preparation is crucial! I can help you with common questions, tips for success, and strategies to make a great impression.",
            "Let's get you interview-ready! I can help you practice common questions, develop your answers, and build confidence for your next interview.",
            "Interviews can be nerve-wracking, but I'm here to help! I can provide tips, sample questions, and strategies to help you succeed.",
            "Interview success starts with preparation! I can help you understand what employers are looking for and how to present yourself effectively."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getSalaryResponse(message) {
        const responses = [
            "Salary discussions are important! I can help you research market rates, understand compensation packages, and prepare for salary negotiations.",
            "Let's talk about compensation! I can help you understand salary ranges for your field and provide tips for negotiating your worth.",
            "Salary research is key to fair compensation! I can help you find market data and prepare for salary discussions with potential employers.",
            "Understanding your worth is crucial! I can help you research salary ranges and develop strategies for compensation discussions."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getHelpResponse(message) {
        const responses = [
            "I'm here to help with all aspects of your job search! I can assist with finding jobs, building resumes, company research, interview prep, and career advice.",
            "How can I assist you today? I can help with job searching, resume building, skill development, interview preparation, and career guidance.",
            "I'm your career companion! I can help you with job searches, resume creation, company research, interview tips, and professional development.",
            "Let me help you succeed! I can assist with job hunting, resume building, networking, interview preparation, and career planning."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getGreetingResponse() {
        const responses = [
            "Hello! Welcome to JobWala! I'm here to help you with your career journey. How can I assist you today?",
            "Hi there! Great to meet you! I'm your JobWala assistant, ready to help you find opportunities and advance your career.",
            "Hello! I'm excited to help you with your job search and career development. What would you like to explore today?",
            "Hi! Welcome to JobWala! I'm here to support you in finding the perfect job and building your career. How can I help?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getDefaultResponse(message) {
        const responses = [
            "That's interesting! I'm here to help with your job search and career development. Could you tell me more about what you're looking for?",
            "I'd love to help you with that! As your career assistant, I can help with job searching, resume building, interview prep, and more. What specific area interests you?",
            "Great question! I'm designed to help with career-related topics. I can assist with job searches, resume creation, company research, and professional development.",
            "I'm here to support your career goals! I can help with job hunting, resume building, skill development, interview preparation, and career planning. What would you like to focus on?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    handleQuickAction(action) {
        const actions = {
            'find-jobs': 'I can help you find great job opportunities! What type of position are you looking for?',
            'resume-help': 'Let\'s create an amazing resume! I can guide you through our resume builder with professional templates.',
            'career-advice': 'I\'d love to provide career guidance! What specific area would you like advice on?',
            'contact-support': 'I\'m here to help! If you need additional support, you can also reach out to our customer service team.'
        };

        this.addMessage(actions[action], 'bot');
    }

    showTyping() {
        this.isTyping = true;
        this.typingIndicator.classList.add('active');
        this.scrollToBottom();
    }

    hideTyping() {
        this.isTyping = false;
        this.typingIndicator.classList.remove('active');
    }

    updateCharCount() {
        const count = this.input.value.length;
        this.charCount.textContent = `${count}/500`;
        
        if (count > 450) {
            this.charCount.style.color = '#ef4444';
        } else if (count > 400) {
            this.charCount.style.color = '#f59e0b';
        } else {
            this.charCount.style.color = '#94a3b8';
        }
    }

    autoResizeInput() {
        this.input.style.height = 'auto';
        this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messages.scrollTop = this.messages.scrollHeight;
        }, 100);
    }

    addWelcomeMessage() {
        const welcomeMessages = [
            "Welcome to JobWala! I'm your AI assistant, ready to help you with your career journey.",
            "Hello! I'm here to help you find great job opportunities and advance your career.",
            "Hi there! I can assist you with job searching, resume building, and career advice."
        ];
        
        const welcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        this.addMessage(welcomeMessage, 'bot');
    }

    saveChatHistory() {
        try {
            localStorage.setItem('jobwala_chat_history', JSON.stringify(this.messageHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('jobwala_chat_history');
            if (saved) {
                this.messageHistory = JSON.parse(saved);
                this.renderChatHistory();
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    renderChatHistory() {
        this.messages.innerHTML = '';
        this.messageHistory.forEach(message => {
            this.renderMessage(message);
        });
        this.scrollToBottom();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public methods for external integration
    open() {
        this.openChatbot();
    }

    close() {
        this.closeChatbot();
    }

    sendMessage(message) {
        if (message) {
            this.input.value = message;
            this.sendMessage();
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jobWalaChatbot = new JobWalaChatbot();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JobWalaChatbot;
}
