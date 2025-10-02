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
        
        // Initialize asynchronously
        this.init().catch(error => {
            console.error('Failed to initialize dashboard:', error);
        });
    }

    async init() {
        this.setupEventListeners();
        this.initializeFormListeners();
        await this.checkAuth();
        this.loadUserData();
        
        // Load the overview page by default after auth check
        this.navigateToPage('overview');
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
            
            console.log('Auth check - loaded user data:', {
                userType: this.currentUser?.userType,
                employerType: this.currentUser?.employerType,
                fullUser: this.currentUser
            });
            
            // All user types will use the unified dashboard
            // No redirects needed - show appropriate content based on user type
            
            this.updateUserInfo();
            this.filterMenuItems();
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

    filterMenuItems() {
        if (!this.currentUser) return;

        const userType = this.currentUser.userType;
        const employerType = this.currentUser.employerType;
        
        // Determine which user types this user should see
        const allowedUserTypes = [userType];
        
        // Add employer type if user is an employer
        if (userType === 'employer' && employerType) {
            allowedUserTypes.push(employerType);
        }
        
        // Admins can see everything
        if (userType === 'admin' || userType === 'superadmin') {
            allowedUserTypes.push('employer', 'company', 'consultancy', 'jobseeker');
        }

        // Show/hide menu items based on user type
        const menuItems = document.querySelectorAll('.user-type-menu');
        menuItems.forEach(item => {
            const allowedTypes = item.dataset.userTypes.split(',');
            const shouldShow = allowedTypes.some(type => allowedUserTypes.includes(type.trim()));
            
            if (shouldShow) {
                item.classList.add('show');
            } else {
                item.classList.remove('show');
            }
        });
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

        // Load page data based on user type first
        this.loadPageContent(page);
        
        // Update page title
        document.getElementById('pageTitle').textContent = this.getPageTitle(page);
        this.currentPage = page;
    }

    loadPageContent(page) {
        const userType = this.currentUser?.userType;
        const employerType = this.currentUser?.employerType;

        console.log('Dashboard routing debug:', {
            page,
            userType,
            employerType,
            currentUser: this.currentUser,
            isEmployer: userType === 'employer',
            isCompany: employerType === 'company',
            isConsultancy: employerType === 'consultancy'
        });

        switch(page) {
            case 'dashboard':
            case 'overview':
                // Load appropriate dashboard based on user type
                if (userType === 'admin' || userType === 'superadmin') {
                    console.log('Loading admin dashboard');
                    this.loadAdminDashboard();
                } else if (userType === 'employer' && employerType === 'company') {
                    console.log('Loading company dashboard');
                    this.loadCompanyDashboard();
                } else if (userType === 'employer' && employerType === 'consultancy') {
                    console.log('Loading consultancy dashboard');
                    this.loadConsultancyDashboard();
                } else {
                    console.log('Loading user dashboard (default)');
                    this.loadOverview();
                }
                break;
            // Job Seeker pages
            case 'applications':
                this.loadApplications();
                break;
            case 'saved-jobs':
                this.loadSavedJobs();
                break;
            case 'resume':
                this.loadResume();
                break;
            case 'jobs':
                this.loadJobs();
                break;
            case 'companies':
                this.loadCompanies();
                break;
            // Employer pages
            case 'manage-jobs':
                this.loadManageJobs();
                break;
            case 'post-job':
                this.loadPostJob();
                break;
            case 'draft-jobs':
                this.loadDraftJobs();
                break;
            case 'job-responses':
                this.loadJobResponses();
                break;
            case 'candidate-search':
                this.loadCandidateSearch();
                break;
            case 'resume-search':
                this.loadResumeSearch();
                break;
            // Company specific pages
            case 'employees':
                this.loadEmployees();
                break;
            case 'subusers':
                this.loadSubusers();
                break;
            case 'departments':
                this.loadDepartments();
                break;
            // Consultancy specific pages
            case 'clients':
                this.loadClients();
                break;
            case 'candidates':
                this.loadCandidates();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            // Admin specific pages
            case 'admin-panel':
                this.loadAdminPanel();
                break;
            case 'user-management':
                this.loadAdminPanel();
                break;
            case 'system-settings':
                this.loadSystemSettings();
                break;
            // Common pages
            case 'profile':
                this.loadProfile();
                break;
            case 'settings':
                this.loadSettings();
                break;
            default:
                console.log('No specific loader for page:', page);
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

    makeStatCardsClickable() {
        // Make Total Applications card clickable
        const applicationsCard = document.querySelector('.stat-card[data-stat="applications"]');
        if (applicationsCard) {
            applicationsCard.style.cursor = 'pointer';
            applicationsCard.addEventListener('click', () => {
                this.navigateToPage('applications');
            });
        }

        // Make Saved Jobs card clickable
        const savedJobsCard = document.querySelector('.stat-card[data-stat="saved"]');
        if (savedJobsCard) {
            savedJobsCard.style.cursor = 'pointer';
            savedJobsCard.addEventListener('click', () => {
                this.navigateToPage('saved-jobs');
            });
        }

        // Make Available Jobs card clickable
        const availableJobsCard = document.querySelector('.stat-card[data-stat="jobs"]');
        if (availableJobsCard) {
            availableJobsCard.style.cursor = 'pointer';
            availableJobsCard.addEventListener('click', () => {
                this.navigateToPage('jobs');
            });
        }

        // Make Profile Completion card clickable
        const profileCompletionCard = document.querySelector('.stat-card[data-stat="profile"]');
        if (profileCompletionCard) {
            profileCompletionCard.style.cursor = 'pointer';
            profileCompletionCard.addEventListener('click', () => {
                this.navigateToPage('profile');
            });
        }
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
            this.makeStatCardsClickable();
            this.showUserDashboard();
        } catch (error) {
            console.error('Error loading overview:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    showUserDashboard() {
        console.log('Showing user dashboard');
        this.hideAllPages();
        const userDashboard = document.getElementById('dashboardPage');
        if (userDashboard) {
            userDashboard.classList.remove('hidden');
            userDashboard.style.display = 'block';
            console.log('User dashboard displayed');
        } else {
            console.error('User dashboard element not found');
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
        try {
            if (!this.currentUser) return;

            // Load full profile data
            const response = await this.apiCall('/api/users/profile', 'GET');
            if (response.success) {
                this.currentUser = { ...this.currentUser, ...response.user };
            }

            this.updateProfileForm();
            this.updateProfileStats();
            this.updateProfileCompletion();
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Failed to load profile');
        }
    }

    updateProfileForm() {
        // Populate form with current user data
        document.getElementById('firstName').value = this.currentUser.firstName || '';
        document.getElementById('lastName').value = this.currentUser.lastName || '';
        document.getElementById('email').value = this.currentUser.email || '';
        document.getElementById('phone').value = this.currentUser.phone || '';
        document.getElementById('bio').value = this.currentUser.profile?.bio || '';
        document.getElementById('currentLocation').value = this.currentUser.profile?.currentLocation || '';
        document.getElementById('skills').value = this.currentUser.profile?.skills?.join(', ') || '';
        
        // Update profile picture
        this.updateProfilePicture();
    }

    updateProfileStats() {
        const profile = this.currentUser?.profile || {};
        const stats = {
            profileViews: profile.views || 0,
            applicationsCount: this.userData.applications?.length || 0,
            savedJobsCount: this.userData.savedJobs?.length || 0,
            profileCompletion: this.calculateProfileCompletion()
        };

        const statsContainer = document.getElementById('profileStats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stats-row">
                    <div class="stat-item">
                        <span class="stat-number">${stats.profileViews}</span>
                        <span class="stat-label">Profile Views</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${stats.applicationsCount}</span>
                        <span class="stat-label">Applications</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${stats.savedJobsCount}</span>
                        <span class="stat-label">Saved Jobs</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${stats.profileCompletion}%</span>
                        <span class="stat-label">Profile Complete</span>
                    </div>
                </div>
            `;
        }
    }

    updateProfilePicture() {
        const profilePicture = document.getElementById('profilePicture');
        const profileAvatar = document.getElementById('profileAvatar');
        
        if (this.currentUser?.profile?.picture) {
            if (profilePicture) profilePicture.src = this.currentUser.profile.picture;
            if (profileAvatar) {
                profileAvatar.innerHTML = `<img src="${this.currentUser.profile.picture}" alt="Profile Picture">`;
            }
        } else {
            const initials = `${this.currentUser.firstName?.charAt(0) || ''}${this.currentUser.lastName?.charAt(0) || ''}`.toUpperCase();
            if (profileAvatar) profileAvatar.textContent = initials;
        }
    }

    updateProfileCompletion() {
        const completion = this.calculateProfileCompletion();
        const progressBar = document.getElementById('profileCompletionBar');
        const completionText = document.getElementById('profileCompletionText');
        
        if (progressBar) {
            progressBar.style.width = `${completion}%`;
        }
        if (completionText) {
            completionText.textContent = `${completion}% Complete`;
        }
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
            this.updateApplicationsStats();
        } catch (error) {
            console.error('Error loading applications:', error);
            this.showError('Failed to load applications');
        }
    }

    updateApplicationsStats() {
        const totalApplications = this.userData.applications.length;
        const activeApplications = this.userData.applications.filter(app => 
            ['applied', 'under_review', 'interview_scheduled', 'shortlisted'].includes(app.status)
        ).length;
        const acceptedApplications = this.userData.applications.filter(app => 
            app.status === 'accepted'
        ).length;
        const rejectedApplications = this.userData.applications.filter(app => 
            app.status === 'rejected'
        ).length;

        // Update stats display
        const statsContainer = document.getElementById('applicationsStats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stats-row">
                    <div class="stat-item">
                        <span class="stat-number">${totalApplications}</span>
                        <span class="stat-label">Total Applications</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${activeApplications}</span>
                        <span class="stat-label">Active</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${acceptedApplications}</span>
                        <span class="stat-label">Accepted</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${rejectedApplications}</span>
                        <span class="stat-label">Rejected</span>
                    </div>
                </div>
            `;
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
                                <p class="applied-date">Applied ${application.appliedAt ? JobWalaAPI.formatIndianDate(application.appliedAt) : 'N/A'}</p>
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
        try {
            await this.loadUserData();
            this.updateSavedJobsList();
            this.updateSavedJobsStats();
        } catch (error) {
            console.error('Error loading saved jobs:', error);
            this.showError('Failed to load saved jobs');
        }
    }

    updateSavedJobsList() {
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
                    <button class="btn btn-warning btn-sm" onclick="dashboard.removeSavedJob('${job._id}')">Remove</button>
                </div>
            </div>
        `).join('');
    }

    updateSavedJobsStats() {
        const totalSavedJobs = this.userData.savedJobs.length;
        const recentSavedJobs = this.userData.savedJobs.filter(job => {
            const savedDate = new Date(job.savedAt || job.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return savedDate > weekAgo;
        }).length;

        // Update stats display
        const statsContainer = document.getElementById('savedJobsStats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stats-row">
                    <div class="stat-item">
                        <span class="stat-number">${totalSavedJobs}</span>
                        <span class="stat-label">Total Saved Jobs</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${recentSavedJobs}</span>
                        <span class="stat-label">Saved This Week</span>
                    </div>
                </div>
            `;
        }
    }

    async loadSettings() {
        try {
            if (!this.currentUser) return;

            // Load user settings
            const response = await this.apiCall('/api/users/settings', 'GET');
            if (response.success) {
                this.currentUser.settings = response.settings;
            }

            this.updateSettingsForm();
            this.updatePrivacySettings();
            this.updateNotificationSettings();
        } catch (error) {
            console.error('Error loading settings:', error);
            this.showError('Failed to load settings');
        }
    }

    updateSettingsForm() {
        const notifications = this.currentUser?.profile?.notifications || {};
        const settings = this.currentUser?.settings || {};
        
        // Update notification settings
        const emailJobAlerts = document.getElementById('emailJobAlerts');
        const emailApplicationUpdates = document.getElementById('emailApplicationUpdates');
        const emailMarketing = document.getElementById('emailMarketing');
        
        if (emailJobAlerts) emailJobAlerts.checked = notifications.email?.jobAlerts ?? true;
        if (emailApplicationUpdates) emailApplicationUpdates.checked = notifications.email?.applicationUpdates ?? true;
        if (emailMarketing) emailMarketing.checked = notifications.email?.marketing ?? false;
    }

    updatePrivacySettings() {
        const privacyContainer = document.getElementById('privacySettings');
        if (!privacyContainer) return;

        const settings = this.currentUser?.settings || {};
        privacyContainer.innerHTML = `
            <div class="settings-section">
                <h3>Privacy Settings</h3>
                <div class="form-group">
                    <label for="profileVisibility">Profile Visibility</label>
                    <select id="profileVisibility" name="profileVisibility">
                        <option value="public" ${settings.profileVisibility === 'public' ? 'selected' : ''}>Public</option>
                        <option value="private" ${settings.profileVisibility === 'private' ? 'selected' : ''}>Private</option>
                        <option value="connections" ${settings.profileVisibility === 'connections' ? 'selected' : ''}>Connections Only</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="showContactInfo" name="showContactInfo" ${settings.showContactInfo ? 'checked' : ''}>
                        Show contact information to employers
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="showResume" name="showResume" ${settings.showResume ? 'checked' : ''}>
                        Allow employers to download resume
                    </label>
                </div>
            </div>
        `;
    }

    updateNotificationSettings() {
        const notificationContainer = document.getElementById('notificationSettings');
        if (!notificationContainer) return;

        const notifications = this.currentUser?.profile?.notifications || {};
        notificationContainer.innerHTML = `
            <div class="settings-section">
                <h3>Email Notifications</h3>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="emailJobAlerts" name="emailJobAlerts" ${notifications.email?.jobAlerts ? 'checked' : ''}>
                        Job alerts and recommendations
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="emailApplicationUpdates" name="emailApplicationUpdates" ${notifications.email?.applicationUpdates ? 'checked' : ''}>
                        Application status updates
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="emailProfileViews" name="emailProfileViews" ${notifications.email?.profileViews ? 'checked' : ''}>
                        Profile views and activity
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="emailMessages" name="emailMessages" ${notifications.email?.messages ? 'checked' : ''}>
                        Messages from employers
                    </label>
                </div>
            </div>
        `;
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
        return JobWalaAPI.formatIndianDate(date);
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
                                    <strong>Applied Date:</strong> ${application.appliedAt ? JobWalaAPI.formatIndianDate(application.appliedAt) : 'N/A'}
                                </div>
                                <div class="detail-item">
                                    <strong>Expected Salary:</strong> ${application.expectedSalary ? JobWalaAPI.formatIndianCurrency(application.expectedSalary) : 'N/A'}
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

    async removeSavedJob(jobId) {
        try {
            const response = await this.apiCall(`/api/jobs/${jobId}/unsave`, 'POST');
            if (response.success) {
                this.showSuccess('Job removed from saved jobs!');
                this.loadSavedJobs();
            } else {
                this.showError(response.message || 'Failed to remove saved job');
            }
        } catch (error) {
            console.error('Error removing saved job:', error);
            this.showError('Failed to remove saved job');
        }
    }

    async applyToJob(jobId) {
        try {
            const response = await this.apiCall(`/api/jobs/${jobId}/apply`, 'POST', {
                coverLetter: '',
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

    filterApplications() {
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const dateFilter = document.getElementById('dateFilter')?.value || '';
        const searchTerm = document.getElementById('searchApplications')?.value || '';
        
        let filteredApplications = this.userData.applications || [];
        
        // Filter by status
        if (statusFilter) {
            filteredApplications = filteredApplications.filter(app => app.status === statusFilter);
        }
        
        // Filter by date
        if (dateFilter) {
            const now = new Date();
            filteredApplications = filteredApplications.filter(app => {
                const appliedDate = new Date(app.appliedAt);
                switch(dateFilter) {
                    case 'today':
                        return JobWalaAPI.formatIndianDate(appliedDate) === JobWalaAPI.formatIndianDate(now);
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return appliedDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return appliedDate >= monthAgo;
                    case '3months':
                        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                        return appliedDate >= threeMonthsAgo;
                    default:
                        return true;
                }
            });
        }
        
        // Filter by search term
        if (searchTerm) {
            filteredApplications = filteredApplications.filter(app => 
                (app.job?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (app.job?.company?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        this.displayFilteredApplications(filteredApplications);
    }

    displayFilteredApplications(applications) {
        const applicationsTable = document.getElementById('allApplicationsTable');
        if (!applicationsTable) return;

        if (applications.length === 0) {
            applicationsTable.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #7f8c8d;">No applications found matching your criteria</td></tr>';
            return;
        }

        applicationsTable.innerHTML = applications.map(application => `
            <tr>
                <td>
                    <strong>${application.job?.title || 'Unknown Job'}</strong>
                </td>
                <td>${application.job?.company?.name || 'Unknown Company'}</td>
                <td>
                    <span class="status-badge status-${application.status}">${this.formatStatus(application.status)}</span>
                </td>
                <td>${JobWalaAPI.formatIndianDate(application.appliedAt)}</td>
                <td>${JobWalaAPI.formatIndianDate(application.updatedAt || application.appliedAt)}</td>
                <td>
                    <button onclick="dashboard.viewApplication('${application._id}')" class="btn btn-sm btn-primary">View</button>
                    ${application.status === 'applied' ? `<button onclick="dashboard.withdrawApplication('${application._id}')" class="btn btn-sm btn-warning">Withdraw</button>` : ''}
                </td>
            </tr>
        `).join('');
    }

    formatStatus(status) {
        const statusMap = {
            'applied': 'Applied',
            'under_review': 'Under Review',
            'interview_scheduled': 'Interview Scheduled',
            'shortlisted': 'Shortlisted',
            'accepted': 'Accepted',
            'rejected': 'Rejected'
        };
        return statusMap[status] || status;
    }

    async refreshApplications() {
        await this.loadApplications();
        this.showSuccess('Applications refreshed successfully!');
    }

    async viewApplication(applicationId) {
        try {
            const response = await this.apiCall(`/api/applications/${applicationId}`, 'GET');
            if (response.success) {
                this.displayApplicationModal(response.application);
            } else {
                this.showError(response.message || 'Failed to load application details');
            }
        } catch (error) {
            console.error('Error loading application:', error);
            this.showError('Failed to load application details');
        }
    }

    displayApplicationModal(application) {
        const modal = document.getElementById('applicationModal');
        const title = document.getElementById('applicationModalTitle');
        const body = document.getElementById('applicationModalBody');
        
        if (title) title.textContent = `Application Details - ${application.job?.title || 'Unknown Job'}`;
        
        if (body) {
            body.innerHTML = `
                <div class="application-details">
                    <div class="detail-section">
                        <h4>Job Information</h4>
                        <p><strong>Title:</strong> ${application.job?.title || 'N/A'}</p>
                        <p><strong>Company:</strong> ${application.job?.company?.name || 'N/A'}</p>
                        <p><strong>Location:</strong> ${application.job?.location?.city || 'N/A'}, ${application.job?.location?.state || 'N/A'}</p>
                        <p><strong>Type:</strong> ${application.job?.jobType || 'N/A'}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Application Status</h4>
                        <p><strong>Status:</strong> <span class="status-badge status-${application.status}">${this.formatStatus(application.status)}</span></p>
                        <p><strong>Applied Date:</strong> ${JobWalaAPI.formatIndianDate(application.appliedAt)}</p>
                        <p><strong>Last Updated:</strong> ${JobWalaAPI.formatIndianDate(application.updatedAt || application.appliedAt)}</p>
                    </div>
                    ${application.coverLetter ? `
                        <div class="detail-section">
                            <h4>Cover Letter</h4>
                            <p>${application.coverLetter}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        if (modal) modal.style.display = 'block';
    }

    closeApplicationModal() {
        const modal = document.getElementById('applicationModal');
        if (modal) modal.style.display = 'none';
    }

    // Saved Jobs Methods
    filterSavedJobs() {
        const jobTypeFilter = document.getElementById('jobTypeFilter')?.value || '';
        const experienceFilter = document.getElementById('experienceFilter')?.value || '';
        const searchTerm = document.getElementById('searchSavedJobs')?.value || '';
        
        let filteredJobs = this.userData.savedJobs || [];
        
        // Filter by job type
        if (jobTypeFilter) {
            filteredJobs = filteredJobs.filter(job => job.jobType === jobTypeFilter);
        }
        
        // Filter by experience
        if (experienceFilter) {
            filteredJobs = filteredJobs.filter(job => {
                const experience = job.totalExperience || '';
                switch(experienceFilter) {
                    case 'fresher':
                        return experience === 'Fresher';
                    case '0-2':
                        return ['3 Months', '6 Months', '1 Year', '2 Years'].includes(experience);
                    case '2-5':
                        return ['2.5 Years', '3 Years', '3.5 Years', '4 Years', '4.5 Years', '5 Years'].includes(experience);
                    case '5-10':
                        return ['5.5 Years', '6 Years', '7 Years', '8 Years', '9 Years', '10 Years'].includes(experience);
                    case '10+':
                        return ['10.5 Years', '11 Years', '12 Years', '15 Years', '20 Years', '25 Years', '30 Years', '31 Years Plus'].includes(experience);
                    default:
                        return true;
                }
            });
        }
        
        // Filter by search term
        if (searchTerm) {
            filteredJobs = filteredJobs.filter(job => 
                (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (job.company?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        this.displayFilteredSavedJobs(filteredJobs);
    }

    displayFilteredSavedJobs(jobs) {
        const savedJobsTable = document.getElementById('allSavedJobsTable');
        if (!savedJobsTable) return;

        if (jobs.length === 0) {
            savedJobsTable.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #7f8c8d;">No saved jobs found matching your criteria</td></tr>';
            return;
        }

        savedJobsTable.innerHTML = jobs.map(job => `
            <tr>
                <td>
                    <strong>${job.title || 'Unknown Job'}</strong>
                </td>
                <td>${job.company?.name || 'Unknown Company'}</td>
                <td>${job.location?.city || 'N/A'}, ${job.location?.state || 'N/A'}</td>
                <td>${this.formatSalary(job.salary)}</td>
                <td>${JobWalaAPI.formatIndianDate(job.savedAt || job.createdAt)}</td>
                <td>
                    <button onclick="dashboard.viewJob('${job._id}')" class="btn btn-sm btn-primary">View</button>
                    <button onclick="dashboard.applyToJob('${job._id}')" class="btn btn-sm btn-success">Apply</button>
                    <button onclick="dashboard.removeSavedJob('${job._id}')" class="btn btn-sm btn-warning">Remove</button>
                </td>
            </tr>
        `).join('');
    }

    async refreshSavedJobs() {
        await this.loadSavedJobs();
        this.showSuccess('Saved jobs refreshed successfully!');
    }

    async clearAllSavedJobs() {
        if (confirm('Are you sure you want to remove all saved jobs? This action cannot be undone.')) {
            try {
                const response = await this.apiCall('/api/jobs/clear-saved', 'POST');
                if (response.success) {
                    this.showSuccess('All saved jobs cleared successfully!');
                    this.loadSavedJobs();
                } else {
                    this.showError(response.message || 'Failed to clear saved jobs');
                }
            } catch (error) {
                console.error('Error clearing saved jobs:', error);
                this.showError('Failed to clear saved jobs');
            }
        }
    }

    async viewJob(jobId) {
        try {
            const response = await this.apiCall(`/api/jobs/${jobId}`, 'GET');
            if (response.success) {
                this.displayJobModal(response.job);
            } else {
                this.showError(response.message || 'Failed to load job details');
            }
        } catch (error) {
            console.error('Error loading job:', error);
            this.showError('Failed to load job details');
        }
    }

    displayJobModal(job) {
        const modal = document.getElementById('jobModal');
        const title = document.getElementById('jobModalTitle');
        const body = document.getElementById('jobModalBody');
        
        if (title) title.textContent = job.title || 'Job Details';
        
        if (body) {
            body.innerHTML = `
                <div class="job-details">
                    <div class="detail-section">
                        <h4>Job Information</h4>
                        <p><strong>Title:</strong> ${job.title || 'N/A'}</p>
                        <p><strong>Company:</strong> ${job.company?.name || 'N/A'}</p>
                        <p><strong>Location:</strong> ${job.location?.city || 'N/A'}, ${job.location?.state || 'N/A'}</p>
                        <p><strong>Type:</strong> ${job.jobType || 'N/A'}</p>
                        <p><strong>Experience:</strong> ${job.totalExperience || 'N/A'}</p>
                        <p><strong>Salary:</strong> ${this.formatSalary(job.salary)}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Job Description</h4>
                        <div class="job-description">${job.description || 'No description available'}</div>
                    </div>
                    <div class="detail-section">
                        <h4>Requirements</h4>
                        <div class="job-requirements">${job.requirements || 'No requirements specified'}</div>
                    </div>
                </div>
            `;
        }
        
        if (modal) modal.style.display = 'block';
    }

    closeJobModal() {
        const modal = document.getElementById('jobModal');
        if (modal) modal.style.display = 'none';
    }

    async applyFromModal() {
        const modal = document.getElementById('jobModal');
        const jobId = modal?.dataset?.jobId;
        if (jobId) {
            await this.applyToJob(jobId);
            this.closeJobModal();
        }
    }

    formatSalary(salary) {
        if (!salary) return 'Not specified';
        if (typeof salary === 'object') {
            return `${salary.min || 'N/A'} - ${salary.max || 'N/A'} ${salary.currency || ''}`;
        }
        return salary;
    }

    // Profile Methods
    async uploadProfilePicture() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('profilePicture', file);
                
                try {
                    const response = await this.apiCall('/api/users/upload-profile-picture', 'POST', formData);
                    if (response.success) {
                        this.showSuccess('Profile picture updated successfully!');
                        this.updateProfilePicture();
                    } else {
                        this.showError(response.message || 'Failed to upload profile picture');
                    }
                } catch (error) {
                    console.error('Error uploading profile picture:', error);
                    this.showError('Failed to upload profile picture');
                }
            }
        };
        input.click();
    }

    async cancelEdit() {
        // Reset form to original values
        this.updateProfileForm();
        this.showInfo('Changes cancelled');
    }

    // Initialize form event listeners
    initializeFormListeners() {
        // Profile form submission
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveProfile();
            });
        }

        // Settings form submission
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveSettings();
            });
        }
    }

    // Dashboard Loading Methods for Different User Types
    async loadAdminDashboard() {
        try {
            await this.loadAdminStats();
            await this.loadUsers();
            this.showAdminDashboard();
        } catch (error) {
            console.error('Error loading admin dashboard:', error);
            this.showError('Failed to load admin dashboard');
        }
    }

    async loadCompanyDashboard() {
        try {
            // Load company data in parallel, but don't fail if some APIs are not available
            const promises = [
                this.loadCompanyStats().catch(err => console.warn('Company stats failed:', err)),
                this.loadCompanyJobs().catch(err => console.warn('Company jobs failed:', err)),
                this.loadCompanyApplications().catch(err => console.warn('Company applications failed:', err))
            ];
            
            await Promise.allSettled(promises);
            this.showCompanyDashboard();
        } catch (error) {
            console.error('Error loading company dashboard:', error);
            // Still show the dashboard even if data loading fails
            this.showCompanyDashboard();
        }
    }

    async loadConsultancyDashboard() {
        try {
            await this.loadConsultancyStats();
            await this.loadClients();
            await this.loadConsultancyApplications();
            this.showConsultancyDashboard();
        } catch (error) {
            console.error('Error loading consultancy dashboard:', error);
            this.showError('Failed to load consultancy dashboard');
        }
    }

    // Show appropriate dashboard based on user type
    showAdminDashboard() {
        this.hideAllPages();
        const adminPanel = document.getElementById('adminPanelPage');
        if (adminPanel) {
            adminPanel.classList.remove('hidden');
            adminPanel.style.display = 'block';
        }
    }

    showCompanyDashboard() {
        console.log('Showing company dashboard');
        console.log('Current user data:', this.currentUser);
        this.hideAllPages();
        const companyDashboard = document.getElementById('companyDashboardPage');
        if (companyDashboard) {
            companyDashboard.classList.remove('hidden');
            companyDashboard.style.display = 'block';
            console.log('Company dashboard displayed successfully');
            console.log('Company dashboard element:', companyDashboard);
            console.log('Company dashboard classes:', companyDashboard.className);
            console.log('Company dashboard style.display:', companyDashboard.style.display);
            
            // Update page title to reflect company dashboard
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = 'Company Dashboard';
            }
        } else {
            console.error('Company dashboard element not found');
            console.error('Available page elements:', document.querySelectorAll('.page'));
        }
    }

    showConsultancyDashboard() {
        console.log('Showing consultancy dashboard');
        console.log('Current user data:', this.currentUser);
        this.hideAllPages();
        const consultancyDashboard = document.getElementById('consultancyDashboardPage');
        if (consultancyDashboard) {
            consultancyDashboard.classList.remove('hidden');
            consultancyDashboard.style.display = 'block';
            console.log('Consultancy dashboard displayed');
            
            // Update page title to reflect consultancy dashboard
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = 'Consultancy Dashboard';
            }
        } else {
            console.error('Consultancy dashboard element not found');
        }
    }

    hideAllPages() {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.add('hidden');
            page.style.display = 'none';
        });
    }

    // Admin User Management Methods
    async loadAdminPanel() {
        try {
            await this.loadAdminStats();
            await this.loadUsers();
        } catch (error) {
            console.error('Error loading admin panel:', error);
            this.showError('Failed to load admin panel');
        }
    }

    async loadAdminStats() {
        try {
            const response = await this.apiCall('/api/admin/dashboard', 'GET');
            if (response.success) {
                const stats = response.stats;
                document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
                document.getElementById('totalJobs').textContent = stats.totalJobs || 0;
                document.getElementById('totalApplications').textContent = stats.totalApplications || 0;
                document.getElementById('activeJobs').textContent = stats.activeJobs || 0;
            }
        } catch (error) {
            console.error('Error loading admin stats:', error);
        }
    }

    async loadUsers() {
        try {
            const response = await this.apiCall('/api/admin/users', 'GET');
            if (response.success) {
                this.adminUsers = response.users;
                this.displayUsers(this.adminUsers);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Failed to load users');
        }
    }

    displayUsers(users) {
        const usersTable = document.getElementById('usersTable');
        if (!usersTable) return;

        if (users.length === 0) {
            usersTable.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #7f8c8d;">No users found</td></tr>';
            return;
        }

        usersTable.innerHTML = users.map(user => `
            <tr>
                <td>${user.userId || 'N/A'}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>
                    <span class="badge ${user.userType}">${user.userType}</span>
                </td>
                <td>
                    <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                        ${user.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${JobWalaAPI.formatIndianDate(user.createdAt)}</td>
                <td>
                    <button onclick="dashboard.editUser('${user._id}')" class="btn btn-sm btn-primary">Edit</button>
                    <button onclick="dashboard.deleteUserConfirm('${user._id}')" class="btn btn-sm btn-danger">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    filterUsers() {
        const searchTerm = document.getElementById('userSearch')?.value || '';
        const userType = document.getElementById('userTypeFilter')?.value || '';
        const status = document.getElementById('userStatusFilter')?.value || '';
        
        let filteredUsers = this.adminUsers || [];
        
        // Filter by search term
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(user => 
                (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filter by user type
        if (userType) {
            filteredUsers = filteredUsers.filter(user => user.userType === userType);
        }
        
        // Filter by status
        if (status) {
            const isActive = status === 'active';
            filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
        }
        
        this.displayUsers(filteredUsers);
    }

    async refreshUsers() {
        await this.loadUsers();
        this.showSuccess('Users refreshed successfully!');
    }

    createUser() {
        const modal = document.getElementById('createUserModal');
        if (modal) modal.style.display = 'block';
    }

    closeCreateUserModal() {
        const modal = document.getElementById('createUserModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('createUserForm').reset();
        }
    }

    async submitCreateUser() {
        try {
            const formData = {
                firstName: document.getElementById('createFirstName').value,
                lastName: document.getElementById('createLastName').value,
                email: document.getElementById('createEmail').value,
                phone: document.getElementById('createPhone').value,
                userType: document.getElementById('createUserType').value,
                password: document.getElementById('createPassword').value
            };

            const response = await this.apiCall('/api/admin/create-admin', 'POST', formData);
            if (response.success) {
                this.showSuccess('User created successfully!');
                this.closeCreateUserModal();
                this.loadUsers();
            } else {
                this.showError(response.message || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            this.showError('Failed to create user');
        }
    }

    async editUser(userId) {
        try {
            const response = await this.apiCall(`/api/admin/users/${userId}`, 'GET');
            if (response.success) {
                const user = response.user;
                document.getElementById('editUserId').value = user._id;
                document.getElementById('editFirstName').value = user.firstName;
                document.getElementById('editLastName').value = user.lastName;
                document.getElementById('editEmail').value = user.email;
                document.getElementById('editPhone').value = user.phone || '';
                document.getElementById('editUserType').value = user.userType;
                document.getElementById('editIsActive').value = user.isActive ? 'true' : 'false';
                
                const modal = document.getElementById('editUserModal');
                if (modal) modal.style.display = 'block';
            } else {
                this.showError(response.message || 'Failed to load user details');
            }
        } catch (error) {
            console.error('Error loading user:', error);
            this.showError('Failed to load user details');
        }
    }

    closeEditUserModal() {
        const modal = document.getElementById('editUserModal');
        if (modal) modal.style.display = 'none';
    }

    async submitEditUser() {
        try {
            const userId = document.getElementById('editUserId').value;
            const formData = {
                firstName: document.getElementById('editFirstName').value,
                lastName: document.getElementById('editLastName').value,
                email: document.getElementById('editEmail').value,
                phone: document.getElementById('editPhone').value,
                userType: document.getElementById('editUserType').value,
                isActive: document.getElementById('editIsActive').value === 'true'
            };

            const response = await this.apiCall(`/api/admin/users/${userId}`, 'PUT', formData);
            if (response.success) {
                this.showSuccess('User updated successfully!');
                this.closeEditUserModal();
                this.loadUsers();
            } else {
                this.showError(response.message || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            this.showError('Failed to update user');
        }
    }

    async deleteUserConfirm(userId) {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await this.deleteUser(userId);
        }
    }

    async deleteUser(userId) {
        try {
            const response = await this.apiCall(`/api/admin/users/${userId}`, 'DELETE');
            if (response.success) {
                this.showSuccess('User deleted successfully!');
                this.loadUsers();
            } else {
                this.showError(response.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showError('Failed to delete user');
        }
    }

    // Company Dashboard Methods
    async loadCompanyStats() {
        try {
            const response = await this.apiCall('/api/company/dashboard', 'GET');
            if (response.success) {
                const stats = response.stats;
                document.getElementById('companyTotalJobs').textContent = stats.totalJobs || 0;
                document.getElementById('companyTotalApplications').textContent = stats.totalApplications || 0;
                document.getElementById('companyActiveJobs').textContent = stats.activeJobs || 0;
                document.getElementById('companyProfileViews').textContent = stats.profileViews || 0;
            }
        } catch (error) {
            console.error('Error loading company stats:', error);
        }
    }

    async loadCompanyJobs() {
        try {
            const response = await this.apiCall('/api/jobs/my-jobs', 'GET');
            if (response.success) {
                this.companyJobs = response.jobs || [];
                this.displayCompanyJobs(this.companyJobs);
            }
        } catch (error) {
            console.error('Error loading company jobs:', error);
        }
    }

    displayCompanyJobs(jobs) {
        const jobsTable = document.getElementById('companyJobsTable');
        if (!jobsTable) return;

        if (jobs.length === 0) {
            jobsTable.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #7f8c8d;">No jobs found</td></tr>';
            return;
        }

        jobsTable.innerHTML = jobs.map(job => `
            <tr>
                <td><strong>${job.title}</strong></td>
                <td>${job.applications?.length || 0}</td>
                <td>
                    <span class="status-badge status-${job.status}">${job.status}</span>
                </td>
                <td>${JobWalaAPI.formatIndianDate(job.createdAt)}</td>
                <td>
                    <button onclick="dashboard.viewJob('${job._id}')" class="btn btn-sm btn-primary">View</button>
                    <button onclick="dashboard.editJob('${job._id}')" class="btn btn-sm btn-warning">Edit</button>
                </td>
            </tr>
        `).join('');
    }

    async loadCompanyApplications() {
        try {
            const response = await this.apiCall('/api/applications/company-applications', 'GET');
            if (response.success) {
                this.companyApplications = response.applications || [];
                this.displayCompanyApplications(this.companyApplications);
            }
        } catch (error) {
            console.error('Error loading company applications:', error);
        }
    }

    displayCompanyApplications(applications) {
        const applicationsTable = document.getElementById('companyApplicationsTable');
        if (!applicationsTable) return;

        if (applications.length === 0) {
            applicationsTable.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #7f8c8d;">No applications found</td></tr>';
            return;
        }

        applicationsTable.innerHTML = applications.map(application => `
            <tr>
                <td><strong>${application.job?.title || 'N/A'}</strong></td>
                <td>${application.user?.firstName} ${application.user?.lastName}</td>
                <td>
                    <span class="status-badge status-${application.status}">${application.status}</span>
                </td>
                <td>${JobWalaAPI.formatIndianDate(application.appliedAt)}</td>
                <td>
                    <button onclick="dashboard.viewApplication('${application._id}')" class="btn btn-sm btn-primary">View</button>
                    <button onclick="dashboard.updateApplicationStatus('${application._id}')" class="btn btn-sm btn-success">Update</button>
                </td>
            </tr>
        `).join('');
    }

    // Consultancy Dashboard Methods
    async loadConsultancyStats() {
        try {
            const response = await this.apiCall('/api/consultancy/dashboard', 'GET');
            if (response.success) {
                const stats = response.stats;
                document.getElementById('consultancyTotalClients').textContent = stats.totalClients || 0;
                document.getElementById('consultancyTotalJobs').textContent = stats.totalJobs || 0;
                document.getElementById('consultancyTotalApplications').textContent = stats.totalApplications || 0;
                document.getElementById('consultancyRevenue').textContent = `₹${stats.monthlyRevenue || 0}`;
            }
        } catch (error) {
            console.error('Error loading consultancy stats:', error);
        }
    }

    async loadClients() {
        try {
            const response = await this.apiCall('/api/consultancy/clients', 'GET');
            if (response.success) {
                this.consultancyClients = response.clients || [];
                this.displayClients(this.consultancyClients);
            }
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    }

    displayClients(clients) {
        const clientsTable = document.getElementById('clientsTable');
        if (!clientsTable) return;

        if (clients.length === 0) {
            clientsTable.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #7f8c8d;">No clients found</td></tr>';
            return;
        }

        clientsTable.innerHTML = clients.map(client => `
            <tr>
                <td><strong>${client.name}</strong></td>
                <td>${client.industry || 'N/A'}</td>
                <td>${client.projects?.length || 0}</td>
                <td>
                    <span class="status-badge status-${client.status}">${client.status}</span>
                </td>
                <td>
                    <button onclick="dashboard.viewClient('${client._id}')" class="btn btn-sm btn-primary">View</button>
                    <button onclick="dashboard.editClient('${client._id}')" class="btn btn-sm btn-warning">Edit</button>
                </td>
            </tr>
        `).join('');
    }

    async loadConsultancyApplications() {
        try {
            const response = await this.apiCall('/api/applications/consultancy-applications', 'GET');
            if (response.success) {
                this.consultancyApplications = response.applications || [];
                this.displayConsultancyApplications(this.consultancyApplications);
            }
        } catch (error) {
            console.error('Error loading consultancy applications:', error);
        }
    }

    displayConsultancyApplications(applications) {
        const applicationsTable = document.getElementById('consultancyApplicationsTable');
        if (!applicationsTable) return;

        if (applications.length === 0) {
            applicationsTable.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #7f8c8d;">No applications found</td></tr>';
            return;
        }

        applicationsTable.innerHTML = applications.map(application => `
            <tr>
                <td><strong>${application.job?.title || 'N/A'}</strong></td>
                <td>${application.client?.name || 'N/A'}</td>
                <td>${application.user?.firstName} ${application.user?.lastName}</td>
                <td>
                    <span class="status-badge status-${application.status}">${application.status}</span>
                </td>
                <td>
                    <button onclick="dashboard.viewApplication('${application._id}')" class="btn btn-sm btn-primary">View</button>
                    <button onclick="dashboard.updateApplicationStatus('${application._id}')" class="btn btn-sm btn-success">Update</button>
                </td>
            </tr>
        `).join('');
    }

    // Additional Company Methods
    async refreshCompanyApplications() {
        await this.loadCompanyApplications();
        this.showSuccess('Applications refreshed successfully!');
    }

    async refreshCompanyJobs() {
        await this.loadCompanyJobs();
        this.showSuccess('Jobs refreshed successfully!');
    }

    async createJob() {
        this.navigateToPage('post-job');
    }

    async editJob(jobId) {
        // Navigate to edit job page with job ID
        this.navigateToPage('post-job');
        // You can add logic to pre-populate the form with job data
    }

    async updateApplicationStatus(applicationId) {
        // Show modal to update application status
        const newStatus = prompt('Enter new status (applied, under_review, interview_scheduled, shortlisted, accepted, rejected):');
        if (newStatus) {
            try {
                const response = await this.apiCall(`/api/applications/${applicationId}/status`, 'PUT', { status: newStatus });
                if (response.success) {
                    this.showSuccess('Application status updated successfully!');
                    this.loadCompanyApplications();
                } else {
                    this.showError(response.message || 'Failed to update application status');
                }
            } catch (error) {
                console.error('Error updating application status:', error);
                this.showError('Failed to update application status');
            }
        }
    }

    // Additional Consultancy Methods
    async refreshClients() {
        await this.loadClients();
        this.showSuccess('Clients refreshed successfully!');
    }

    async refreshConsultancyApplications() {
        await this.loadConsultancyApplications();
        this.showSuccess('Applications refreshed successfully!');
    }

    async addClient() {
        const clientName = prompt('Enter client name:');
        const industry = prompt('Enter industry:');
        if (clientName) {
            try {
                const response = await this.apiCall('/api/consultancy/clients', 'POST', {
                    name: clientName,
                    industry: industry || 'General'
                });
                if (response.success) {
                    this.showSuccess('Client added successfully!');
                    this.loadClients();
                } else {
                    this.showError(response.message || 'Failed to add client');
                }
            } catch (error) {
                console.error('Error adding client:', error);
                this.showError('Failed to add client');
            }
        }
    }

    async viewClient(clientId) {
        try {
            const response = await this.apiCall(`/api/consultancy/clients/${clientId}`, 'GET');
            if (response.success) {
                const client = response.client;
                alert(`Client: ${client.name}\nIndustry: ${client.industry}\nStatus: ${client.status}\nProjects: ${client.projects?.length || 0}`);
            } else {
                this.showError(response.message || 'Failed to load client details');
            }
        } catch (error) {
            console.error('Error loading client:', error);
            this.showError('Failed to load client details');
        }
    }

    async editClient(clientId) {
        const newName = prompt('Enter new client name:');
        const newIndustry = prompt('Enter new industry:');
        if (newName) {
            try {
                const response = await this.apiCall(`/api/consultancy/clients/${clientId}`, 'PUT', {
                    name: newName,
                    industry: newIndustry || 'General'
                });
                if (response.success) {
                    this.showSuccess('Client updated successfully!');
                    this.loadClients();
                } else {
                    this.showError(response.message || 'Failed to update client');
                }
            } catch (error) {
                console.error('Error updating client:', error);
                this.showError('Failed to update client');
            }
        }
    }

    // Employer Methods
    async loadManageJobs() {
        try {
            const response = await this.apiCall('/api/jobs/my-jobs', 'GET');
            if (response.success) {
                this.displayJobs(response.jobs || []);
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
            this.showError('Failed to load jobs');
        }
    }

    async loadPostJob() {
        // Redirect to post job page
        window.location.href = 'post-job.html';
    }

    async loadDraftJobs() {
        try {
            const response = await this.apiCall('/api/jobs/drafts', 'GET');
            if (response.success) {
                this.displayDraftJobs(response.jobs || []);
            }
        } catch (error) {
            console.error('Error loading draft jobs:', error);
            this.showError('Failed to load draft jobs');
        }
    }

    async loadJobResponses() {
        try {
            const response = await this.apiCall('/api/applications/my-responses', 'GET');
            if (response.success) {
                this.displayJobResponses(response.applications || []);
            }
        } catch (error) {
            console.error('Error loading job responses:', error);
            this.showError('Failed to load job responses');
        }
    }

    async loadCandidateSearch() {
        try {
            const response = await this.apiCall('/api/candidates/search', 'GET');
            if (response.success) {
                this.displayCandidates(response.candidates || []);
            }
        } catch (error) {
            console.error('Error loading candidates:', error);
            this.showError('Failed to load candidates');
        }
    }

    async loadResumeSearch() {
        try {
            const response = await this.apiCall('/api/resumes/search', 'GET');
            if (response.success) {
                this.displayResumes(response.resumes || []);
            }
        } catch (error) {
            console.error('Error loading resumes:', error);
            this.showError('Failed to load resumes');
        }
    }

    // Company Methods
    async loadEmployees() {
        try {
            const response = await this.apiCall('/api/company/employees', 'GET');
            if (response.success) {
                this.displayEmployees(response.employees || []);
            }
        } catch (error) {
            console.error('Error loading employees:', error);
            this.showError('Failed to load employees');
        }
    }

    async loadSubusers() {
        try {
            const response = await this.apiCall('/api/company/subusers', 'GET');
            if (response.success) {
                this.displaySubusers(response.subusers || []);
            }
        } catch (error) {
            console.error('Error loading subusers:', error);
            this.showError('Failed to load subusers');
        }
    }

    async loadDepartments() {
        try {
            const response = await this.apiCall('/api/company/departments', 'GET');
            if (response.success) {
                this.displayDepartments(response.departments || []);
            }
        } catch (error) {
            console.error('Error loading departments:', error);
            this.showError('Failed to load departments');
        }
    }

    // Consultancy Methods
    async loadClients() {
        try {
            const response = await this.apiCall('/api/consultancy/clients', 'GET');
            if (response.success) {
                this.displayClients(response.clients || []);
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            this.showError('Failed to load clients');
        }
    }

    async loadCandidates() {
        try {
            const response = await this.apiCall('/api/consultancy/candidates', 'GET');
            if (response.success) {
                this.displayCandidates(response.candidates || []);
            }
        } catch (error) {
            console.error('Error loading candidates:', error);
            this.showError('Failed to load candidates');
        }
    }

    async loadAnalytics() {
        try {
            const response = await this.apiCall('/api/consultancy/analytics', 'GET');
            if (response.success) {
                this.displayAnalytics(response.analytics || {});
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showError('Failed to load analytics');
        }
    }

    // Admin Methods
    async loadAdminPanel() {
        try {
            const response = await this.apiCall('/api/admin/dashboard', 'GET');
            if (response.success) {
                this.displayAdminPanel(response.data || {});
            }
        } catch (error) {
            console.error('Error loading admin panel:', error);
            this.showError('Failed to load admin panel');
        }
    }

    async loadUserManagement() {
        try {
            const response = await this.apiCall('/api/admin/users', 'GET');
            if (response.success) {
                this.displayUsers(response.users || []);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Failed to load users');
        }
    }

    async loadSystemSettings() {
        try {
            const response = await this.apiCall('/api/admin/settings', 'GET');
            if (response.success) {
                this.displaySystemSettings(response.settings || {});
            }
        } catch (error) {
            console.error('Error loading system settings:', error);
            this.showError('Failed to load system settings');
        }
    }

    // Display Methods
    displayJobs(jobs) {
        const container = document.getElementById('jobsContainer');
        if (!container) return;

        container.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p>${job.company?.name || 'Unknown Company'}</p>
                <p>${job.location}</p>
                <p>${job.salary}</p>
                <div class="job-actions">
                    <button onclick="dashboard.editJob('${job._id}')">Edit</button>
                    <button onclick="dashboard.deleteJob('${job._id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    displayDraftJobs(jobs) {
        const container = document.getElementById('draftJobsContainer');
        if (!container) return;

        container.innerHTML = jobs.map(job => `
            <div class="job-card draft">
                <h3>${job.title}</h3>
                <p>${job.company?.name || 'Unknown Company'}</p>
                <p>Status: Draft</p>
                <div class="job-actions">
                    <button onclick="dashboard.editJob('${job._id}')">Edit</button>
                    <button onclick="dashboard.publishJob('${job._id}')">Publish</button>
                    <button onclick="dashboard.deleteJob('${job._id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    displayJobResponses(applications) {
        const container = document.getElementById('jobResponsesContainer');
        if (!container) return;

        container.innerHTML = applications.map(app => `
            <div class="application-card">
                <h3>${app.job?.title || 'Unknown Job'}</h3>
                <p>Applicant: ${app.applicant?.firstName} ${app.applicant?.lastName}</p>
                <p>Status: ${app.status}</p>
                <p>Applied: ${JobWalaAPI.formatIndianDate(app.appliedAt)}</p>
                <div class="application-actions">
                    <button onclick="dashboard.viewApplication('${app._id}')">View</button>
                    <button onclick="dashboard.updateApplicationStatus('${app._id}', 'accepted')">Accept</button>
                    <button onclick="dashboard.updateApplicationStatus('${app._id}', 'rejected')">Reject</button>
                </div>
            </div>
        `).join('');
    }

    displayCandidates(candidates) {
        const container = document.getElementById('candidatesContainer');
        if (!container) return;

        container.innerHTML = candidates.map(candidate => `
            <div class="candidate-card">
                <h3>${candidate.firstName} ${candidate.lastName}</h3>
                <p>${candidate.email}</p>
                <p>${candidate.experience}</p>
                <p>${candidate.skills?.join(', ') || 'No skills listed'}</p>
                <div class="candidate-actions">
                    <button onclick="dashboard.viewCandidate('${candidate._id}')">View Profile</button>
                    <button onclick="dashboard.contactCandidate('${candidate._id}')">Contact</button>
                </div>
            </div>
        `).join('');
    }

    displayResumes(resumes) {
        const container = document.getElementById('resumesContainer');
        if (!container) return;

        container.innerHTML = resumes.map(resume => `
            <div class="resume-card">
                <h3>${resume.title}</h3>
                <p>Owner: ${resume.owner?.firstName} ${resume.owner?.lastName}</p>
                <p>Updated: ${JobWalaAPI.formatIndianDate(resume.updatedAt)}</p>
                <div class="resume-actions">
                    <button onclick="dashboard.viewResume('${resume._id}')">View</button>
                    <button onclick="dashboard.downloadResume('${resume._id}')">Download</button>
                </div>
            </div>
        `).join('');
    }

    displayEmployees(employees) {
        const container = document.getElementById('employeesContainer');
        if (!container) return;

        container.innerHTML = employees.map(employee => `
            <div class="employee-card">
                <h3>${employee.firstName} ${employee.lastName}</h3>
                <p>${employee.email}</p>
                <p>Department: ${employee.department || 'Not assigned'}</p>
                <p>Role: ${employee.role || 'Employee'}</p>
                <div class="employee-actions">
                    <button onclick="dashboard.editEmployee('${employee._id}')">Edit</button>
                    <button onclick="dashboard.removeEmployee('${employee._id}')">Remove</button>
                </div>
            </div>
        `).join('');
    }

    displaySubusers(subusers) {
        const container = document.getElementById('subusersContainer');
        if (!container) return;

        container.innerHTML = subusers.map(subuser => `
            <div class="subuser-card">
                <h3>${subuser.firstName} ${subuser.lastName}</h3>
                <p>${subuser.email}</p>
                <p>Role: ${subuser.role}</p>
                <p>Status: ${subuser.isActive ? 'Active' : 'Inactive'}</p>
                <div class="subuser-actions">
                    <button onclick="dashboard.editSubuser('${subuser._id}')">Edit</button>
                    <button onclick="dashboard.toggleSubuserStatus('${subuser._id}')">Toggle Status</button>
                </div>
            </div>
        `).join('');
    }

    displayDepartments(departments) {
        const container = document.getElementById('departmentsContainer');
        if (!container) return;

        container.innerHTML = departments.map(dept => `
            <div class="department-card">
                <h3>${dept.name}</h3>
                <p>${dept.description || 'No description'}</p>
                <p>Employees: ${dept.employeeCount || 0}</p>
                <div class="department-actions">
                    <button onclick="dashboard.editDepartment('${dept._id}')">Edit</button>
                    <button onclick="dashboard.deleteDepartment('${dept._id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    displayClients(clients) {
        const container = document.getElementById('clientsContainer');
        if (!container) return;

        container.innerHTML = clients.map(client => `
            <div class="client-card">
                <h3>${client.name}</h3>
                <p>${client.email}</p>
                <p>Industry: ${client.industry || 'Not specified'}</p>
                <p>Status: ${client.status || 'Active'}</p>
                <div class="client-actions">
                    <button onclick="dashboard.viewClient('${client._id}')">View</button>
                    <button onclick="dashboard.editClient('${client._id}')">Edit</button>
                </div>
            </div>
        `).join('');
    }

    displayAnalytics(analytics) {
        const container = document.getElementById('analyticsContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>Total Candidates</h3>
                    <p class="analytics-number">${analytics.totalCandidates || 0}</p>
                </div>
                <div class="analytics-card">
                    <h3>Active Jobs</h3>
                    <p class="analytics-number">${analytics.activeJobs || 0}</p>
                </div>
                <div class="analytics-card">
                    <h3>Placements</h3>
                    <p class="analytics-number">${analytics.placements || 0}</p>
                </div>
                <div class="analytics-card">
                    <h3>Revenue</h3>
                    <p class="analytics-number">$${analytics.revenue || 0}</p>
                </div>
            </div>
        `;
    }

    displayAdminPanel(data) {
        const container = document.getElementById('adminPanelContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="admin-stats">
                <div class="stat-card">
                    <h3>Total Users</h3>
                    <p>${data.totalUsers || 0}</p>
                </div>
                <div class="stat-card">
                    <h3>Total Jobs</h3>
                    <p>${data.totalJobs || 0}</p>
                </div>
                <div class="stat-card">
                    <h3>Total Applications</h3>
                    <p>${data.totalApplications || 0}</p>
                </div>
                <div class="stat-card">
                    <h3>Active Companies</h3>
                    <p>${data.activeCompanies || 0}</p>
                </div>
            </div>
        `;
    }

    displayUsers(users) {
        const container = document.getElementById('usersContainer');
        if (!container) return;

        container.innerHTML = users.map(user => `
            <div class="user-card">
                <h3>${user.firstName} ${user.lastName}</h3>
                <p>${user.email}</p>
                <p>Type: ${user.userType}</p>
                <p>Status: ${user.isActive ? 'Active' : 'Inactive'}</p>
                <div class="user-actions">
                    <button onclick="dashboard.editUser('${user._id}')">Edit</button>
                    <button onclick="dashboard.toggleUserStatus('${user._id}')">Toggle Status</button>
                </div>
            </div>
        `).join('');
    }

    displaySystemSettings(settings) {
        const container = document.getElementById('settingsContainer');
        if (!container) return;

        container.innerHTML = `
            <form id="systemSettingsForm">
                <div class="form-group">
                    <label>Site Name</label>
                    <input type="text" name="siteName" value="${settings.siteName || ''}">
                </div>
                <div class="form-group">
                    <label>Site Description</label>
                    <textarea name="siteDescription">${settings.siteDescription || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Max File Size (MB)</label>
                    <input type="number" name="maxFileSize" value="${settings.maxFileSize || 10}">
                </div>
                <button type="submit">Save Settings</button>
            </form>
        `;
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
