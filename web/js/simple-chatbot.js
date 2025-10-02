// Simple Chatbot for JobWala
// This is a minimal chatbot implementation

(function() {
    'use strict';
    
    console.log('Simple chatbot loaded');
    
    // Simple chatbot functionality
    window.SimpleChatbot = {
        init: function() {
            console.log('Simple chatbot initialized');
        },
        
        open: function() {
            console.log('Simple chatbot opened');
        },
        
        close: function() {
            console.log('Simple chatbot closed');
        }
    };
    
    // Mark as loaded
    window.simpleChatbotLoaded = true;
    console.log('Simple chatbot ready');
})();
