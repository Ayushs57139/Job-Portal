// User Dashboard JavaScript
class UserDashboard {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'overview';
        this.userData = {
            applications: [],
            savedJobs: [],
            jobs: []
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
        this.loadUserData();
    }

    setupEventListeners() {
        // Sidebar toggle
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });

        // Menu navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Profile form
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // Settings form
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });
    }

    async checkAuth() {
        // Use new API service
        if (!window.authUtils || !window.authUtils.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        try {
            this.currentUser = window.authUtils.getCurrentUser();
            
            // Redirect employers to their specific dashboards
            if (this.currentUser.userType === 'employer') {
                if (this.currentUser.employerType === 'consultancy') {
                    window.location.href = 'consultancy-dashboard.html';
                    return;
                } else if (this.currentUser.employerType === 'company') {
                    window.location.href = 'company-dashboard.html';
                    return;
                }
            }
            
            this.updateUserInfo();
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'login.html';
        }
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            document.getElementById('userAvatar').textContent = this.currentUser.firstName.charAt(0).toUpperCase();
            document.getElementById('profileAvatar').textContent = this.currentUser.firstName.charAt(0).toUpperCase();
            document.getElementById('profileName').textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            document.getElementById('profileEmail').textContent = this.currentUser.email;
            document.getElementById('profileLocation').textContent = this.currentUser.profile?.currentLocation || 'Not specified';
            
            // Update profile badges
            const badgesContainer = document.getElementById('profileBadges');
            badgesContainer.innerHTML = `
                <span class="badge ${this.currentUser.userType}">${this.currentUser.userType}</span>
                ${this.currentUser.isEmailVerified ? '<span class="badge verified">Verified</span>' : ''}
            `;
        }
    }

    navigateToPage(page) {
        console.log('navigateToPage called with page:', page);
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        const menuItem = document.querySelector(`[data-page="${page}"]`);
        if (menuItem) {
            menuItem.classList.add('active');
        } else {
            console.log('Menu item not found for page:', page);
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
        });

        // Show current page
        const targetPage = document.getElementById(`${page}Page`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            console.log('Page shown:', page);
        } else {
            console.log('Page not found:', `${page}Page`);
        }
        
        document.getElementById('pageTitle').textContent = this.getPageTitle(page);
        this.currentPage = page;

        // Load page data
        switch (page) {
            case 'overview':
                this.loadOverview();
                break;
            case 'profile':
                this.loadProfile();
                break;
            case 'applications':
                this.loadApplications();
                break;
            case 'jobs':
                this.loadJobs();
                break;
            case 'saved':
                this.loadSavedJobs();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    getPageTitle(page) {
        const titles = {
            overview: 'Dashboard Overview',
            profile: 'Profile Settings',
            applications: 'My Applications',
            jobs: 'Available Jobs',
            saved: 'Saved Jobs',
            settings: 'Settings'
        };
        return titles[page] || 'Dashboard';
    }

    async loadUserData() {
        try {
            // Load applications
            const applicationsResponse = await this.apiCall('/api/applications/my-applications', 'GET');
            this.userData.applications = applicationsResponse.applications || [];

            // Load jobs
            const jobsResponse = await this.apiCall('/api/jobs', 'GET');
            this.userData.jobs = jobsResponse.jobs || [];

            // Load saved jobs (if endpoint exists)
            try {
                const savedResponse = await this.apiCall('/api/users/saved-jobs', 'GET');
                this.userData.savedJobs = savedResponse.savedJobs || [];
            } catch (error) {
                console.log('Saved jobs endpoint not available');
                this.userData.savedJobs = [];
            }

            this.updateDashboardStats();
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }

    updateDashboardStats() {
        // Update statistics
        document.getElementById('totalApplications').textContent = this.userData.applications.length;
        document.getElementById('savedJobs').textContent = this.userData.savedJobs.length;
        document.getElementById('availableJobs').textContent = this.userData.jobs.length;
        
        // Calculate profile completion
        const profileCompletion = this.calculateProfileCompletion();
        document.getElementById('profileCompletion').textContent = `${profileCompletion}%`;
    }

    calculateProfileCompletion() {
        if (!this.currentUser) return 0;
        
        const profile = this.currentUser.profile || {};
        let completion = 0;
        const totalFields = 8;
        
        if (profile.bio) completion++;
        if (profile.skills && profile.skills.length > 0) completion++;
        if (profile.currentLocation) completion++;
        if (profile.experience > 0) completion++;
        if (profile.education && profile.education.length > 0) completion++;
        if (profile.workExperience && profile.workExperience.length > 0) completion++;
        if (profile.resume) completion++;
        if (this.currentUser.phone) completion++;
        
        return Math.round((completion / totalFields) * 100);
    }

    async loadOverview() {
        try {
            await this.loadUserData();
            this.updateDashboardStats();
            this.updateRecentActivity();
            this.updateProfileSummary();
            this.updateQuickActions();
        } catch (error) {
            console.error('Error loading overview:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    updateProfileSummary() {
        const profileSummary = document.getElementById('profileSummary');
        if (!profileSummary || !this.currentUser) return;

        const profile = this.currentUser.profile || {};
        const skills = profile.skills || [];
        const experience = profile.experience || 0;
        const location = profile.currentLocation || {};

        profileSummary.innerHTML = `
            <div class="profile-card">
                <div class="profile-header">
                    <div class="avatar large">${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}</div>
                    <div class="profile-info">
                        <h3>${this.currentUser.firstName} ${this.currentUser.lastName}</h3>
                        <p>${profile.bio || 'No bio available'}</p>
                        <div class="profile-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${location.city || 'N/A'}, ${location.state || 'N/A'}</span>
                            <span><i class="fas fa-briefcase"></i> ${experience} years experience</span>
                        </div>
                    </div>
                </div>
                <div class="profile-skills">
                    <h4>Skills</h4>
                    <div class="skills-list">
                        ${skills.slice(0, 5).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        ${skills.length > 5 ? `<span class="skill-more">+${skills.length - 5} more</span>` : ''}
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="btn btn-primary" onclick="userDashboard.editProfile()">
                        <i class="fas fa-edit"></i> Edit Profile
                    </button>
                    <button class="btn btn-secondary" onclick="userDashboard.viewFullProfile()">
                        <i class="fas fa-eye"></i> View Full Profile
                    </button>
                </div>
            </div>
        `;
    }

    updateQuickActions() {
        const quickActions = document.getElementById('quickActions');
        if (!quickActions) return;

        quickActions.innerHTML = `
            <div class="quick-actions-grid">
                <div class="action-card" onclick="userDashboard.searchJobs()">
                    <i class="fas fa-search"></i>
                    <h4>Search Jobs</h4>
                    <p>Find your next opportunity</p>
                </div>
                <div class="action-card" onclick="userDashboard.updateProfile()">
                    <i class="fas fa-user-edit"></i>
                    <h4>Update Profile</h4>
                    <p>Keep your profile current</p>
                </div>
                <div class="action-card" onclick="userDashboard.viewApplications()">
                    <i class="fas fa-file-alt"></i>
                    <h4>My Applications</h4>
                    <p>Track your applications</p>
                </div>
                <div class="action-card" onclick="userDashboard.viewSavedJobs()">
                    <i class="fas fa-bookmark"></i>
                    <h4>Saved Jobs</h4>
                    <p>Jobs you've saved</p>
                </div>
            </div>
        `;
    }

    updateRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        const activities = [];

        // Add recent applications
        this.userData.applications.slice(0, 3).forEach(app => {
            activities.push({
                icon: 'fas fa-file-alt',
                title: 'Application Submitted',
                description: `Applied for ${app.job?.title || 'a job'}`,
                time: this.formatTimeAgo(new Date(app.createdAt))
            });
        });

        // Add recent saved jobs
        this.userData.savedJobs.slice(0, 2).forEach(job => {
            activities.push({
                icon: 'fas fa-bookmark',
                title: 'Job Saved',
                description: `Saved ${job.title || 'a job'}`,
                time: this.formatTimeAgo(new Date(job.createdAt))
            });
        });

        if (activities.length === 0) {
            activityContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No recent activity</p>';
            return;
        }

        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }

    async loadProfile() {
        if (!this.currentUser) return;

        // Populate form with current user data
        document.getElementById('firstName').value = this.currentUser.firstName || '';
        document.getElementById('lastName').value = this.currentUser.lastName || '';
        document.getElementById('email').value = this.currentUser.email || '';
        document.getElementById('phone').value = this.currentUser.phone || '';
        document.getElementById('bio').value = this.currentUser.profile?.bio || '';
        document.getElementById('currentLocation').value = this.currentUser.profile?.currentLocation || '';
        document.getElementById('skills').value = this.currentUser.profile?.skills?.join(', ') || '';
    }

    async saveProfile() {
        try {
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                phone: document.getElementById('phone').value,
                profile: {
                    bio: document.getElementById('bio').value,
                    currentLocation: document.getElementById('currentLocation').value,
                    skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s)
                }
            };

            const response = await this.apiCall('/api/auth/profile', 'PUT', formData);
            this.currentUser = response.user;
            this.updateUserInfo();
            this.showSuccess('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to save profile:', error);
            this.showError('Failed to save profile');
        }
    }

    async loadApplications() {
        try {
            await this.loadUserData();
            this.updateApplicationsList();
        } catch (error) {
            console.error('Error loading applications:', error);
            this.showError('Failed to load applications');
        }
    }

    updateApplicationsList() {
        const applicationsContainer = document.getElementById('applicationsList');
        if (!applicationsContainer) return;

        if (this.userData.applications.length === 0) {
            applicationsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>No applications found</h3>
                    <p>You haven't applied to any jobs yet.</p>
                    <button class="btn btn-primary" onclick="userDashboard.searchJobs()">
                        <i class="fas fa-search"></i> Search Jobs
                    </button>
                </div>
            `;
            return;
        }

        applicationsContainer.innerHTML = `
            <div class="applications-header">
                <h3>My Applications (${this.userData.applications.length})</h3>
                <div class="filter-options">
                    <select id="statusFilter" onchange="userDashboard.filterApplications()">
                        <option value="">All Status</option>
                        <option value="applied">Applied</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                    </select>
                </div>
            </div>
            <div class="applications-list">
                ${this.userData.applications.map(application => `
                    <div class="application-card">
                        <div class="application-header">
                            <div class="job-info">
                                <h4>${application.job?.title || 'Job Title'}</h4>
                                <p>${application.job?.company?.name || 'Company Name'}</p>
                                <div class="job-meta">
                                    <span><i class="fas fa-map-marker-alt"></i> ${application.job?.location?.city || 'N/A'}, ${application.job?.location?.state || 'N/A'}</span>
                                    <span><i class="fas fa-briefcase"></i> ${application.job?.jobType || 'N/A'}</span>
                                </div>
                            </div>
                            <div class="application-status">
                                <span class="status-badge status-${application.status || 'applied'}">${application.status || 'Applied'}</span>
                                <p class="applied-date">Applied ${application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                        <div class="application-actions">
                            <button class="btn btn-sm btn-primary" onclick="userDashboard.viewApplication('${application._id}')">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="userDashboard.withdrawApplication('${application._id}')">
                                <i class="fas fa-times"></i> Withdraw
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async loadJobs() {
        const jobsList = document.getElementById('jobsList');
        
        if (this.userData.jobs.length === 0) {
            jobsList.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No jobs available</p>';
            return;
        }

        jobsList.innerHTML = this.userData.jobs.slice(0, 10).map(job => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-briefcase"></i>
                </div>
                <div class="activity-content">
                    <h4>${job.title}</h4>
                    <p>${job.company?.name || 'Unknown Company'} • ${job.location?.city || 'Unknown Location'} • ${this.formatSalary(job.salary)}</p>
                </div>
                <div class="activity-time">
                    <button class="btn btn-primary btn-sm" onclick="userDashboard.applyToJob('${job._id}')">Apply</button>
                </div>
            </div>
        `).join('');
    }

    async loadSavedJobs() {
        const savedJobsList = document.getElementById('savedJobsList');
        
        if (this.userData.savedJobs.length === 0) {
            savedJobsList.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No saved jobs</p>';
            return;
        }

        savedJobsList.innerHTML = this.userData.savedJobs.map(job => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-bookmark"></i>
                </div>
                <div class="activity-content">
                    <h4>${job.title}</h4>
                    <p>${job.company?.name || 'Unknown Company'} • ${job.location?.city || 'Unknown Location'} • ${this.formatSalary(job.salary)}</p>
                </div>
                <div class="activity-time">
                    <button class="btn btn-warning btn-sm" onclick="userDashboard.removeSavedJob('${job._id}')">Remove</button>
                </div>
            </div>
        `).join('');
    }

    async loadSettings() {
        if (!this.currentUser) return;

        const notifications = this.currentUser.profile?.notifications || {};
        document.getElementById('emailJobAlerts').checked = notifications.email?.jobAlerts ?? true;
        document.getElementById('emailApplicationUpdates').checked = notifications.email?.applicationUpdates ?? true;
        document.getElementById('emailMarketing').checked = notifications.email?.marketing ?? false;
    }

    async saveSettings() {
        try {
            const formData = {
                profile: {
                    notifications: {
                        email: {
                            jobAlerts: document.getElementById('emailJobAlerts').checked,
                            applicationUpdates: document.getElementById('emailApplicationUpdates').checked,
                            marketing: document.getElementById('emailMarketing').checked
                        }
                    }
                }
            };

            await this.apiCall('/api/auth/profile', 'PUT', formData);
            this.showSuccess('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showError('Failed to save settings');
        }
    }

    async applyToJob(jobId) {
        try {
            await this.apiCall('/api/applications', 'POST', { job: jobId });
            this.showSuccess('Application submitted successfully!');
            this.loadUserData(); // Refresh data
        } catch (error) {
            console.error('Failed to apply to job:', error);
            this.showError('Failed to apply to job');
        }
    }

    async removeSavedJob(jobId) {
        try {
            await this.apiCall(`/api/users/saved-jobs/${jobId}`, 'DELETE');
            this.showSuccess('Job removed from saved list!');
            this.loadUserData(); // Refresh data
        } catch (error) {
            console.error('Failed to remove saved job:', error);
            this.showError('Failed to remove saved job');
        }
    }

    getStatusColor(status) {
        const colors = {
            pending: '#fff3cd',
            reviewed: '#d1ecf1',
            shortlisted: '#d4edda',
            rejected: '#f8d7da',
            hired: '#d4edda'
        };
        return colors[status] || '#f8f9fa';
    }

    formatSalary(salary) {
        if (!salary) return 'Salary not specified';
        const { min, max, currency } = salary;
        return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return date.toLocaleDateString();
    }

    async apiCall(endpoint, method = 'GET', data = null) {
        const token = localStorage.getItem('token');
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'include'
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`http://localhost:5000${endpoint}`, config);
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { message: errorText || 'API call failed' };
                }
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
            }
            throw error;
        }
    }

    showSuccess(message) {
        // Simple success notification
        alert(message);
    }

    showError(message) {
        // Simple error notification
        alert('Error: ' + message);
    }

    logout() {
        window.authUtils.logout();
    }

    // Action Methods
    searchJobs() {
        window.location.href = 'index.html';
    }

    editProfile() {
        this.navigateToPage('profile');
    }

    updateProfile() {
        this.navigateToPage('profile');
    }

    viewFullProfile() {
        this.navigateToPage('profile');
    }

    viewApplications() {
        this.navigateToPage('applications');
    }

    viewSavedJobs() {
        this.navigateToPage('jobs');
    }

    async viewApplication(applicationId) {
        try {
            const response = await this.apiCall(`/api/applications/${applicationId}`, 'GET');
            if (response.success) {
                this.showApplicationDetails(response.application);
            } else {
                this.showError('Failed to load application details');
            }
        } catch (error) {
            console.error('Error viewing application:', error);
            this.showError('Failed to load application details');
        }
    }

    showApplicationDetails(application) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2>Application Details</h2>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="application-details">
                        <div class="job-header">
                            <h3>${application.job?.title || 'Job Title'}</h3>
                            <p>${application.job?.company?.name || 'Company Name'}</p>
                        </div>
                        <div class="application-content">
                            <h4>Your Cover Letter</h4>
                            <p>${application.coverLetter || 'No cover letter provided'}</p>
                            
                            <h4>Application Details</h4>
                            <div class="details-grid">
                                <div class="detail-item">
                                    <strong>Applied Date:</strong> ${application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'N/A'}
                                </div>
                                <div class="detail-item">
                                    <strong>Expected Salary:</strong> ${application.expectedSalary ? `$${application.expectedSalary.toLocaleString()}` : 'N/A'}
                                </div>
                                <div class="detail-item">
                                    <strong>Availability:</strong> ${application.availability || 'N/A'}
                                </div>
                                <div class="detail-item">
                                    <strong>Status:</strong> <span class="status-badge status-${application.status || 'applied'}">${application.status || 'Applied'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async withdrawApplication(applicationId) {
        if (confirm('Are you sure you want to withdraw this application?')) {
            try {
                const response = await this.apiCall(`/api/applications/${applicationId}`, 'DELETE');
                if (response.success) {
                    this.showSuccess('Application withdrawn successfully!');
                    this.loadApplications();
                } else {
                    this.showError(response.message || 'Failed to withdraw application');
                }
            } catch (error) {
                console.error('Error withdrawing application:', error);
                this.showError('Failed to withdraw application');
            }
        }
    }

    async applyToJob(jobId) {
        try {
            const response = await this.apiCall('/api/applications/apply', 'POST', {
                jobId: jobId,
                coverLetter: 'I am very interested in this position and would like to apply.',
                availability: 'immediately'
            });
            
            if (response.success) {
                this.showSuccess('Application submitted successfully!');
                this.loadApplications();
            } else {
                this.showError(response.message || 'Failed to submit application');
            }
        } catch (error) {
            console.error('Error applying to job:', error);
            this.showError('Failed to submit application');
        }
    }

    async unsaveJob(jobId) {
        try {
            const response = await this.apiCall(`/api/jobs/${jobId}/unsave`, 'POST');
            if (response.success) {
                this.showSuccess('Job removed from saved jobs!');
                this.loadSavedJobs();
            } else {
                this.showError(response.message || 'Failed to unsave job');
            }
        } catch (error) {
            console.error('Error unsaving job:', error);
            this.showError('Failed to unsave job');
        }
    }

    filterApplications() {
        const statusFilter = document.getElementById('statusFilter').value;
        // Implementation for filtering applications
        console.log('Filtering applications by status:', statusFilter);
    }

    async updateAccountSettings() {
        try {
            const accountData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value
            };

            const response = await this.apiCall('/api/auth/profile', 'PUT', accountData);
            if (response.success) {
                this.showSuccess('Account updated successfully!');
                this.currentUser = response.user;
            } else {
                this.showError(response.message || 'Failed to update account');
            }
        } catch (error) {
            console.error('Error updating account:', error);
            this.showError('Failed to update account');
        }
    }

    async changePassword() {
        try {
            const passwordData = {
                currentPassword: document.getElementById('currentPassword').value,
                newPassword: document.getElementById('newPassword').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };

            if (passwordData.newPassword !== passwordData.confirmPassword) {
                this.showError('New passwords do not match');
                return;
            }

            const response = await this.apiCall('/api/auth/change-password', 'PUT', passwordData);
            if (response.success) {
                this.showSuccess('Password changed successfully!');
                document.getElementById('passwordSettingsForm').reset();
            } else {
                this.showError(response.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            this.showError('Failed to change password');
        }
    }

    async updateNotificationSettings() {
        try {
            const notificationData = {
                emailNotifications: document.getElementById('emailNotifications').checked,
                jobAlerts: document.getElementById('jobAlerts').checked,
                applicationUpdates: document.getElementById('applicationUpdates').checked,
                marketingEmails: document.getElementById('marketingEmails').checked
            };

            const response = await this.apiCall('/api/auth/notifications', 'PUT', notificationData);
            if (response.success) {
                this.showSuccess('Notification preferences updated successfully!');
            } else {
                this.showError(response.message || 'Failed to update preferences');
            }
        } catch (error) {
            console.error('Error updating notifications:', error);
            this.showError('Failed to update preferences');
        }
    }

    openDashboard() {
        console.log('openDashboard called');
        // Navigate to the main dashboard overview page
        this.navigateToPage('overview');
        // Also scroll to top to ensure user sees the overview
        window.scrollTo(0, 0);
        console.log('Navigation completed');
    }
}

// Initialize user dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.userDashboard = new UserDashboard();
});
