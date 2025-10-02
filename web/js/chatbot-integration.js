// Simple Chatbot Integration Script for JobWala
(function() {
    'use strict';
    
    // Check if chatbot is already loaded
    if (window.simpleChatbotLoaded) {
        return;
    }
    
    const config = {
        restrictedPages: [
            'user-dashboard.html',
            'company-dashboard.html', 
            'consultancy-dashboard.html',
            'admin.html',
            'dashboard.html'
        ]
    };
    
    function shouldShowChatbot() {
        const currentPage = window.location.pathname.split('/').pop();
        return !config.restrictedPages.some(page => 
            currentPage === page || window.location.pathname.includes(page)
        );
    }
    
    if (!shouldShowChatbot()) {
        return;
    }
    
    function createChatbotHTML() {
        return `
            <div id="simple-chatbot-widget" class="simple-chatbot-widget">
                <div id="simple-chatbot-toggle" class="simple-chatbot-toggle">
                    <i class="fas fa-comments"></i>
                    <span class="simple-chatbot-badge" id="simple-chatbot-badge">1</span>
                </div>
                <div id="simple-chatbot-container" class="simple-chatbot-container">
                    <div class="simple-chatbot-header">
                        <div class="simple-chatbot-avatar"><i class="fas fa-robot"></i></div>
                        <div class="simple-chatbot-info">
                            <h3>JobWala Assistant</h3>
                            <span class="simple-chatbot-status">Online</span>
                        </div>
                        <div class="simple-chatbot-controls">
                            <button id="simple-chatbot-close" class="simple-chatbot-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="simple-chatbot-messages" id="simple-chatbot-messages">
                        <div class="simple-message simple-bot-message">
                            <div class="simple-message-avatar"><i class="fas fa-robot"></i></div>
                            <div class="simple-message-content">
                                <div class="simple-message-bubble">
                                    <p>Hello! I'm your JobWala assistant. How can I help you today?</p>
                                </div>
                                <div class="simple-message-time">Just now</div>
                            </div>
                        </div>
                    </div>
                    <div class="simple-chatbot-quick-actions">
                        <button class="simple-quick-action-btn" data-action="find-jobs">
                            <i class="fas fa-search"></i> Find Jobs
                        </button>
                        <button class="simple-quick-action-btn" data-action="resume-help">
                            <i class="fas fa-file-alt"></i> Resume Help
                        </button>
                        <button class="simple-quick-action-btn" data-action="career-advice">
                            <i class="fas fa-lightbulb"></i> Career Advice
                        </button>
                    </div>
                    <div class="simple-chatbot-input-container">
                        <div class="simple-chatbot-input-wrapper">
                            <input type="text" id="simple-chatbot-input" placeholder="Type your message...">
                            <button id="simple-chatbot-send" class="simple-chatbot-send-btn">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function addChatbotStyles() {
        if (document.getElementById('simple-chatbot-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'simple-chatbot-styles';
        styles.textContent = `
            .simple-chatbot-widget { position: fixed; bottom: 20px; right: 20px; z-index: 10000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .simple-chatbot-toggle { width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; position: relative; }
            .simple-chatbot-toggle:hover { transform: scale(1.1); box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6); }
            .simple-chatbot-toggle i { color: white; font-size: 24px; }
            .simple-chatbot-badge { position: absolute; top: -5px; right: -5px; background: #ff4757; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; animation: simple-pulse 2s infinite; }
            .simple-chatbot-badge.hidden { display: none; }
            @keyframes simple-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
            .simple-chatbot-container { position: absolute; bottom: 80px; right: 0; width: 380px; height: 500px; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); display: none; flex-direction: column; overflow: hidden; }
            .simple-chatbot-container.active { display: flex; animation: simple-slideUp 0.3s ease-out; }
            @keyframes simple-slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            .simple-chatbot-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; display: flex; align-items: center; gap: 12px; color: white; }
            .simple-chatbot-avatar { width: 40px; height: 40px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            .simple-chatbot-avatar i { font-size: 18px; color: white; }
            .simple-chatbot-info { flex: 1; }
            .simple-chatbot-info h3 { margin: 0; font-size: 16px; font-weight: 600; }
            .simple-chatbot-status { font-size: 12px; opacity: 0.8; }
            .simple-chatbot-controls { display: flex; gap: 8px; }
            .simple-chatbot-btn { width: 30px; height: 30px; background: rgba(255, 255, 255, 0.2); border: none; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
            .simple-chatbot-btn:hover { background: rgba(255, 255, 255, 0.3); transform: scale(1.1); }
            .simple-chatbot-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; background: #f8fafc; }
            .simple-message { display: flex; gap: 10px; }
            .simple-user-message { flex-direction: row-reverse; }
            .simple-message-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .simple-bot-message .simple-message-avatar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
            .simple-user-message .simple-message-avatar { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: white; }
            .simple-message-avatar i { font-size: 14px; }
            .simple-message-content { flex: 1; max-width: 80%; }
            .simple-message-bubble { background: white; padding: 12px 16px; border-radius: 18px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); word-wrap: break-word; }
            .simple-user-message .simple-message-bubble { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
            .simple-message-bubble p { margin: 0; line-height: 1.4; font-size: 14px; }
            .simple-message-time { font-size: 11px; color: #94a3b8; margin-top: 4px; text-align: right; }
            .simple-user-message .simple-message-time { text-align: left; }
            .simple-chatbot-quick-actions { padding: 15px 20px; background: white; border-top: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; gap: 8px; }
            .simple-quick-action-btn { background: rgba(102, 126, 234, 0.1); border: 1px solid rgba(102, 126, 234, 0.2); color: #667eea; padding: 8px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 6px; }
            .simple-quick-action-btn:hover { background: rgba(102, 126, 234, 0.2); transform: translateY(-1px); }
            .simple-quick-action-btn i { font-size: 10px; }
            .simple-chatbot-input-container { background: white; border-top: 1px solid #e2e8f0; padding: 15px 20px; }
            .simple-chatbot-input-wrapper { display: flex; gap: 10px; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 25px; padding: 8px 15px; transition: all 0.3s ease; }
            .simple-chatbot-input-wrapper:focus-within { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
            #simple-chatbot-input { flex: 1; border: none; background: transparent; outline: none; font-size: 14px; color: #334155; }
            #simple-chatbot-input::placeholder { color: #94a3b8; }
            .simple-chatbot-send-btn { width: 36px; height: 36px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; flex-shrink: 0; }
            .simple-chatbot-send-btn:hover { transform: scale(1.1); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
            @media (max-width: 480px) { .simple-chatbot-widget { bottom: 10px; right: 10px; } .simple-chatbot-container { width: calc(100vw - 20px); height: calc(100vh - 100px); bottom: 90px; right: 0; border-radius: 15px; } .simple-chatbot-toggle { width: 50px; height: 50px; } .simple-chatbot-toggle i { font-size: 20px; } }
        `;
        document.head.appendChild(styles);
    }
    
    function generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('job') || lowerMessage.includes('work') || lowerMessage.includes('career')) {
            return "I can help you find the perfect job! What type of position are you looking for? You can search by keywords, location, or industry.";
        }
        if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
            return "I can help you create an outstanding resume! Our resume builder has professional templates. Would you like me to guide you through the process?";
        }
        if (lowerMessage.includes('company') || lowerMessage.includes('employer')) {
            return "I can help you research companies and find the best employers! What type of company are you interested in?";
        }
        if (lowerMessage.includes('skill') || lowerMessage.includes('experience')) {
            return "Skills are your career superpowers! I can help you identify your strengths and suggest skills to develop.";
        }
        if (lowerMessage.includes('interview')) {
            return "Interview preparation is crucial! I can help you with common questions, tips for success, and strategies to make a great impression.";
        }
        if (lowerMessage.includes('salary') || lowerMessage.includes('pay')) {
            return "Salary discussions are important! I can help you research market rates and prepare for salary negotiations.";
        }
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! Welcome to JobWala! I'm here to help you with your career journey. How can I assist you today?";
        }
        if (lowerMessage.includes('help')) {
            return "I'm here to help with all aspects of your job search! I can assist with finding jobs, building resumes, company research, interview prep, and career advice.";
        }
        return "That's interesting! I'm here to help with your job search and career development. Could you tell me more about what you're looking for?";
    }
    
    function addMessage(content, sender) {
        const messagesContainer = document.getElementById('simple-chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `simple-message simple-${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'simple-message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'simple-message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'simple-message-bubble';
        bubble.innerHTML = `<p>${content}</p>`;
        
        const time = document.createElement('div');
        time.className = 'simple-message-time';
        time.textContent = 'Just now';
        
        contentDiv.appendChild(bubble);
        contentDiv.appendChild(time);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function initChatbot() {
        // Remove existing chatbot if any
        const existing = document.getElementById('simple-chatbot-widget');
        if (existing) {
            existing.remove();
        }
        
        // Add HTML to page
        document.body.insertAdjacentHTML('beforeend', createChatbotHTML());
        
        // Add styles
        addChatbotStyles();
        
        // Get elements
        const toggle = document.getElementById('simple-chatbot-toggle');
        const container = document.getElementById('simple-chatbot-container');
        const closeBtn = document.getElementById('simple-chatbot-close');
        const input = document.getElementById('simple-chatbot-input');
        const sendBtn = document.getElementById('simple-chatbot-send');
        const badge = document.getElementById('simple-chatbot-badge');
        const quickActions = document.querySelectorAll('.simple-quick-action-btn');
        
        // Toggle chatbot
        toggle.addEventListener('click', () => {
            container.classList.toggle('active');
            if (container.classList.contains('active')) {
                badge.classList.add('hidden');
                input.focus();
            }
        });
        
        // Close chatbot
        closeBtn.addEventListener('click', () => {
            container.classList.remove('active');
        });
        
        // Send message
        function sendMessage() {
            const message = input.value.trim();
            if (!message) return;
            
            addMessage(message, 'user');
            input.value = '';
            
            setTimeout(() => {
                const response = generateResponse(message);
                addMessage(response, 'bot');
            }, 1000);
        }
        
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Quick actions
        quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                let response = '';
                
                switch(action) {
                    case 'find-jobs':
                        response = 'I can help you find great job opportunities! What type of position are you looking for?';
                        break;
                    case 'resume-help':
                        response = 'Let\'s create an amazing resume! I can guide you through our resume builder with professional templates.';
                        break;
                    case 'career-advice':
                        response = 'I\'d love to provide career guidance! What specific area would you like advice on?';
                        break;
                }
                
                addMessage(response, 'bot');
            });
        });
        
        console.log('Simple chatbot initialized successfully!');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
    
    // Mark as loaded
    window.simpleChatbotLoaded = true;
    
    // Expose global methods
    window.openSimpleChatbot = function() {
        const container = document.getElementById('simple-chatbot-container');
        if (container) container.classList.add('active');
    };
    window.closeSimpleChatbot = function() {
        const container = document.getElementById('simple-chatbot-container');
        if (container) container.classList.remove('active');
    };
})();
