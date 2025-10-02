// Enhanced Dynamic Chatbot for JobWala
class EnhancedJobWalaChatbot {
    constructor(options = {}) {
        this.isOpen = false;
        this.isTyping = false;
        this.messageHistory = [];
        this.currentContext = 'general';
        this.userPreferences = {};
        this.config = {
            position: options.position || 'bottom-right',
            theme: options.theme || 'default',
            autoOpen: options.autoOpen || false,
            showWelcome: options.showWelcome !== false,
            enableQuickActions: options.enableQuickActions !== false,
            enableTypingIndicator: options.enableTypingIndicator !== false,
            maxMessages: options.maxMessages || 50,
            apiEndpoint: options.apiEndpoint || '/api/chatbot',
            ...options
        };
        
        this.init();
        this.loadChatHistory();
        this.setupEventListeners();
        this.createWidget();
    }

    init() {
        // Initialize chatbot elements
        this.createWidget();
        this.setupEventListeners();
        
        // Add welcome message if no history and showWelcome is true
        if (this.messageHistory.length === 0 && this.config.showWelcome) {
            this.addWelcomeMessage();
        }
    }

    createWidget() {
        // Remove existing widget if it exists
        const existingWidget = document.getElementById('enhanced-chatbot-widget');
        if (existingWidget) {
            existingWidget.remove();
        }

        // Create widget HTML
        const widgetHTML = `
            <div id="enhanced-chatbot-widget" class="enhanced-chatbot-widget">
                <!-- Chatbot Toggle Button -->
                <div id="enhanced-chatbot-toggle" class="enhanced-chatbot-toggle">
                    <i class="fas fa-comments"></i>
                    <span class="enhanced-chatbot-badge" id="enhanced-chatbot-badge">1</span>
                </div>

                <!-- Chatbot Container -->
                <div id="enhanced-chatbot-container" class="enhanced-chatbot-container">
                    <!-- Chatbot Header -->
                    <div class="enhanced-chatbot-header">
                        <div class="enhanced-chatbot-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="enhanced-chatbot-info">
                            <h3>JobWala Assistant</h3>
                            <span class="enhanced-chatbot-status">Online</span>
                        </div>
                        <div class="enhanced-chatbot-controls">
                            <button id="enhanced-chatbot-minimize" class="enhanced-chatbot-btn">
                                <i class="fas fa-minus"></i>
                            </button>
                            <button id="enhanced-chatbot-close" class="enhanced-chatbot-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Chatbot Messages -->
                    <div class="enhanced-chatbot-messages" id="enhanced-chatbot-messages">
                        <!-- Messages will be loaded here -->
                    </div>

                    <!-- Quick Actions -->
                    ${this.config.enableQuickActions ? `
                    <div class="enhanced-chatbot-quick-actions" id="enhanced-chatbot-quick-actions">
                        <button class="enhanced-quick-action-btn" data-action="find-jobs">
                            <i class="fas fa-search"></i>
                            Find Jobs
                        </button>
                        <button class="enhanced-quick-action-btn" data-action="resume-help">
                            <i class="fas fa-file-alt"></i>
                            Resume Help
                        </button>
                        <button class="enhanced-quick-action-btn" data-action="career-advice">
                            <i class="fas fa-lightbulb"></i>
                            Career Advice
                        </button>
                        <button class="enhanced-quick-action-btn" data-action="contact-support">
                            <i class="fas fa-headset"></i>
                            Contact Support
                        </button>
                    </div>
                    ` : ''}

                    <!-- Chatbot Input -->
                    <div class="enhanced-chatbot-input-container">
                        <div class="enhanced-chatbot-input-wrapper">
                            <input type="text" id="enhanced-chatbot-input" placeholder="Type your message..." maxlength="500">
                            <button id="enhanced-chatbot-send" class="enhanced-chatbot-send-btn">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        <div class="enhanced-chatbot-input-footer">
                            <span class="enhanced-char-count" id="enhanced-char-count">0/500</span>
                            <span class="enhanced-chatbot-hint">Press Enter to send</span>
                        </div>
                    </div>
                </div>

                <!-- Typing Indicator -->
                <div id="enhanced-typing-indicator" class="enhanced-typing-indicator">
                    <div class="enhanced-message enhanced-bot-message">
                        <div class="enhanced-message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="enhanced-message-content">
                            <div class="enhanced-message-bubble enhanced-typing-bubble">
                                <div class="enhanced-typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert widget into page
        document.body.insertAdjacentHTML('beforeend', widgetHTML);

        // Store references to elements
        this.toggle = document.getElementById('enhanced-chatbot-toggle');
        this.container = document.getElementById('enhanced-chatbot-container');
        this.messages = document.getElementById('enhanced-chatbot-messages');
        this.input = document.getElementById('enhanced-chatbot-input');
        this.sendBtn = document.getElementById('enhanced-chatbot-send');
        this.badge = document.getElementById('enhanced-chatbot-badge');
        this.typingIndicator = document.getElementById('enhanced-typing-indicator');
        this.charCount = document.getElementById('enhanced-char-count');
        this.quickActions = document.getElementById('enhanced-chatbot-quick-actions');

        // Add CSS if not already added
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('enhanced-chatbot-styles')) return;

        const styles = `
            <style id="enhanced-chatbot-styles">
                /* Enhanced Chatbot Styles */
                .enhanced-chatbot-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 10000;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                /* Chatbot Toggle Button */
                .enhanced-chatbot-toggle {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    border: none;
                    outline: none;
                }

                .enhanced-chatbot-toggle:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
                }

                .enhanced-chatbot-toggle i {
                    color: white;
                    font-size: 24px;
                    transition: transform 0.3s ease;
                }

                .enhanced-chatbot-toggle:hover i {
                    transform: rotate(15deg);
                }

                .enhanced-chatbot-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #ff4757;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                    animation: enhanced-pulse 2s infinite;
                }

                .enhanced-chatbot-badge.hidden {
                    display: none;
                }

                @keyframes enhanced-pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }

                /* Chatbot Container */
                .enhanced-chatbot-container {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 380px;
                    height: 500px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .enhanced-chatbot-container.active {
                    display: flex;
                    animation: enhanced-slideUp 0.3s ease-out;
                }

                @keyframes enhanced-slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                /* Chatbot Header */
                .enhanced-chatbot-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: white;
                }

                .enhanced-chatbot-avatar {
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }

                .enhanced-chatbot-avatar i {
                    font-size: 18px;
                    color: white;
                }

                .enhanced-chatbot-info {
                    flex: 1;
                }

                .enhanced-chatbot-info h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                .enhanced-chatbot-status {
                    font-size: 12px;
                    opacity: 0.8;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .enhanced-chatbot-status::before {
                    content: '';
                    width: 8px;
                    height: 8px;
                    background: #4ade80;
                    border-radius: 50%;
                    animation: enhanced-pulse 2s infinite;
                }

                .enhanced-chatbot-controls {
                    display: flex;
                    gap: 8px;
                }

                .enhanced-chatbot-btn {
                    width: 30px;
                    height: 30px;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }

                .enhanced-chatbot-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                }

                /* Chatbot Messages */
                .enhanced-chatbot-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    background: #f8fafc;
                }

                .enhanced-chatbot-messages::-webkit-scrollbar {
                    width: 4px;
                }

                .enhanced-chatbot-messages::-webkit-scrollbar-track {
                    background: transparent;
                }

                .enhanced-chatbot-messages::-webkit-scrollbar-thumb {
                    background: rgba(102, 126, 234, 0.3);
                    border-radius: 2px;
                }

                .enhanced-chatbot-messages::-webkit-scrollbar-thumb:hover {
                    background: rgba(102, 126, 234, 0.5);
                }

                .enhanced-message {
                    display: flex;
                    gap: 10px;
                    animation: enhanced-messageSlide 0.3s ease-out;
                }

                @keyframes enhanced-messageSlide {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .enhanced-user-message {
                    flex-direction: row-reverse;
                }

                .enhanced-message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .enhanced-bot-message .enhanced-message-avatar {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .enhanced-user-message .enhanced-message-avatar {
                    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
                    color: white;
                }

                .enhanced-message-avatar i {
                    font-size: 14px;
                }

                .enhanced-message-content {
                    flex: 1;
                    max-width: 80%;
                }

                .enhanced-message-bubble {
                    background: white;
                    padding: 12px 16px;
                    border-radius: 18px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    position: relative;
                    word-wrap: break-word;
                }

                .enhanced-user-message .enhanced-message-bubble {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .enhanced-message-bubble p {
                    margin: 0;
                    line-height: 1.4;
                    font-size: 14px;
                }

                .enhanced-message-time {
                    font-size: 11px;
                    color: #94a3b8;
                    margin-top: 4px;
                    text-align: right;
                }

                .enhanced-user-message .enhanced-message-time {
                    text-align: left;
                }

                /* Typing Indicator */
                .enhanced-typing-indicator {
                    display: none;
                    padding: 0 20px 20px;
                }

                .enhanced-typing-indicator.active {
                    display: block;
                }

                .enhanced-typing-bubble {
                    background: #e2e8f0;
                    padding: 12px 16px;
                }

                .enhanced-typing-dots {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                }

                .enhanced-typing-dots span {
                    width: 6px;
                    height: 6px;
                    background: #94a3b8;
                    border-radius: 50%;
                    animation: enhanced-typing 1.4s infinite ease-in-out;
                }

                .enhanced-typing-dots span:nth-child(1) { animation-delay: -0.32s; }
                .enhanced-typing-dots span:nth-child(2) { animation-delay: -0.16s; }

                @keyframes enhanced-typing {
                    0%, 80%, 100% {
                        transform: scale(0.8);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                /* Quick Actions */
                .enhanced-chatbot-quick-actions {
                    padding: 15px 20px;
                    background: white;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .enhanced-quick-action-btn {
                    background: rgba(102, 126, 234, 0.1);
                    border: 1px solid rgba(102, 126, 234, 0.2);
                    color: #667eea;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    white-space: nowrap;
                }

                .enhanced-quick-action-btn:hover {
                    background: rgba(102, 126, 234, 0.2);
                    transform: translateY(-1px);
                }

                .enhanced-quick-action-btn i {
                    font-size: 10px;
                }

                /* Chatbot Input */
                .enhanced-chatbot-input-container {
                    background: white;
                    border-top: 1px solid #e2e8f0;
                    padding: 15px 20px;
                }

                .enhanced-chatbot-input-wrapper {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 25px;
                    padding: 8px 15px;
                    transition: all 0.3s ease;
                }

                .enhanced-chatbot-input-wrapper:focus-within {
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                #enhanced-chatbot-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 14px;
                    color: #334155;
                    resize: none;
                    max-height: 100px;
                }

                #enhanced-chatbot-input::placeholder {
                    color: #94a3b8;
                }

                .enhanced-chatbot-send-btn {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }

                .enhanced-chatbot-send-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .enhanced-chatbot-send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .enhanced-chatbot-input-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 8px;
                    font-size: 11px;
                    color: #94a3b8;
                }

                .enhanced-char-count {
                    font-weight: 500;
                }

                /* Responsive Design */
                @media (max-width: 480px) {
                    .enhanced-chatbot-widget {
                        bottom: 10px;
                        right: 10px;
                    }
                    
                    .enhanced-chatbot-container {
                        width: calc(100vw - 20px);
                        height: calc(100vh - 100px);
                        bottom: 90px;
                        right: 0;
                        border-radius: 15px;
                    }
                    
                    .enhanced-chatbot-toggle {
                        width: 50px;
                        height: 50px;
                    }
                    
                    .enhanced-chatbot-toggle i {
                        font-size: 20px;
                    }
                    
                    .enhanced-chatbot-quick-actions {
                        flex-direction: column;
                    }
                    
                    .enhanced-quick-action-btn {
                        justify-content: center;
                    }
                }

                /* Dark mode support */
                @media (prefers-color-scheme: dark) {
                    .enhanced-chatbot-container {
                        background: #1e293b;
                        border-color: rgba(255, 255, 255, 0.1);
                    }
                    
                    .enhanced-chatbot-messages {
                        background: #0f172a;
                    }
                    
                    .enhanced-message-bubble {
                        background: #334155;
                        color: #e2e8f0;
                    }
                    
                    .enhanced-chatbot-input-container {
                        background: #1e293b;
                        border-color: rgba(255, 255, 255, 0.1);
                    }
                    
                    .enhanced-chatbot-input-wrapper {
                        background: #334155;
                        border-color: rgba(255, 255, 255, 0.1);
                    }
                    
                    #enhanced-chatbot-input {
                        color: #e2e8f0;
                    }
                    
                    .enhanced-chatbot-quick-actions {
                        background: #1e293b;
                        border-color: rgba(255, 255, 255, 0.1);
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
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
        if (this.quickActions) {
            this.quickActions.addEventListener('click', (e) => {
                if (e.target.classList.contains('enhanced-quick-action-btn')) {
                    const action = e.target.dataset.action;
                    this.handleQuickAction(action);
                }
            });
        }

        // Close/minimize buttons
        document.getElementById('enhanced-chatbot-close').addEventListener('click', () => this.closeChatbot());
        document.getElementById('enhanced-chatbot-minimize').addEventListener('click', () => this.minimizeChatbot());

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
        messageDiv.className = `enhanced-message enhanced-${message.sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'enhanced-message-avatar';
        avatar.innerHTML = message.sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'enhanced-message-content';

        const bubble = document.createElement('div');
        bubble.className = 'enhanced-message-bubble';
        bubble.innerHTML = `<p>${this.formatMessage(message.content)}</p>`;

        const time = document.createElement('div');
        time.className = 'enhanced-message-time';
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
        return this.formatIndianDate(date);
    }

    formatIndianDate(date) {
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
        if (!this.config.enableTypingIndicator) return;
        
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
            // Keep only last maxMessages
            if (this.messageHistory.length > this.config.maxMessages) {
                this.messageHistory = this.messageHistory.slice(-this.config.maxMessages);
            }
            localStorage.setItem('enhanced_jobwala_chat_history', JSON.stringify(this.messageHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('enhanced_jobwala_chat_history');
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

    // Method to check if user is on a restricted page
    isRestrictedPage() {
        const restrictedPages = [
            'user-dashboard.html',
            'company-dashboard.html',
            'consultancy-dashboard.html',
            'admin.html',
            'dashboard.html'
        ];
        
        const currentPage = window.location.pathname.split('/').pop();
        return restrictedPages.includes(currentPage);
    }

    // Method to destroy the chatbot
    destroy() {
        const widget = document.getElementById('enhanced-chatbot-widget');
        if (widget) {
            widget.remove();
        }
        const styles = document.getElementById('enhanced-chatbot-styles');
        if (styles) {
            styles.remove();
        }
    }
}

// Auto-initialize chatbot on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a restricted page
    const chatbot = new EnhancedJobWalaChatbot();
    
    if (chatbot.isRestrictedPage()) {
        chatbot.destroy();
        return;
    }
    
    // Initialize chatbot
    window.enhancedJobWalaChatbot = chatbot;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedJobWalaChatbot;
}
