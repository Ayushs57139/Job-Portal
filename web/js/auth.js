// Global Authentication System for JobWala
class GlobalAuth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = this.getUserData();
        this.isAuthenticated = !!(this.token && this.user);
        
        // Initialize on load
        this.init();
    }
    
    getUserData() {
        try {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }
    
    init() {
        // Check authentication status on page load
        this.checkAuthStatus();
        
        // Set up global event listeners
        this.setupEventListeners();
    }
    
    checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = this.getUserData();
        
        console.log('Checking auth status - Token:', !!token, 'User:', !!user);
        
        if (token && user) {
            this.token = token;
            this.user = user;
            this.isAuthenticated = true;
            this.showUserMenu();
            console.log('User authenticated:', user.firstName || user.name);
        } else {
            this.isAuthenticated = false;
            this.showAuthButtons();
            console.log('User not authenticated - Token:', token, 'User:', user);
        }
    }
    
    showUserMenu() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        
        console.log('Showing user menu - authButtons:', !!authButtons, 'userMenu:', !!userMenu, 'userName:', !!userName);
        
        if (authButtons && userMenu && userName) {
            authButtons.style.display = 'none';
            userMenu.style.display = 'flex';
            
            // Display user's first name or full name
            const displayName = this.user.firstName || this.user.name || 'User';
            userName.textContent = `Hi, ${displayName}`;
            console.log('User menu displayed for:', displayName);
        } else {
            console.error('Required elements not found for user menu');
            console.log('authButtons:', authButtons);
            console.log('userMenu:', userMenu);
            console.log('userName:', userName);
        }
    }
    
    showAuthButtons() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        
        console.log('Showing auth buttons - authButtons:', !!authButtons, 'userMenu:', !!userMenu);
        
        if (authButtons && userMenu) {
            authButtons.style.display = 'flex';
            userMenu.style.display = 'none';
            console.log('Auth buttons displayed');
        } else {
            console.error('Required elements not found for auth buttons');
            console.log('authButtons:', authButtons);
            console.log('userMenu:', userMenu);
        }
    }
    
    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdownMenu');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }
    
    logout() {
        // Clear all user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        // Update state
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        
        // Show auth buttons
        this.showAuthButtons();
        
        // Close dropdown
        const dropdown = document.getElementById('userDropdownMenu');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
        
        // Redirect to homepage
        window.location.href = 'index.html';
    }
    
    setupEventListeners() {
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            const userDropdown = document.getElementById('userDropdownMenu');
            const userDropdownToggle = document.querySelector('.user-dropdown-toggle');
            
            if (userDropdown && userDropdownToggle) {
                if (!userDropdown.contains(event.target) && !userDropdownToggle.contains(event.target)) {
                    userDropdown.classList.remove('show');
                }
            }
        });
        
        // Listen for storage changes (for multi-tab sync)
        window.addEventListener('storage', (event) => {
            if (event.key === 'token' || event.key === 'currentUser') {
                this.checkAuthStatus();
            }
        });
    }
    
    // Method to handle login from other pages
    handleLogin(loginData) {
        if (loginData.token && loginData.user) {
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('currentUser', JSON.stringify(loginData.user));
            
            // Update state
            this.token = loginData.token;
            this.user = loginData.user;
            this.isAuthenticated = true;
            
            // Show user menu
            this.showUserMenu();
            
            return true;
        }
        return false;
    }
    
    // Method to check if user is authenticated
    isLoggedIn() {
        return this.isAuthenticated;
    }
    
    // Method to get current user
    getCurrentUser() {
        return this.user;
    }
    
    // Method to get token
    getToken() {
        return this.token;
    }
    
    // Method to require authentication (redirect to login if not authenticated)
    requireAuth(redirectUrl = 'login.html') {
        if (!this.isAuthenticated) {
            // Store the current page URL to redirect back after login
            localStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
    
    // Method to force refresh authentication state
    refreshAuthState() {
        console.log('Refreshing authentication state...');
        this.checkAuthStatus();
    }
    
    // Method to force refresh with delay (useful for page navigation)
    refreshAuthStateDelayed() {
        console.log('Refreshing authentication state with delay...');
        setTimeout(() => {
            this.checkAuthStatus();
        }, 100);
    }
    
    // Method to debug authentication state
    debugAuthState() {
        console.log('=== AUTH DEBUG ===');
        console.log('Token:', localStorage.getItem('token'));
        console.log('Current User:', localStorage.getItem('currentUser'));
        console.log('Is Authenticated:', this.isAuthenticated);
        console.log('User Object:', this.user);
        console.log('==================');
    }
}

// Create global instance
window.globalAuth = new GlobalAuth();

// Global functions for backward compatibility
function checkAuthStatus() {
    return window.globalAuth.checkAuthStatus();
}

function showUserMenu(userData) {
    if (userData) {
        window.globalAuth.user = userData;
    }
    return window.globalAuth.showUserMenu();
}

function showAuthButtons() {
    return window.globalAuth.showAuthButtons();
}

function toggleUserDropdown() {
    return window.globalAuth.toggleUserDropdown();
}

function logout() {
    return window.globalAuth.logout();
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing auth...');
    // The global auth instance is already created, just ensure it's initialized
    if (window.globalAuth) {
        window.globalAuth.init();
        // Also refresh with delay to ensure elements are ready
        window.globalAuth.refreshAuthStateDelayed();
    } else {
        // If for some reason globalAuth is not available, create it
        console.warn('GlobalAuth not found, creating new instance');
        window.globalAuth = new GlobalAuth();
    }
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded, initialize immediately
    console.log('DOM already loaded, initializing auth immediately...');
    if (window.globalAuth) {
        window.globalAuth.init();
        window.globalAuth.refreshAuthStateDelayed();
    } else {
        window.globalAuth = new GlobalAuth();
    }
}

// Additional fallback for window load event
window.addEventListener('load', function() {
    console.log('Window loaded, ensuring auth is initialized...');
    if (window.globalAuth) {
        window.globalAuth.refreshAuthStateDelayed();
    }
});
