// Debug script for authentication issues
// This can be added to any page to help debug authentication problems

console.log('=== AUTH DEBUG SCRIPT LOADED ===');

// Function to check authentication state
function debugAuthState() {
    console.log('=== AUTHENTICATION DEBUG ===');
    console.log('Current URL:', window.location.href);
    console.log('Document ready state:', document.readyState);
    console.log('GlobalAuth available:', !!window.globalAuth);
    
    if (window.globalAuth) {
        console.log('GlobalAuth instance:', window.globalAuth);
        console.log('Is authenticated:', window.globalAuth.isAuthenticated);
        console.log('Current user:', window.globalAuth.getCurrentUser());
        console.log('Token:', window.globalAuth.getToken());
    }
    
    // Check localStorage
    console.log('LocalStorage token:', localStorage.getItem('token'));
    console.log('LocalStorage currentUser:', localStorage.getItem('currentUser'));
    
    // Check DOM elements
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    
    console.log('DOM Elements:');
    console.log('authButtons:', authButtons);
    console.log('userMenu:', userMenu);
    console.log('userName:', userName);
    
    if (authButtons) {
        console.log('authButtons display:', getComputedStyle(authButtons).display);
    }
    if (userMenu) {
        console.log('userMenu display:', getComputedStyle(userMenu).display);
    }
    if (userName) {
        console.log('userName text:', userName.textContent);
    }
    
    console.log('=== END DEBUG ===');
}

// Function to force refresh authentication
function forceRefreshAuth() {
    console.log('Force refreshing authentication...');
    if (window.globalAuth) {
        window.globalAuth.refreshAuthState();
        setTimeout(() => {
            debugAuthState();
        }, 200);
    } else {
        console.error('GlobalAuth not available');
    }
}

// Function to simulate login for testing
function simulateLogin() {
    const testUser = {
        _id: 'test123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        userType: 'jobseeker'
    };
    
    const testToken = 'test_token_' + Date.now();
    
    localStorage.setItem('token', testToken);
    localStorage.setItem('currentUser', JSON.stringify(testUser));
    
    console.log('Simulated login with test user');
    forceRefreshAuth();
}

// Function to clear authentication
function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    
    console.log('Cleared authentication data');
    forceRefreshAuth();
}

// Make functions available globally
window.debugAuthState = debugAuthState;
window.forceRefreshAuth = forceRefreshAuth;
window.simulateLogin = simulateLogin;
window.clearAuth = clearAuth;

// Auto-run debug on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, running auth debug...');
    setTimeout(() => {
        debugAuthState();
    }, 1000);
});

console.log('Debug functions available:');
console.log('- debugAuthState() - Check current auth state');
console.log('- forceRefreshAuth() - Force refresh auth');
console.log('- simulateLogin() - Simulate login for testing');
console.log('- clearAuth() - Clear authentication data');
