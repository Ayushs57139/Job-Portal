// API Service for JobWala Frontend
class JobWalaAPI {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
    }

    // Utility function to format Indian currency
    static formatIndianCurrency(amount) {
        if (!amount || isNaN(amount)) return '₹0';
        return '₹' + parseInt(amount).toLocaleString('en-IN');
    }

    // Utility function to format Indian date (DD-MMM-YYYY)
    static formatIndianDate(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = d.getDate().toString().padStart(2, '0');
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Utility function to format Indian date with time (DD-MMM-YYYY HH:MM)
    static formatIndianDateTime(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = d.getDate().toString().padStart(2, '0');
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUser');
    }

    // Get headers for API requests
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Make API request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        console.log('API Request:', { url, config });
        console.log('Request body:', config.body);

        try {
            console.log('Making fetch request to:', url);
            const response = await fetch(url, config);
            console.log('API Response status:', response.status);
            console.log('API Response headers:', [...response.headers.entries()]);
            
            const data = await response.json();
            console.log('API Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            console.error('API Error details:', error.message);
            throw error;
        }
    }

    // Authentication APIs
    async login(credentials) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        console.log('Login response:', data);
        
        if (data.token) {
            this.setToken(data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            console.log('User stored in localStorage:', data.user);
        }
        
        return data;
    }

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (data.token) {
            this.setToken(data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        
        return data;
    }

    async logout() {
        try {
            await this.request('/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearToken();
        }
    }

    async getCurrentUser() {
        try {
            const data = await this.request('/auth/me');
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            return data.user;
        } catch (error) {
            this.clearToken();
            throw error;
        }
    }

    // Job APIs
    async getJobs(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/jobs?${params}`);
    }

    async getJob(id) {
        return await this.request(`/jobs/${id}`);
    }

    async createJob(jobData) {
        return await this.request('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
    }

    async updateJob(id, jobData) {
        return await this.request(`/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(jobData)
        });
    }

    async deleteJob(id) {
        return await this.request(`/jobs/${id}`, {
            method: 'DELETE'
        });
    }

    async getMyJobs() {
        return await this.request('/jobs/employer/my-jobs');
    }

    async searchJobs(query) {
        return await this.request(`/jobs/search/suggestions?q=${encodeURIComponent(query)}`);
    }

    // Blog APIs
    async getBlogs(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/blogs?${params}`);
    }

    async getBlog(slug) {
        return await this.request(`/blogs/${slug}`);
    }

    async createBlog(blogData) {
        return await this.request('/blogs', {
            method: 'POST',
            body: JSON.stringify(blogData)
        });
    }

    async updateBlog(id, blogData) {
        return await this.request(`/blogs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(blogData)
        });
    }

    async deleteBlog(id) {
        return await this.request(`/blogs/${id}`, {
            method: 'DELETE'
        });
    }

    async getBlogCategories() {
        return await this.request('/blogs/categories/list');
    }

    async getPopularTags() {
        return await this.request('/blogs/tags/popular');
    }

    async likeBlog(id) {
        return await this.request(`/blogs/${id}/like`, {
            method: 'POST'
        });
    }

    async addComment(id, content) {
        return await this.request(`/blogs/${id}/comment`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    // User APIs
    async getUsers(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/users?${params}`);
    }

    async getUser(id) {
        return await this.request(`/users/${id}`);
    }

    async updateProfile(userData) {
        return await this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // Application APIs
    async applyForJob(jobId, applicationData) {
        return await this.request('/applications', {
            method: 'POST',
            body: JSON.stringify({
                job: jobId,
                ...applicationData
            })
        });
    }

    async getMyApplications() {
        return await this.request('/applications/my-applications');
    }

    async getJobApplications(jobId) {
        return await this.request(`/applications/job/${jobId}`);
    }

    async updateApplicationStatus(applicationId, status) {
        return await this.request(`/applications/${applicationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Company APIs
    async getCompanies(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/company?${params}`);
    }

    async getCompany(id) {
        return await this.request(`/company/${id}`);
    }

    async createCompany(companyData) {
        return await this.request('/company', {
            method: 'POST',
            body: JSON.stringify(companyData)
        });
    }

    async updateCompany(id, companyData) {
        return await this.request(`/company/${id}`, {
            method: 'PUT',
            body: JSON.stringify(companyData)
        });
    }

    // Admin APIs
    async getAdminStats() {
        return await this.request('/admin/stats');
    }

    async getAdminDashboard() {
        return await this.request('/admin/dashboard');
    }

    async getAdminAnalytics() {
        return await this.request('/admin/analytics');
    }

    async createJob(jobData) {
        return await this.request('/jobs', 'POST', jobData);
    }

    async updateJob(jobId, jobData) {
        return await this.request(`/jobs/${jobId}`, 'PUT', jobData);
    }

    async getJob(jobId) {
        return await this.request(`/jobs/${jobId}`);
    }

    async getAllUsers(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/admin/users?${params}`);
    }

    async getAllJobs(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/admin/jobs?${params}`);
    }

    async getAllApplications(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/admin/applications?${params}`);
    }

    async updateUserStatus(userId, status) {
        return await this.request(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async updateJobStatus(jobId, status) {
        return await this.request(`/admin/jobs/${jobId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUserFromStorage() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    // Check if user has specific role
    hasRole(role) {
        const user = this.getCurrentUserFromStorage();
        return user && user.userType === role;
    }

    // Check if user has any of the specified roles
    hasAnyRole(roles) {
        const user = this.getCurrentUserFromStorage();
        return user && roles.includes(user.userType);
    }

    // Check if user is employer (company or consultancy)
    isEmployer() {
        return this.hasAnyRole(['company', 'consultancy']);
    }

    // Check if user is admin
    isAdmin() {
        return this.hasAnyRole(['admin', 'superadmin']);
    }
}

// Create global API instance
console.log('Initializing JobWala API service...');
window.api = new JobWalaAPI();
console.log('JobWala API service initialized:', window.api);

// Utility functions for common operations
window.authUtils = {
    // Check if user is logged in
    isLoggedIn() {
        return window.api.isAuthenticated();
    },

    // Get current user
    getCurrentUser() {
        return window.api.getCurrentUserFromStorage();
    },

    // Redirect to login if not authenticated
    requireAuth(redirectTo = 'login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    },

    // Redirect to login if not admin
    requireAdmin(redirectTo = 'login.html') {
        if (!this.isLoggedIn() || !window.api.isAdmin()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    },

    // Redirect to login if not employer
    requireEmployer(redirectTo = 'login.html') {
        if (!this.isLoggedIn() || !window.api.isEmployer()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    },

    // Logout user
    async logout() {
        try {
            await window.api.logout();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect even if logout fails
            window.location.href = 'index.html';
        }
    }
};

// Auto-refresh token if needed
window.addEventListener('load', async () => {
    if (window.api.isAuthenticated()) {
        try {
            await window.api.getCurrentUser();
        } catch (error) {
            console.error('Token validation failed:', error);
            window.api.clearToken();
        }
    }
});
