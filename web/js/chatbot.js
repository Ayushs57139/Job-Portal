// JobWala Chatbot Widget
class JobWalaChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createWidget();
        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    createWidget() {
        // Create chatbot button
        const chatbotButton = document.createElement('div');
        chatbotButton.id = 'chatbotButton';
        chatbotButton.innerHTML = '<i class="fas fa-robot"></i>';
        chatbotButton.className = 'chatbot-button';
        
        // Create chatbot modal
        const chatbotModal = document.createElement('div');
        chatbotModal.id = 'chatbotModal';
        chatbotModal.className = 'chatbot-modal';
        chatbotModal.innerHTML = `
            <div class="chatbot-header">
                <div class="chatbot-title">
                    <i class="fas fa-robot"></i>
                    <span>JobWala Assistant</span>
                </div>
                <button class="chatbot-close" onclick="chatbot.toggle()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="chatbot-messages" id="chatbotMessages">
                <!-- Messages will be added here -->
            </div>
            <div class="chatbot-input">
                <input type="text" id="chatbotInput" placeholder="Type your message..." />
                <button onclick="chatbot.sendMessage()">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        // Add styles
        this.addStyles();

        // Append to body
        document.body.appendChild(chatbotButton);
        document.body.appendChild(chatbotModal);
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .chatbot-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: #ff6b35;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.3s ease;
                z-index: 1000;
                font-size: 24px;
            }

            .chatbot-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            }

            .chatbot-modal {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                display: none;
                flex-direction: column;
                z-index: 1001;
                overflow: hidden;
            }

            .chatbot-modal.open {
                display: flex;
            }

            .chatbot-header {
                background: #ff6b35;
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chatbot-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
            }

            .chatbot-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: background 0.3s;
            }

            .chatbot-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .chatbot-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #f8f9fa;
            }

            .message {
                margin-bottom: 15px;
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }

            .message.user {
                flex-direction: row-reverse;
            }

            .message-content {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
            }

            .message.bot .message-content {
                background: white;
                color: #333;
                border: 1px solid #e9ecef;
            }

            .message.user .message-content {
                background: #ff6b35;
                color: white;
            }

            .message-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                flex-shrink: 0;
            }

            .message.bot .message-avatar {
                background: #ff6b35;
                color: white;
            }

            .message.user .message-avatar {
                background: #e9ecef;
                color: #ff6b35;
            }

            .quick-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
            }

            .quick-action-btn {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                padding: 6px 12px;
                border-radius: 15px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s;
            }

            .quick-action-btn:hover {
                background: #ff6b35;
                color: white;
                border-color: #ff6b35;
            }

            .chatbot-input {
                padding: 15px 20px;
                background: white;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 10px;
            }

            .chatbot-input input {
                flex: 1;
                padding: 10px 15px;
                border: 1px solid #e9ecef;
                border-radius: 20px;
                font-size: 14px;
                outline: none;
            }

            .chatbot-input input:focus {
                border-color: #ff6b35;
            }

            .chatbot-input button {
                background: #ff6b35;
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }

            .chatbot-input button:hover {
                background: #e55a2b;
                transform: scale(1.05);
            }

            .typing-indicator {
                display: none;
                align-items: center;
                gap: 5px;
                color: #666;
                font-size: 12px;
                margin-top: 10px;
            }

            .typing-dots {
                display: flex;
                gap: 3px;
            }

            .typing-dot {
                width: 6px;
                height: 6px;
                background: #ff6b35;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }

            .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                }
                30% {
                    transform: translateY(-10px);
                }
            }

            @media (max-width: 768px) {
                .chatbot-modal {
                    width: calc(100vw - 40px);
                    right: 20px;
                    left: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Toggle chatbot
        document.getElementById('chatbotButton').addEventListener('click', () => this.toggle());
        
        // Send message on Enter
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.isOpen) {
                this.sendMessage();
            }
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const modal = document.getElementById('chatbotModal');
        const button = document.getElementById('chatbotButton');
        
        if (this.isOpen) {
            modal.classList.add('open');
            button.style.transform = 'rotate(45deg)';
            document.getElementById('chatbotInput').focus();
        } else {
            modal.classList.remove('open');
            button.style.transform = 'rotate(0deg)';
        }
    }

    addWelcomeMessage() {
        const messagesContainer = document.getElementById('chatbotMessages');
        messagesContainer.innerHTML = `
            <div class="message bot">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>👋 Hi! I'm your JobWala assistant. How can I help you today?</p>
                    <div class="quick-actions">
                        <button class="quick-action-btn" onclick="chatbot.sendQuickMessage('How do I search for jobs?')">🔍 Job Search</button>
                        <button class="quick-action-btn" onclick="chatbot.sendQuickMessage('How do I create an account?')">👤 Account</button>
                        <button class="quick-action-btn" onclick="chatbot.sendQuickMessage('How do I build a resume?')">📄 Resume</button>
                        <button class="quick-action-btn" onclick="chatbot.sendQuickMessage('What are the features?')">✨ Features</button>
                    </div>
                </div>
            </div>
        `;
    }

    sendQuickMessage(message) {
        document.getElementById('chatbotInput').value = message;
        this.sendMessage();
    }

    sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (message === '') return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Generate response
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 1000 + Math.random() * 1000);
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const avatar = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-content">
                <p>${content}</p>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateResponse(userMessage) {
        const responses = {
            greetings: [
                "Hello! How can I help you today?",
                "Hi there! What can I assist you with?",
                "Hey! I'm here to help you with JobWala.",
                "Welcome! How may I help you?"
            ],
            jobSearch: [
                "To search for jobs, use the search bar on the homepage. You can search by keywords, location, and experience level. You can also browse by categories like Remote, MNC, Banking & Finance, etc.",
                "Job search is easy! Just enter your skills, location, and experience in the search bar. You can also filter by job type, salary range, and company size.",
                "Use our advanced search filters to find the perfect job. You can search by job title, company, location, salary, and more!"
            ],
            account: [
                "To create an account, click the 'Register' button in the top right corner. Choose your account type (Job Seeker, Company, or Consultancy) and fill in your details.",
                "Creating an account is simple! Click 'Register' and select whether you're a job seeker or employer. Then follow the registration process.",
                "You can register as a Job Seeker, Company, or Consultancy. Each account type has different features tailored to your needs."
            ],
            resume: [
                "To build a resume, click on 'Resume' in the navigation menu or the 'View details' button in the resume section. You can choose from professional templates and customize every detail.",
                "Our resume builder offers multiple templates and allows you to create a professional resume in minutes. You can also edit existing resumes.",
                "Build your resume using our templates, or upload an existing one to edit. We have Professional, Creative, and Minimal designs to choose from."
            ],
            features: [
                "JobWala offers: Job search with advanced filters, Resume builder with templates, Company profiles, Application tracking, Career guidance, Interview preparation, and much more!",
                "Our features include: Thousands of job listings, Professional resume builder, Company insights, Application management, Career advice, and 24/7 support.",
                "Key features: Smart job matching, Resume templates, Company reviews, Application status tracking, Career guidance, Interview prep, and personalized recommendations."
            ],
            login: [
                "To login, click the 'Login' button in the top right corner. You can login as a Job Seeker, Employer, or Admin.",
                "Login is simple! Click 'Login' and select your account type. Enter your email and password to access your account.",
                "You can login with your email and password. Make sure to select the correct account type (Job Seeker, Employer, or Admin)."
            ],
            help: [
                "I'm here to help! You can ask me about job searching, account creation, resume building, website features, or any other questions about JobWala.",
                "Feel free to ask me anything about using JobWala. I can help with navigation, features, account management, and more!",
                "I can assist you with job search, resume building, account setup, website navigation, and answer any questions you have about our platform."
            ],
            default: [
                "I'm not sure I understand. Could you please rephrase your question? I can help with job search, account creation, resume building, and website features.",
                "Let me help you better. You can ask me about job searching, creating an account, building resumes, or using our features.",
                "I'd be happy to help! Try asking about job search, account setup, resume building, or our website features."
            ]
        };

        const keywordMap = {
            'hello': 'greetings',
            'hi': 'greetings',
            'hey': 'greetings',
            'search': 'jobSearch',
            'job': 'jobSearch',
            'find': 'jobSearch',
            'register': 'account',
            'signup': 'account',
            'account': 'account',
            'resume': 'resume',
            'cv': 'resume',
            'features': 'features',
            'login': 'login',
            'signin': 'login',
            'help': 'help',
            'support': 'help'
        };

        const lowerMessage = userMessage.toLowerCase();
        
        // Find matching keyword
        for (const [keyword, category] of Object.entries(keywordMap)) {
            if (lowerMessage.includes(keyword)) {
                const categoryResponses = responses[category];
                return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
            }
        }

        // Check for specific patterns
        if (lowerMessage.includes('how to') || lowerMessage.includes('how do')) {
            if (lowerMessage.includes('search') || lowerMessage.includes('job')) {
                return responses.jobSearch[Math.floor(Math.random() * responses.jobSearch.length)];
            } else if (lowerMessage.includes('account') || lowerMessage.includes('register')) {
                return responses.account[Math.floor(Math.random() * responses.account.length)];
            } else if (lowerMessage.includes('resume')) {
                return responses.resume[Math.floor(Math.random() * responses.resume.length)];
            }
        }

        // Default response
        const defaultResponses = responses.default;
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <span>Assistant is typing</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize chatbot when DOM is loaded
let chatbot;
document.addEventListener('DOMContentLoaded', function() {
    chatbot = new JobWalaChatbot();
});
