// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.currentData = {
            users: { data: [], page: 1, total: 0 },
            jobs: { data: [], page: 1, total: 0 },
            applications: { data: [], page: 1, total: 0 }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Wait for API service to load
        this.waitForAPIService();
    }
    
    waitForAPIService() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkAPI = () => {
            attempts++;
            console.log(`Checking for API service, attempt ${attempts}`);
            
            if (window.api && window.authUtils) {
                console.log('API service loaded, proceeding with auth check');
                this.checkAuth();
            } else if (attempts < maxAttempts) {
                console.log('API service not ready, waiting...');
                setTimeout(checkAPI, 100);
            } else {
                console.error('API service failed to load after maximum attempts');
                this.showError('Failed to load API service. Please refresh the page.');
            }
        };
        
        checkAPI();
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

        // User management
        document.getElementById('addUserBtn').addEventListener('click', () => {
            this.showUserModal();
        });

        document.getElementById('refreshUsersBtn').addEventListener('click', () => {
            this.loadUsers();
        });

        document.getElementById('userSearch').addEventListener('input', (e) => {
            this.debounce(() => this.loadUsers(), 500)();
        });

        document.getElementById('userTypeFilter').addEventListener('change', () => {
            this.loadUsers();
        });

        // Job management
        document.getElementById('addJobBtn').addEventListener('click', () => {
            this.showJobModal();
        });

        // Test job creation
        document.getElementById('testJobBtn').addEventListener('click', async () => {
            console.log('Testing job creation...');
            if (window.testJobCreation) {
                const result = await window.testJobCreation();
                if (result) {
                    this.showSuccess('Test job creation successful!');
                    this.loadJobs();
                } else {
                    this.showError('Test job creation failed. Check console for details.');
                }
            } else {
                this.showError('Test function not available');
            }
        });

        document.getElementById('refreshJobsBtn').addEventListener('click', () => {
            this.loadJobs();
        });

        document.getElementById('jobSearch').addEventListener('input', (e) => {
            this.debounce(() => this.loadJobs(), 500)();
        });

        document.getElementById('jobStatusFilter').addEventListener('change', () => {
            this.loadJobs();
        });

        // Application management
        document.getElementById('refreshApplicationsBtn').addEventListener('click', () => {
            this.loadApplications();
        });

        document.getElementById('applicationStatusFilter').addEventListener('change', () => {
            this.loadApplications();
        });

        // Modal events
        this.setupModalEvents();
    }

    setupModalEvents() {
        // User modal
        document.getElementById('closeUserModal').addEventListener('click', () => {
            this.hideModal('userModal');
        });

        document.getElementById('cancelUserBtn').addEventListener('click', () => {
            this.hideModal('userModal');
        });

        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });

        // Job modal
        document.getElementById('closeJobModal').addEventListener('click', () => {
            this.hideModal('jobModal');
        });

        document.getElementById('cancelJobBtn').addEventListener('click', () => {
            this.hideModal('jobModal');
        });

        document.getElementById('jobForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveJob();
        });

        // Application status modal
        document.getElementById('closeApplicationStatusModal').addEventListener('click', () => {
            this.hideModal('applicationStatusModal');
        });

        document.getElementById('cancelApplicationStatusBtn').addEventListener('click', () => {
            this.hideModal('applicationStatusModal');
        });

        document.getElementById('applicationStatusForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateApplicationStatus();
        });

        // Blog form submission
        document.getElementById('blogForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBlog();
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    async checkAuth() {
        console.log('Checking authentication...');
        console.log('window.authUtils available:', !!window.authUtils);
        console.log('window.api available:', !!window.api);
        
        // Check if user is authenticated and is admin
        if (!window.authUtils || !window.authUtils.isLoggedIn()) {
            console.log('No authentication found, redirecting to login');
            window.location.href = 'login.html';
            return;
        }

        const currentUser = window.authUtils.getCurrentUser();
        console.log('Current user from storage:', currentUser);
        
        if (!currentUser) {
            console.log('No current user found, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
        
        // Check if user is admin or superadmin
        const isAdmin = currentUser.userType === 'admin' || currentUser.userType === 'superadmin';
        console.log('User type:', currentUser.userType);
        console.log('Is admin:', isAdmin);
        
        if (!isAdmin) {
            console.log('User is not admin, redirecting to login');
            window.location.href = 'login.html';
            return;
        }

        try {
            this.currentUser = currentUser;
            this.updateUserInfo();
            console.log('Admin authentication successful');
            // Load dashboard data after successful authentication
            this.loadDashboard();
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'login.html';
        }
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            document.getElementById('userAvatar').textContent = this.currentUser.firstName.charAt(0).toUpperCase();
        }
    }

    navigateToPage(page) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
        });

        // Show current page
        document.getElementById(`${page}Page`).classList.remove('hidden');
        document.getElementById('pageTitle').textContent = this.getPageTitle(page);

        this.currentPage = page;

        // Load page data
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'jobs':
                this.loadJobs();
                break;
            case 'applications':
                this.loadApplications();
                break;
            case 'blogs':
                this.loadBlogs();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    getPageTitle(page) {
        const titles = {
            dashboard: 'Dashboard',
            users: 'User Management',
            jobs: 'Job Management',
            applications: 'Application Management',
            blogs: 'Blog Management',
            analytics: 'Analytics',
            settings: 'Settings'
        };
        return titles[page] || 'Admin Panel';
    }

    async loadDashboard() {
        try {
            console.log('Loading dashboard data...');
            console.log('Current user:', this.currentUser);
            console.log('Auth status:', window.authUtils ? window.authUtils.isLoggedIn() : 'authUtils not available');
            
            const response = await window.api.getAdminDashboard();
            console.log('Dashboard response:', response);
            this.updateDashboardStats(response);
            this.updateRecentUsers(response.recentUsers);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            console.error('Error details:', error.message);
            
            // Check if it's an authentication error
            if (error.message.includes('Token is not valid') || error.message.includes('authorization denied')) {
                console.log('Authentication error detected, redirecting to login');
                window.location.href = 'login.html';
                return;
            }
            
            this.showError('Failed to load dashboard data: ' + error.message);
        }
    }

    updateDashboardStats(data) {
        document.getElementById('totalUsers').textContent = data.stats.totalUsers || 0;
        document.getElementById('totalJobs').textContent = data.stats.totalJobs || 0;
        document.getElementById('totalApplications').textContent = data.stats.totalApplications || 0;
        document.getElementById('activeJobs').textContent = data.stats.activeJobs || 0;
    }

    updateRecentUsers(users) {
        const tbody = document.getElementById('recentUsersTable');
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No recent users</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td><span class="status-badge status-${user.userType}">${user.userType}</span></td>
                <td><span class="status-badge status-${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }

    async loadUsers(page = 1) {
        try {
            const search = document.getElementById('userSearch').value;
            const userType = document.getElementById('userTypeFilter').value;
            
            const filters = {
                page: page,
                limit: 10,
                ...(search && { search }),
                ...(userType && { userType })
            };

            const response = await window.api.getAllUsers(filters);
            this.currentData.users = response;
            this.updateUsersTable(response.users);
            this.updatePagination('usersPagination', response.pagination, 'loadUsers');
        } catch (error) {
            console.error('Failed to load users:', error);
            this.showError('Failed to load users');
        }
    }

    updateUsersTable(users) {
        const tbody = document.getElementById('usersTable');
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 30px; height: 30px; border-radius: 50%; background: #3498db; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                            ${user.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: 600;">${user.firstName} ${user.lastName}</div>
                            <div style="font-size: 12px; color: #666;">${user.phone || 'No phone'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div>${user.email}</div>
                    <div style="font-size: 12px; color: #666;">
                        ${user.isEmailVerified ? '✓ Verified' : '✗ Not verified'}
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${user.userType}">${user.userType}</span>
                    ${user.employerType ? `<br><small style="color: #666;">${user.employerType}</small>` : ''}
                </td>
                <td><span class="status-badge status-${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div>${new Date(user.createdAt).toLocaleDateString()}</div>
                    <div style="font-size: 12px; color: #666;">
                        ${user.lastLogin ? 'Last login: ' + new Date(user.lastLogin).toLocaleDateString() : 'Never logged in'}
                    </div>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="adminPanel.viewUserDetails('${user._id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="adminPanel.editUser('${user._id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="adminPanel.deleteUser('${user._id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadJobs(page = 1) {
        try {
            const search = document.getElementById('jobSearch').value;
            const status = document.getElementById('jobStatusFilter').value;
            
            const filters = {
                page: page,
                limit: 10,
                ...(search && { search }),
                ...(status && { status })
            };

            const response = await window.api.getAllJobs(filters);
            this.currentData.jobs = response;
            this.updateJobsTable(response.jobs);
            this.updatePagination('jobsPagination', response.pagination, 'loadJobs');
        } catch (error) {
            console.error('Failed to load jobs:', error);
            this.showError('Failed to load jobs');
        }
    }

    updateJobsTable(jobs) {
        const tbody = document.getElementById('jobsTable');
        if (!jobs || jobs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No jobs found</td></tr>';
            return;
        }

        tbody.innerHTML = jobs.map(job => `
            <tr>
                <td>${job.title}</td>
                <td>${job.company.name}</td>
                <td>${job.location.city}, ${job.location.state}</td>
                <td><span class="status-badge status-${job.status}">${job.status}</span></td>
                <td>${job.postedBy ? `${job.postedBy.firstName} ${job.postedBy.lastName}` : 'Unknown'}</td>
                <td>${new Date(job.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="adminPanel.editJob('${job._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="adminPanel.deleteJob('${job._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadApplications(page = 1) {
        try {
            const status = document.getElementById('applicationStatusFilter').value;
            
            const filters = {
                page: page,
                limit: 10,
                ...(status && { status })
            };

            const response = await window.api.getAllApplications(filters);
            this.currentData.applications = response;
            this.updateApplicationsTable(response.applications);
            this.updatePagination('applicationsPagination', response.pagination, 'loadApplications');
        } catch (error) {
            console.error('Failed to load applications:', error);
            this.showError('Failed to load applications');
        }
    }

    updateApplicationsTable(applications) {
        const tbody = document.getElementById('applicationsTable');
        if (!applications || applications.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No applications found</td></tr>';
            return;
        }

        tbody.innerHTML = applications.map(app => `
            <tr>
                <td>${app.fullName || (app.user ? `${app.user.firstName} ${app.user.lastName}` : 'Unknown')}</td>
                <td>${app.email || 'N/A'}</td>
                <td>${app.mobileNumber || 'N/A'}</td>
                <td>${app.job ? app.job.title : 'Unknown'}</td>
                <td>${app.job ? app.job.company.name : 'Unknown'}</td>
                <td><span class="status-badge status-${app.status}">${app.status}</span></td>
                <td>${new Date(app.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="adminPanel.viewApplicationDetails('${app._id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="adminPanel.updateApplicationStatus('${app._id}', '${app.status}')">
                        <i class="fas fa-edit"></i> Update Status
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadAnalytics() {
        try {
            const response = await window.api.getAdminAnalytics();
            this.updateAnalyticsStats(response);
            this.updateTopCompanies(response.topCompanies);
        } catch (error) {
            console.error('Failed to load analytics:', error);
            this.showError('Failed to load analytics data');
        }
    }

    updateAnalyticsStats(data) {
        // Update analytics stats
        const userStats = data.userStats || [];
        const jobStats = data.jobStats || [];
        const applicationStats = data.applicationStats || [];

        let totalUsers = 0;
        let totalJobs = 0;
        let totalApplications = 0;

        userStats.forEach(stat => totalUsers += stat.count);
        jobStats.forEach(stat => totalJobs += stat.count);
        applicationStats.forEach(stat => totalApplications += stat.count);

        document.getElementById('analyticsUsers').textContent = totalUsers;
        document.getElementById('analyticsJobs').textContent = totalJobs;
        document.getElementById('analyticsApplications').textContent = totalApplications;
    }

    updateTopCompanies(companies) {
        const tbody = document.getElementById('topCompaniesTable');
        if (!companies || companies.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No data available</td></tr>';
            return;
        }

        tbody.innerHTML = companies.map(company => `
            <tr>
                <td>${company._id}</td>
                <td>${company.jobCount}</td>
                <td>₹${Math.round(company.avgSalary / 2).toLocaleString()}</td>
            </tr>
        `).join('');
    }

    showUserModal(userId = null) {
        const modal = document.getElementById('userModal');
        const title = document.getElementById('userModalTitle');
        
        if (userId) {
            title.textContent = 'Edit User';
            // Load user data for editing
            this.loadUserForEdit(userId);
        } else {
            title.textContent = 'Add User';
            this.clearUserForm();
        }
        
        modal.classList.add('show');
    }

    showJobModal(jobId = null) {
        // Use the comprehensive job form
        if (window.comprehensiveJobForm) {
            if (jobId) {
                // Load job for editing
                this.loadJobForEdit(jobId);
            } else {
                // Reset form for new job
                window.comprehensiveJobForm.resetForm();
            }
            window.comprehensiveJobForm.openModal();
        } else {
            // Fallback to original modal
            const modal = document.getElementById('jobModal');
            const title = document.getElementById('jobModalTitle');
            
            if (jobId) {
                title.textContent = 'Edit Job';
                this.loadJobForEdit(jobId);
            } else {
                title.textContent = 'Add Job';
                this.clearJobForm();
            }
            
            modal.classList.add('show');
        }
    }

    clearUserForm() {
        document.getElementById('userForm').reset();
    }

    clearJobForm() {
        document.getElementById('jobForm').reset();
    }

    async saveUser() {
        try {
            const formData = {
                firstName: document.getElementById('userFirstName').value,
                lastName: document.getElementById('userLastName').value,
                email: document.getElementById('userEmail').value,
                phone: document.getElementById('userPhone').value,
                userType: document.getElementById('userType').value,
                password: document.getElementById('userPassword').value,
                isActive: document.getElementById('userStatus').value === 'true'
            };

            await this.apiCall('/api/auth/register', 'POST', formData);
            this.hideModal('userModal');
            this.showSuccess('User saved successfully');
            this.loadUsers();
        } catch (error) {
            console.error('Failed to save user:', error);
            this.showError('Failed to save user');
        }
    }

    async saveJob() {
        try {
            // Check if we have comprehensive form fields
            const isComprehensiveForm = document.getElementById('companyType') !== null;
            console.log('Is comprehensive form:', isComprehensiveForm);
            
            let formData;
            
            if (isComprehensiveForm) {
                // Use comprehensive form data structure
                formData = {
                    title: document.getElementById('jobTitle').value,
                    description: document.getElementById('jobDescription').value,
                    company: {
                        name: document.getElementById('companyName').value,
                        type: document.getElementById('companyType').value,
                        totalEmployees: document.getElementById('totalEmployees').value,
                        website: document.getElementById('companyWebsite').value
                    },
                    jobSectorType: document.getElementById('jobSectorType').value,
                    jobPostType: document.getElementById('jobPostType').value,
                    employmentType: document.getElementById('employmentType').value,
                    jobModeType: document.getElementById('jobModeType').value,
                    jobShiftType: document.getElementById('jobShiftType').value,
                    skills: document.getElementById('jobSkills').value.split(',').map(s => s.trim()).filter(s => s),
                    location: {
                        state: document.getElementById('jobState').value,
                        city: document.getElementById('jobCity').value,
                        locality: document.getElementById('jobLocality').value,
                        distanceFromLocation: document.getElementById('distanceFromLocation').value,
                        includeWillingToRelocate: document.getElementById('includeWillingToRelocate').checked
                    },
                    candidateType: document.getElementById('candidateType').value,
                    totalExperience: document.getElementById('totalExperience').value,
                    salary: {
                        min: parseInt(document.getElementById('minSalary').value),
                        max: parseInt(document.getElementById('maxSalary').value),
                        currency: 'INR',
                        hideFromCandidates: document.getElementById('hideSalaryDetails').checked
                    },
                    numberOfVacancy: parseInt(document.getElementById('numberOfVacancy').value),
                    includeWalkinDetails: document.getElementById('includeWalkinDetails').checked,
                    hrContact: {
                        name: document.getElementById('hrContactName').value,
                        number: document.getElementById('hrContactNumber').value,
                        email: document.getElementById('hrContactEmail').value,
                        whatsappNumber: document.getElementById('hrContactWhatsapp').value
                    }
                };
            } else {
                // Use original form data structure for backward compatibility
                formData = {
                    title: document.getElementById('jobTitle').value,
                    description: document.getElementById('jobDescription').value,
                    company: {
                        name: document.getElementById('companyName').value,
                        website: document.getElementById('companyWebsite').value
                    },
                    location: {
                        city: document.getElementById('jobCity').value,
                        state: document.getElementById('jobState').value,
                        country: 'India'
                    },
                    salary: {
                        min: parseInt(document.getElementById('minSalary').value),
                        max: parseInt(document.getElementById('maxSalary').value),
                        currency: 'INR'
                    },
                    jobType: document.getElementById('jobType') ? document.getElementById('jobType').value : 'full-time',
                    workMode: document.getElementById('workMode') ? document.getElementById('workMode').value : 'office',
                    requirements: {
                        skills: document.getElementById('jobSkills').value.split(',').map(s => s.trim()).filter(s => s)
                    }
                };
            }

            console.log('Submitting job data:', formData);
            console.log('HR Contact data:', formData.hrContact);
            await this.apiCall('/admin/jobs', 'POST', formData);
            this.hideModal('jobModal');
            this.showSuccess('Job saved successfully');
            this.loadJobs();
        } catch (error) {
            console.error('Failed to save job:', error);
            this.showError('Failed to save job');
        }
    }

    async editUser(userId) {
        try {
            const response = await this.apiCall(`/api/admin/users/${userId}`, 'GET');
            const user = response.user;
            
            document.getElementById('userFirstName').value = user.firstName;
            document.getElementById('userLastName').value = user.lastName;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPhone').value = user.phone || '';
            document.getElementById('userType').value = user.userType;
            document.getElementById('userStatus').value = user.isActive ? 'true' : 'false';
            document.getElementById('userPassword').value = '';
            
            this.showUserModal(userId);
        } catch (error) {
            console.error('Failed to load user:', error);
            this.showError('Failed to load user data');
        }
    }

    async editJob(jobId) {
        // Implementation for editing jobs
        this.showJobModal(jobId);
    }

    async viewUserDetails(userId) {
        try {
            const user = await this.apiCall(`/api/admin/users/${userId}`, 'GET');
            this.showUserDetailsModal(user);
        } catch (error) {
            console.error('Failed to fetch user details:', error);
            this.showError('Failed to fetch user details');
        }
    }

    showUserDetailsModal(user) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2>User Details</h2>
                    <button class="close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <h3>Basic Information</h3>
                            <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
                            <p><strong>User Type:</strong> <span class="status-badge status-${user.userType}">${user.userType}</span></p>
                            ${user.employerType ? `<p><strong>Employer Type:</strong> <span class="status-badge status-${user.employerType}">${user.employerType}</span></p>` : ''}
                            <p><strong>Status:</strong> <span class="status-badge status-${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></p>
                            <p><strong>Email Verified:</strong> ${user.isEmailVerified ? 'Yes' : 'No'}</p>
                            <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                            <p><strong>Last Login:</strong> ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</p>
                        </div>
                        <div>
                            <h3>Profile Information</h3>
                            <p><strong>Bio:</strong> ${user.profile?.bio || 'Not provided'}</p>
                            <p><strong>Location:</strong> ${user.profile?.currentLocation || 'Not provided'}</p>
                            <p><strong>Experience:</strong> ${user.profile?.experience || 0} years</p>
                            <p><strong>Skills:</strong> ${user.profile?.skills?.join(', ') || 'Not provided'}</p>
                            <p><strong>Expected Salary:</strong> ${user.profile?.expectedSalary ? `$${user.profile.expectedSalary.toLocaleString()}` : 'Not provided'}</p>
                            ${user.profile?.company ? `
                                <h3>Company Information</h3>
                                <p><strong>Company:</strong> ${user.profile.company.name || 'Not provided'}</p>
                                <p><strong>Industry:</strong> ${user.profile.company.industry || 'Not provided'}</p>
                                <p><strong>Size:</strong> ${user.profile.company.size || 'Not provided'}</p>
                                <p><strong>Website:</strong> ${user.profile.company.website || 'Not provided'}</p>
                            ` : ''}
                        </div>
                    </div>
                    ${user.profile?.education && user.profile.education.length > 0 ? `
                        <div style="margin-top: 20px;">
                            <h3>Education</h3>
                            ${user.profile.education.map(edu => `
                                <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px;">
                                    <p><strong>${edu.degree}</strong> in ${edu.field || 'N/A'}</p>
                                    <p>${edu.institution} (${edu.year})</p>
                                    <p>Percentage: ${edu.percentage || 'N/A'}%</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${user.profile?.workExperience && user.profile.workExperience.length > 0 ? `
                        <div style="margin-top: 20px;">
                            <h3>Work Experience</h3>
                            ${user.profile.workExperience.map(exp => `
                                <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px;">
                                    <p><strong>${exp.position}</strong> at ${exp.company}</p>
                                    <p>${new Date(exp.startDate).toLocaleDateString()} - ${exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}</p>
                                    <p>Location: ${exp.location || 'Not specified'}</p>
                                    ${exp.salary ? `<p>Salary: $${exp.salary.toLocaleString()}</p>` : ''}
                                    ${exp.description ? `<p>Description: ${exp.description}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="adminPanel.editUser('${user._id}'); this.closest('.modal').remove();">Edit User</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove();">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        
        try {
            await this.apiCall(`/api/admin/users/${userId}`, 'DELETE');
            this.showSuccess('User deleted successfully');
            this.loadUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            this.showError('Failed to delete user');
        }
    }

    async deleteJob(jobId) {
        if (!confirm('Are you sure you want to delete this job?')) return;
        
        try {
            await this.apiCall(`/admin/jobs/${jobId}`, 'DELETE');
            this.showSuccess('Job deleted successfully');
            this.loadJobs();
        } catch (error) {
            console.error('Failed to delete job:', error);
            this.showError('Failed to delete job');
        }
    }

    async viewApplicationDetails(applicationId) {
        try {
            const response = await this.apiCall(`/api/admin/applications/${applicationId}`, 'GET');
            this.showApplicationDetailsModal(response);
        } catch (error) {
            console.error('Failed to load application details:', error);
            this.showError('Failed to load application details');
        }
    }

    showApplicationDetailsModal(application) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3>Application Details - ${application.fullName}</h3>
                    <button class="close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-section">
                        <h4>Personal Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Full Name:</label>
                                <p>${application.fullName || 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>Email:</label>
                                <p>${application.email || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Mobile Number:</label>
                                <p>${application.mobileNumber || 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>WhatsApp Number:</label>
                                <p>${application.whatsappNumber || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Gender:</label>
                                <p>${application.gender || 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>Marital Status:</label>
                                <p>${application.maritalStatus || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Date of Birth:</label>
                                <p>${application.dateOfBirth ? new Date(application.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>Pincode:</label>
                                <p>${application.pincode || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Professional Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Current Job Title:</label>
                                <p>${application.currentJobTitle || 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>Current Company:</label>
                                <p>${application.currentCompanyName || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Current Salary:</label>
                                <p>${application.currentSalary ? '₹' + application.currentSalary + ' LPA' : 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>Expected Salary:</label>
                                <p>₹${application.expectedSalary || 'N/A'} LPA</p>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Job Type:</label>
                                <p>${application.jobType || 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>Job Status:</label>
                                <p>${application.jobStatus || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Total Experience:</label>
                                <p>${application.totalExperience || 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>Notice Period:</label>
                                <p>${application.noticePeriod || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Education & Skills</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Education:</label>
                                <p>${application.education || 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>Course:</label>
                                <p>${application.course || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Skills:</label>
                            <p>${application.skills || 'N/A'}</p>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Location & Preferences</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Current State:</label>
                                <p>${application.currentState || 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>Current City:</label>
                                <p>${application.currentCity || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Current Locality:</label>
                                <p>${application.currentLocality || 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>Home Town:</label>
                                <p>${application.homeTown || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Preferred Language:</label>
                                <p>${application.preferredLanguage || 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>English Fluency:</label>
                                <p>${application.englishFluency || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Preferred Job Cities:</label>
                            <p>${application.preferredJobCities || 'N/A'}</p>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Company & Industry Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Company Type:</label>
                                <p>${application.companyType || 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>Job Industry:</label>
                                <p>${application.jobIndustry || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Department:</label>
                                <p>${application.department || 'N/A'}</p>
                            </div>
                            <div class="form-group">
                                <label>Job Role:</label>
                                <p>${application.jobRole || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    ${application.assetRequirements && application.assetRequirements.length > 0 ? `
                    <div class="form-section">
                        <h4>Asset Requirements</h4>
                        <div class="checkbox-group">
                            ${application.assetRequirements.map(asset => `<span class="skill-tag">${asset}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <div class="form-section">
                        <h4>Resume & Cover Letter</h4>
                        <div class="form-group">
                            <label>Resume URL:</label>
                            <p>${application.resumeUrl ? `<a href="${application.resumeUrl}" target="_blank">View Resume</a>` : 'N/A'}</p>
                        </div>
                        <div class="form-group">
                            <label>Cover Letter:</label>
                            <p style="white-space: pre-wrap;">${application.coverLetter || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    updateApplicationStatus(applicationId, currentStatus) {
        document.getElementById('applicationStatus').value = currentStatus;
        this.currentApplicationId = applicationId;
        document.getElementById('applicationStatusModal').classList.add('show');
    }

    async updateApplicationStatus() {
        try {
            const status = document.getElementById('applicationStatus').value;
            
            await this.apiCall(`/api/admin/applications/${this.currentApplicationId}/status`, 'PUT', { status });
            this.hideModal('applicationStatusModal');
            this.showSuccess('Application status updated successfully');
            this.loadApplications();
        } catch (error) {
            console.error('Failed to update application status:', error);
            this.showError('Failed to update application status');
        }
    }

    updatePagination(containerId, pagination, loadFunction) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { current, pages, total } = pagination;
        
        let html = `
            <button ${current <= 1 ? 'disabled' : ''} onclick="${loadFunction}(${current - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        for (let i = 1; i <= pages; i++) {
            if (i === current || i === 1 || i === pages || (i >= current - 2 && i <= current + 2)) {
                html += `
                    <button class="${i === current ? 'active' : ''}" onclick="${loadFunction}(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === current - 3 || i === current + 3) {
                html += '<span>...</span>';
            }
        }

        html += `
            <button ${current >= pages ? 'disabled' : ''} onclick="${loadFunction}(${current + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = html;
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    async apiCall(endpoint, method = 'GET', data = null) {
        try {
            // Use the global API service
            if (window.api) {
                if (method === 'GET') {
                    return await window.api.request(endpoint);
                } else if (method === 'POST') {
                    return await window.api.request(endpoint, {
                        method: 'POST',
                        body: JSON.stringify(data)
                    });
                } else if (method === 'PUT') {
                    return await window.api.request(endpoint, {
                        method: 'PUT',
                        body: JSON.stringify(data)
                    });
                } else if (method === 'DELETE') {
                    return await window.api.request(endpoint, {
                        method: 'DELETE'
                    });
                }
            } else {
                // Fallback to direct fetch
                const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
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

                console.log(`Making API call to: http://localhost:5000${endpoint}`);
                const response = await fetch(`http://localhost:5000${endpoint}`, config);
                
                console.log(`Response status: ${response.status}`);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error Response:', errorText);
                    let errorData;
                    try {
                        errorData = JSON.parse(errorText);
                    } catch (e) {
                        errorData = { message: errorText || 'API call failed' };
                    }
                    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('API Success Response:', result);
                return result;
            }
        } catch (error) {
            console.error('API Call Error:', error);
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

    async logout() {
        try {
            await window.authUtils.logout();
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect even if logout fails
            window.location.href = 'index.html';
        }
    }

    openDashboard() {
        console.log('openDashboard called');
        // Navigate to the main dashboard overview page
        this.navigateToPage('dashboard');
        // Also scroll to top to ensure user sees the overview
        window.scrollTo(0, 0);
        console.log('Navigation completed');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Blog Management Methods
    async loadBlogs() {
        try {
            const response = await fetch('/api/blogs/admin/all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch blogs');
            }
            
            const data = await response.json();
            this.updateBlogsTable(data.blogs);
        } catch (error) {
            console.error('Error loading blogs:', error);
            this.showError('Failed to load blogs');
        }
    }

    updateBlogsTable(blogs) {
        const tbody = document.getElementById('blogsTableBody');
        if (!tbody) return;

        if (blogs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No blogs found</td></tr>';
            return;
        }

        tbody.innerHTML = blogs.map(blog => `
            <tr>
                <td>
                    <div class="job-title">
                        <strong>${blog.title}</strong>
                        <div class="job-meta">
                            <span class="job-company">${blog.category}</span>
                        </div>
                    </div>
                </td>
                <td>${blog.category}</td>
                <td>${blog.author}</td>
                <td>
                    <span class="status-badge ${blog.published ? 'published' : 'draft'}">
                        ${blog.published ? 'Published' : 'Draft'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${blog.featured ? 'featured' : 'normal'}">
                        ${blog.featured ? 'Featured' : 'Normal'}
                    </span>
                </td>
                <td>${blog.views || 0}</td>
                <td>${new Date(blog.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="adminPanel.editBlog('${blog._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteBlog('${blog._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    showAddBlogModal() {
        document.getElementById('blogModalTitle').textContent = 'Add New Blog';
        document.getElementById('blogForm').reset();
        document.getElementById('blogAuthor').value = 'Admin';
        document.getElementById('blogReadTime').value = '5 min read';
        document.getElementById('blogImage').value = '📚';
        document.getElementById('blogPublished').checked = true;
        this.showModal('blogModal');
    }

    async editBlog(blogId) {
        try {
            const response = await fetch(`/api/blogs/${blogId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch blog');
            }
            
            const data = await response.json();
            const blog = data.blog;
            
            // Populate form with blog data
            document.getElementById('blogModalTitle').textContent = 'Edit Blog';
            document.getElementById('blogTitle').value = blog.title;
            document.getElementById('blogCategory').value = blog.category;
            document.getElementById('blogExcerpt').value = blog.excerpt;
            document.getElementById('blogContent').value = blog.content;
            document.getElementById('blogAuthor').value = blog.author;
            document.getElementById('blogReadTime').value = blog.readTime;
            document.getElementById('blogImage').value = blog.image;
            document.getElementById('blogImageUrl').value = blog.imageUrl || '';
            document.getElementById('blogTags').value = blog.tags ? blog.tags.join(', ') : '';
            document.getElementById('blogSeoTitle').value = blog.seoTitle || '';
            document.getElementById('blogSeoDescription').value = blog.seoDescription || '';
            document.getElementById('blogFeatured').checked = blog.featured;
            document.getElementById('blogPublished').checked = blog.published;
            
            // Store blog ID for update
            document.getElementById('blogForm').dataset.blogId = blogId;
            
            this.showModal('blogModal');
        } catch (error) {
            console.error('Error loading blog:', error);
            this.showError('Failed to load blog details');
        }
    }

    async saveBlog() {
        const form = document.getElementById('blogForm');
        const formData = new FormData(form);
        
        const blogData = {
            title: formData.get('title'),
            category: formData.get('category'),
            excerpt: formData.get('excerpt'),
            content: formData.get('content'),
            author: formData.get('author'),
            readTime: formData.get('readTime'),
            image: formData.get('image'),
            imageUrl: formData.get('imageUrl'),
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
            seoTitle: formData.get('seoTitle'),
            seoDescription: formData.get('seoDescription'),
            featured: formData.get('featured') === 'on',
            published: formData.get('published') === 'on'
        };

        try {
            const blogId = form.dataset.blogId;
            const url = blogId ? `/api/blogs/${blogId}` : '/api/blogs';
            const method = blogId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(blogData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save blog');
            }

            const data = await response.json();
            this.showSuccess(blogId ? 'Blog updated successfully!' : 'Blog created successfully!');
            this.hideModal('blogModal');
            this.loadBlogs();
        } catch (error) {
            console.error('Error saving blog:', error);
            this.showError(error.message);
        }
    }

    async deleteBlog(blogId) {
        if (!confirm('Are you sure you want to delete this blog?')) {
            return;
        }

        try {
            const response = await fetch(`/api/blogs/${blogId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete blog');
            }

            this.showSuccess('Blog deleted successfully!');
            this.loadBlogs();
        } catch (error) {
            console.error('Error deleting blog:', error);
            this.showError('Failed to delete blog');
        }
    }

    closeBlogModal() {
        this.hideModal('blogModal');
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});
