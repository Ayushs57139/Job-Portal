// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.currentData = {
            users: { data: [], page: 1, total: 0 },
            jobs: { data: [], page: 1, total: 0 },
            applications: { data: [], page: 1, total: 0 },
            teamLimits: { data: [], page: 1, total: 0 }
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

        // Team limits management
        document.getElementById('refreshTeamLimitsBtn').addEventListener('click', () => {
            this.loadTeamLimits();
        });

        document.getElementById('teamLimitsSearch').addEventListener('input', (e) => {
            this.debounce(() => this.loadTeamLimits(), 500)();
        });

        document.getElementById('teamLimitsTypeFilter').addEventListener('change', () => {
            this.loadTeamLimits();
        });

        // Team limits modal
        document.getElementById('closeTeamLimitsModal').addEventListener('click', () => {
            this.hideTeamLimitsModal();
        });

        document.getElementById('cancelTeamLimitsModal').addEventListener('click', () => {
            this.hideTeamLimitsModal();
        });

        document.getElementById('saveTeamLimitsModal').addEventListener('click', () => {
            this.saveTeamLimits();
        });

        document.getElementById('teamLimitsMaxMembers').addEventListener('input', (e) => {
            this.updateRemainingSlots();
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

        // Bulk import/export events
        this.setupBulkImportExportEvents();

        // Verification events
        this.setupVerificationEvents();

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

        // Bulk import modal events
        document.getElementById('closeBulkImportModal').addEventListener('click', () => {
            this.hideModal('bulkImportModal');
        });

        document.getElementById('cancelBulkImportBtn').addEventListener('click', () => {
            this.hideModal('bulkImportModal');
        });

        document.getElementById('bulkImportForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBulkImport();
        });

        // Education modal events
        document.getElementById('closeEducationModal').addEventListener('click', () => {
            this.hideModal('educationModal');
        });

        document.getElementById('closeEducationModalBtn').addEventListener('click', () => {
            this.hideModal('educationModal');
        });

        // Custom field modal events
        document.getElementById('closeCustomFieldModal').addEventListener('click', () => {
            this.hideModal('customFieldModal');
        });

        document.getElementById('closeCustomFieldModalBtn').addEventListener('click', () => {
            this.hideModal('customFieldModal');
        });

        document.getElementById('customFieldForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCustomField();
        });
    }

    setupBulkImportExportEvents() {
        // Users bulk operations
        document.getElementById('exportUsersBtn').addEventListener('click', () => {
            this.exportData('users');
        });

        document.getElementById('importUsersBtn').addEventListener('click', () => {
            this.showBulkImportModal('users');
        });

        document.getElementById('sampleUsersBtn').addEventListener('click', () => {
            this.downloadSampleCSV('users');
        });

        // Jobs bulk operations
        document.getElementById('exportJobsBtn').addEventListener('click', () => {
            this.exportData('jobs');
        });

        document.getElementById('importJobsBtn').addEventListener('click', () => {
            this.showBulkImportModal('jobs');
        });

        document.getElementById('sampleJobsBtn').addEventListener('click', () => {
            this.downloadSampleCSV('jobs');
        });

        // Applications bulk operations
        document.getElementById('exportApplicationsBtn').addEventListener('click', () => {
            this.exportData('applications');
        });

        document.getElementById('importApplicationsBtn').addEventListener('click', () => {
            this.showBulkImportModal('applications');
        });

        document.getElementById('sampleApplicationsBtn').addEventListener('click', () => {
            this.downloadSampleCSV('applications');
        });

        // Blogs bulk operations
        document.getElementById('exportBlogsBtn').addEventListener('click', () => {
            this.exportData('blogs');
        });

        document.getElementById('importBlogsBtn').addEventListener('click', () => {
            this.showBulkImportModal('blogs');
        });

        document.getElementById('sampleBlogsBtn').addEventListener('click', () => {
            this.downloadSampleCSV('blogs');
        });
    }

    setupVerificationEvents() {
        console.log('Setting up verification events...');
        
        // Refresh verifications
        const refreshBtn = document.getElementById('refreshVerificationsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('Refresh verifications clicked');
                this.loadVerifications();
            });
        } else {
            console.error('Refresh verifications button not found');
        }

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remove active class from all tabs
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                e.target.classList.add('active');
                // Load verifications with filter
                const status = e.target.dataset.status;
                this.loadVerifications(status);
            });
        });

        // Verification modals
        const closeVerificationModal = document.getElementById('closeVerificationModal');
        if (closeVerificationModal) {
            closeVerificationModal.addEventListener('click', () => {
                console.log('Close verification modal clicked');
                this.hideModal('verificationModal');
            });
        } else {
            console.error('Close verification modal button not found');
        }

        const closeVerificationActionModal = document.getElementById('closeVerificationActionModal');
        if (closeVerificationActionModal) {
            closeVerificationActionModal.addEventListener('click', () => {
                console.log('Close verification action modal clicked');
                this.hideModal('verificationActionModal');
            });
        } else {
            console.error('Close verification action modal button not found');
        }

        const cancelVerificationActionBtn = document.getElementById('cancelVerificationActionBtn');
        if (cancelVerificationActionBtn) {
            cancelVerificationActionBtn.addEventListener('click', () => {
                console.log('Cancel verification action clicked');
                this.hideModal('verificationActionModal');
            });
        } else {
            console.error('Cancel verification action button not found');
        }

        document.getElementById('actionType').addEventListener('change', (e) => {
            const rejectionReasonGroup = document.getElementById('rejectionReasonGroup');
            if (e.target.value === 'reject') {
                rejectionReasonGroup.style.display = 'block';
                document.getElementById('rejectionReason').required = true;
            } else {
                rejectionReasonGroup.style.display = 'none';
                document.getElementById('rejectionReason').required = false;
            }
        });

        const submitVerificationActionBtn = document.getElementById('submitVerificationActionBtn');
        if (submitVerificationActionBtn) {
            submitVerificationActionBtn.addEventListener('click', () => {
                console.log('Submit verification action clicked');
                this.submitVerificationAction();
            });
        } else {
            console.error('Submit verification action button not found');
        }
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
        const pageElement = document.getElementById(`${page}Page`);
        if (pageElement) {
            pageElement.classList.remove('hidden');
            console.log(`Showing page: ${page}Page`);
            console.log('Page element classes:', pageElement.className);
        } else {
            console.error(`Page element not found: ${page}Page`);
        }
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
            case 'team-limits':
                this.loadTeamLimits();
                break;
            case 'blogs':
                this.loadBlogs();
                break;
            case 'verification':
                this.loadVerifications();
                this.loadVerificationStats();
                break;
            case 'sales-enquiries':
                this.loadSalesEnquiries();
                this.loadSalesEnquiryStats();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'custom-fields':
                console.log('Loading custom fields page...');
                // Add a small delay to ensure page is visible
                setTimeout(() => {
                    this.loadCustomFields();
                }, 100);
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
            verification: 'Employer Verification',
            'sales-enquiries': 'Sales Enquiries',
            analytics: 'Analytics',
            'custom-fields': 'Custom Fields Management',
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
                <td>${JobWalaAPI.formatIndianDate(user.createdAt)}</td>
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
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
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
                <td>
                    ${user.profile?.education && user.profile.education.length > 0 ? 
                        `<button class="btn btn-info btn-sm" onclick="adminPanel.viewEducationDetails('${user._id}')" title="View Education">
                            <i class="fas fa-graduation-cap"></i> ${user.profile.education.length} Entry${user.profile.education.length > 1 ? 'ies' : ''}
                        </button>` : 
                        '<span style="color: #999; font-size: 12px;">No education data</span>'
                    }
                </td>
                <td><span class="status-badge status-${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div>${JobWalaAPI.formatIndianDate(user.createdAt)}</div>
                    <div style="font-size: 12px; color: #666;">
                        ${user.lastLogin ? 'Last login: ' + JobWalaAPI.formatIndianDate(user.lastLogin) : 'Never logged in'}
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
                <td>${JobWalaAPI.formatIndianDate(job.createdAt)}</td>
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
                <td>${JobWalaAPI.formatIndianDate(app.createdAt)}</td>
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
                <td>${JobWalaAPI.formatIndianCurrency(Math.round(company.avgSalary / 2))}</td>
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
                            <p><strong>Joined:</strong> ${JobWalaAPI.formatIndianDate(user.createdAt)}</p>
                            <p><strong>Last Login:</strong> ${user.lastLogin ? JobWalaAPI.formatIndianDate(user.lastLogin) : 'Never'}</p>
                        </div>
                        <div>
                            <h3>Profile Information</h3>
                            <p><strong>Bio:</strong> ${user.profile?.bio || 'Not provided'}</p>
                            <p><strong>Location:</strong> ${user.profile?.currentLocation || 'Not provided'}</p>
                            <p><strong>Experience:</strong> ${user.profile?.experience || 0} years</p>
                            <p><strong>Skills:</strong> ${user.profile?.skills?.join(', ') || 'Not provided'}</p>
                            <p><strong>Expected Salary:</strong> ${user.profile?.expectedSalary ? JobWalaAPI.formatIndianCurrency(user.profile.expectedSalary) : 'Not provided'}</p>
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
                                    <p>${JobWalaAPI.formatIndianDate(exp.startDate)} - ${exp.current ? 'Present' : JobWalaAPI.formatIndianDate(exp.endDate)}</p>
                                    <p>Location: ${exp.location || 'Not specified'}</p>
                                    ${exp.salary ? `<p>Salary: ${JobWalaAPI.formatIndianCurrency(exp.salary)}</p>` : ''}
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

    async viewEducationDetails(userId) {
        try {
            const user = await this.apiCall(`/api/admin/users/${userId}`, 'GET');
            this.showEducationDetailsModal(user);
        } catch (error) {
            console.error('Failed to fetch user education details:', error);
            this.showError('Failed to fetch education details');
        }
    }

    showEducationDetailsModal(user) {
        const modal = document.getElementById('educationModal');
        const modalBody = document.getElementById('educationModalBody');
        
        if (!user.profile?.education || user.profile.education.length === 0) {
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-graduation-cap" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3>No Education Details</h3>
                    <p style="color: #666;">This user has not provided any education information.</p>
                </div>
            `;
        } else {
            modalBody.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <h3 style="margin-bottom: 10px;">${user.firstName} ${user.lastName}'s Education Details</h3>
                    <p style="color: #666; margin-bottom: 20px;">${user.profile.education.length} education entr${user.profile.education.length > 1 ? 'ies' : 'y'}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    ${user.profile.education.map((education, index) => `
                        <div style="border: 1px solid #ddd; border-radius: 10px; padding: 20px; background: #f9f9f9;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h4 style="margin: 0; color: #333;">Education Entry ${index + 1}</h4>
                                ${education.isHighest ? '<span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Highest Qualification</span>' : ''}
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <p><strong>Level of Education:</strong> ${education.levelOfEducation || 'Not specified'}</p>
                                    <p><strong>Degree/Course:</strong> ${education.degree || 'Not specified'}</p>
                                    <p><strong>Specialization:</strong> ${education.specialization || 'Not specified'}</p>
                                    <p><strong>Institution:</strong> ${education.institution || 'Not specified'}</p>
                                    <p><strong>Education Status:</strong> ${education.educationStatus || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p><strong>Start Date:</strong> ${education.startDate || 'Not specified'}</p>
                                    <p><strong>End Date:</strong> ${education.endDate || 'Not specified'}</p>
                                    <p><strong>Education Type:</strong> ${education.educationType || 'Not specified'}</p>
                                    <p><strong>Education Medium:</strong> ${education.educationMedium || 'Not specified'}</p>
                                    <p><strong>Marks:</strong> ${education.marksValue ? `${education.marksValue} (${education.marksType || 'Not specified'})` : 'Not specified'}</p>
                                </div>
                            </div>
                            ${education.itiTrade ? `<p><strong>ITI Trade:</strong> ${education.itiTrade}</p>` : ''}
                            ${education.diplomaField ? `<p><strong>Diploma Field:</strong> ${education.diplomaField}</p>` : ''}
                            ${education.graduateDegree ? `<p><strong>Graduate Degree:</strong> ${education.graduateDegree}</p>` : ''}
                            ${education.postGraduateDegree ? `<p><strong>Post Graduate Degree:</strong> ${education.postGraduateDegree}</p>` : ''}
                            ${education.doctorateDegree ? `<p><strong>Doctorate Degree:</strong> ${education.doctorateDegree}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        modal.style.display = 'block';
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
                                <p>${application.dateOfBirth ? JobWalaAPI.formatIndianDate(application.dateOfBirth) : 'N/A'}</p>
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

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'block';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
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
            const response = await fetch('http://localhost:5000/api/blogs/admin/all', {
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
                <td>${JobWalaAPI.formatIndianDate(blog.createdAt)}</td>
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
            const response = await fetch(`http://localhost:5000/api/blogs/${blogId}`, {
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
            const url = blogId ? `http://localhost:5000/api/blogs/${blogId}` : 'http://localhost:5000/api/blogs';
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
            const response = await fetch(`http://localhost:5000/api/blogs/${blogId}`, {
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

    // Bulk Import/Export Methods
    async exportData(type) {
        try {
            this.showLoading('Exporting data...');
            
            const response = await fetch(`http://localhost:5000/api/bulk/export/${type}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'text/csv'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to export data');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${type}_export_${JobWalaAPI.formatIndianDate(new Date()).replace(/-/g, '_')}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            this.hideLoading();
            this.showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully!`);
        } catch (error) {
            console.error('Export error:', error);
            this.hideLoading();
            this.showError('Failed to export data: ' + error.message);
        }
    }

    showBulkImportModal(type) {
        const modal = document.getElementById('bulkImportModal');
        const title = document.getElementById('bulkImportModalTitle');
        const importType = document.getElementById('importType');
        
        title.textContent = `Bulk Import ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        importType.value = type;
        
        // Reset form
        document.getElementById('bulkImportForm').reset();
        importType.value = type;
        
        modal.classList.add('show');
    }

    async downloadSampleCSV(type) {
        try {
            this.showLoading('Downloading sample CSV...');
            
            const response = await fetch(`http://localhost:5000/api/bulk/sample/${type}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'text/csv'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download sample CSV');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `sample_${type}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            this.hideLoading();
            this.showSuccess(`Sample ${type} CSV downloaded successfully!`);
        } catch (error) {
            console.error('Download sample error:', error);
            this.hideLoading();
            this.showError('Failed to download sample CSV: ' + error.message);
        }
    }

    async handleBulkImport() {
        const fileInput = document.getElementById('csvFile');
        const importType = document.getElementById('importType');
        const submitBtn = document.getElementById('submitBulkImportBtn');
        
        if (!fileInput.files[0]) {
            this.showError('Please select a CSV file');
            return;
        }

        if (!importType.value) {
            this.showError('Please select an import type');
            return;
        }

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
            
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            const response = await fetch(`http://localhost:5000/api/bulk/import/${importType.value}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Import failed');
            }

            // Show results
            this.showImportResults(result.results, importType.value);
            
            // Refresh the current page data
            this.refreshCurrentPageData(importType.value);
            
            // Close modal
            this.hideModal('bulkImportModal');
            
        } catch (error) {
            console.error('Import error:', error);
            this.showError('Import failed: ' + error.message);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-upload"></i> Import Data';
        }
    }

    showImportResults(results, type) {
        const { total, success, failed, errors } = results;
        
        let message = `Import completed for ${type}:\n`;
        message += `Total records: ${total}\n`;
        message += `Successfully imported: ${success}\n`;
        message += `Failed: ${failed}\n`;
        
        if (errors.length > 0) {
            message += `\nErrors:\n${errors.slice(0, 5).join('\n')}`;
            if (errors.length > 5) {
                message += `\n... and ${errors.length - 5} more errors`;
            }
        }
        
        if (failed === 0) {
            this.showSuccess(message);
        } else if (success === 0) {
            this.showError(message);
        } else {
            this.showWarning(message);
        }
    }

    refreshCurrentPageData(type) {
        switch (type) {
            case 'users':
                this.loadUsers();
                break;
            case 'jobs':
                this.loadJobs();
                break;
            case 'applications':
                this.loadApplications();
                break;
            case 'team-limits':
                this.loadTeamLimits();
                break;
            case 'blogs':
                this.loadBlogs();
                break;
        }
    }

    showLoading(message = 'Loading...') {
        // Create or update loading overlay
        let loadingOverlay = document.getElementById('loadingOverlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loadingOverlay';
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                color: white;
                font-size: 18px;
            `;
            document.body.appendChild(loadingOverlay);
        }
        loadingOverlay.innerHTML = `
            <div style="text-align: center;">
                <div class="spinner" style="margin: 0 auto 10px;"></div>
                <div>${message}</div>
            </div>
        `;
        loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    showWarning(message) {
        // Create warning notification
        this.showNotification(message, 'warning');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
            white-space: pre-line;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Verification Management Methods
    async loadVerifications(status = 'all') {
        try {
            this.showLoading('Loading verifications...');
            
            const params = new URLSearchParams();
            if (status !== 'all') {
                params.append('status', status);
            }
            
            const response = await fetch(`http://localhost:5000/api/verification/all?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load verifications');
            }

            const result = await response.json();
            this.displayVerifications(result.data);
            this.hideLoading();
        } catch (error) {
            console.error('Error loading verifications:', error);
            this.hideLoading();
            this.showError('Failed to load verifications: ' + error.message);
        }
    }

    async loadVerificationStats() {
        try {
            const response = await fetch('http://localhost:5000/api/verification/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load verification stats');
            }

            const result = await response.json();
            this.displayVerificationStats(result.data);
        } catch (error) {
            console.error('Error loading verification stats:', error);
        }
    }

    displayVerificationStats(stats) {
        document.getElementById('pendingCount').textContent = stats.pending || 0;
        document.getElementById('verifiedCount').textContent = stats.verified || 0;
        document.getElementById('rejectedCount').textContent = stats.rejected || 0;
    }

    displayVerifications(verifications) {
        const tbody = document.getElementById('verificationTableBody');
        tbody.innerHTML = '';

        if (verifications.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                        No verifications found
                    </td>
                </tr>
            `;
            return;
        }

        verifications.forEach(verification => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div>
                        <strong>${verification.firstName} ${verification.lastName}</strong><br>
                        <small>${verification.email}</small>
                    </div>
                </td>
                <td>
                    <div>
                        <strong>${verification.profile?.company?.name || 'N/A'}</strong><br>
                        <small>${verification.profile?.company?.website || ''}</small>
                    </div>
                </td>
                <td>
                    <span class="badge badge-info">${verification.employerType || 'N/A'}</span>
                </td>
                <td>
                    <span class="status-badge ${verification.verificationStatus}">
                        ${verification.verificationStatus}
                    </span>
                </td>
                <td>
                    ${JobWalaAPI.formatIndianDate(verification.verificationDetails?.submittedAt || verification.createdAt)}
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="adminPanel.viewVerificationDetails('${verification._id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async viewVerificationDetails(employerId) {
        try {
            console.log('Loading verification details for:', employerId);
            this.showLoading('Loading verification details...');
            
            const response = await fetch(`http://localhost:5000/api/verification/${employerId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to load verification details');
            }

            const result = await response.json();
            console.log('Verification details loaded:', result.data);
            this.displayVerificationDetails(result.data);
            this.hideLoading();
        } catch (error) {
            console.error('Error loading verification details:', error);
            this.hideLoading();
            this.showError('Failed to load verification details: ' + error.message);
        }
    }

    displayVerificationDetails(employer) {
        console.log('Displaying verification details for:', employer);
        const modalBody = document.getElementById('verificationModalBody');
        const modalFooter = document.getElementById('verificationModalFooter');
        
        if (!modalBody || !modalFooter) {
            console.error('Modal elements not found');
            this.showError('Modal elements not found');
            return;
        }
        
        modalBody.innerHTML = `
            <div class="verification-details">
                <div class="verification-section">
                    <h4>Employer Information</h4>
                    <p><strong>Name:</strong> ${employer.firstName} ${employer.lastName}</p>
                    <p><strong>Email:</strong> ${employer.email}</p>
                    <p><strong>Phone:</strong> ${employer.phone || 'N/A'}</p>
                    <p><strong>Type:</strong> ${employer.employerType || 'N/A'}</p>
                </div>
                
                <div class="verification-section">
                    <h4>Company Information</h4>
                    <p><strong>Company Name:</strong> ${employer.profile?.company?.name || 'N/A'}</p>
                    <p><strong>Website:</strong> ${employer.profile?.company?.website || 'N/A'}</p>
                    <p><strong>Industry:</strong> ${employer.profile?.company?.industry || 'N/A'}</p>
                    <p><strong>Size:</strong> ${employer.profile?.company?.size || 'N/A'}</p>
                </div>
                
                <div class="verification-section">
                    <h4>Verification Status</h4>
                    <p><strong>Status:</strong> <span class="status-badge ${employer.verificationStatus}">${employer.verificationStatus}</span></p>
                    <p><strong>Submitted:</strong> ${JobWalaAPI.formatIndianDateTime(employer.verificationDetails?.submittedAt || employer.createdAt)}</p>
                    ${employer.verificationDetails?.verifiedAt ? `<p><strong>Verified:</strong> ${JobWalaAPI.formatIndianDateTime(employer.verificationDetails.verifiedAt)}</p>` : ''}
                    ${employer.verificationDetails?.rejectionReason ? `<p><strong>Rejection Reason:</strong> ${employer.verificationDetails.rejectionReason}</p>` : ''}
                    ${employer.verificationDetails?.notes ? `<p><strong>Notes:</strong> ${employer.verificationDetails.notes}</p>` : ''}
                </div>
                
                <div class="verification-section">
                    <h4>Documents</h4>
                    ${employer.verificationDetails?.documents?.length > 0 ? 
                        employer.verificationDetails.documents.map(doc => 
                            `<p><a href="${doc.url}" target="_blank">${doc.name}</a> (${doc.type})</p>`
                        ).join('') : 
                        '<p>No documents uploaded</p>'
                    }
                </div>
            </div>
        `;

        // Set up action buttons based on current status
        let actionButtons = '';
        if (employer.verificationStatus === 'pending') {
            actionButtons = `
                <button class="btn btn-success" onclick="adminPanel.showVerificationAction('${employer._id}', 'verify')">
                    <i class="fas fa-check"></i> Verify
                </button>
                <button class="btn btn-danger" onclick="adminPanel.showVerificationAction('${employer._id}', 'reject')">
                    <i class="fas fa-times"></i> Reject
                </button>
            `;
        } else if (employer.verificationStatus === 'rejected') {
            actionButtons = `
                <button class="btn btn-warning" onclick="adminPanel.showVerificationAction('${employer._id}', 'resubmit')">
                    <i class="fas fa-redo"></i> Allow Resubmission
                </button>
            `;
        } else {
            actionButtons = `
                <button class="btn btn-secondary" disabled>
                    <i class="fas fa-check-circle"></i> Already Verified
                </button>
            `;
        }

        modalFooter.innerHTML = actionButtons;
        this.showModal('verificationModal');
    }

    showVerificationAction(employerId, action) {
        console.log('Showing verification action:', { employerId, action });
        this.currentVerificationAction = { employerId, action };
        
        const modal = document.getElementById('verificationActionModal');
        const title = document.getElementById('verificationActionModalTitle');
        const actionType = document.getElementById('actionType');
        const rejectionReasonGroup = document.getElementById('rejectionReasonGroup');
        
        if (!modal || !title || !actionType || !rejectionReasonGroup) {
            console.error('Action modal elements not found');
            this.showError('Action modal elements not found');
            return;
        }
        
        // Reset form
        document.getElementById('verificationActionForm').reset();
        rejectionReasonGroup.style.display = 'none';
        document.getElementById('rejectionReason').required = false;
        
        // Set title and action type
        title.textContent = `${action.charAt(0).toUpperCase() + action.slice(1)} Employer`;
        actionType.value = action;
        
        // Show/hide rejection reason field
        if (action === 'reject') {
            rejectionReasonGroup.style.display = 'block';
            document.getElementById('rejectionReason').required = true;
        }
        
        this.showModal('verificationActionModal');
    }

    async submitVerificationAction() {
        console.log('Submitting verification action:', this.currentVerificationAction);
        const { employerId, action } = this.currentVerificationAction;
        const rejectionReason = document.getElementById('rejectionReason').value;
        const adminNotes = document.getElementById('adminNotes').value;
        
        console.log('Form data:', { employerId, action, rejectionReason, adminNotes });
        
        if (action === 'reject' && !rejectionReason.trim()) {
            this.showError('Rejection reason is required');
            return;
        }
        
        try {
            this.showLoading(`Processing ${action}...`);
            
            let endpoint = '';
            let body = {};
            
            if (action === 'verify') {
                endpoint = `http://localhost:5000/api/verification/${employerId}/verify`;
                body = { notes: adminNotes };
            } else if (action === 'reject') {
                endpoint = `http://localhost:5000/api/verification/${employerId}/reject`;
                body = { rejectionReason, notes: adminNotes };
            } else if (action === 'resubmit') {
                endpoint = `http://localhost:5000/api/verification/${employerId}/resubmit`;
            }
            
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Action failed');
            }
            
            const result = await response.json();
            this.hideLoading();
            this.hideModal('verificationActionModal');
            this.hideModal('verificationModal');
            this.showSuccess(result.message);
            
            // Refresh verifications
            this.loadVerifications();
            this.loadVerificationStats();
            
        } catch (error) {
            console.error('Error submitting verification action:', error);
            this.hideLoading();
            this.showError('Failed to process action: ' + error.message);
        }
    }

    // Custom Fields Management Methods
    async loadCustomFields() {
        try {
            console.log('Loading custom fields...');
            console.log('Current page:', this.currentPage);
            
            // Show loading state
            const tbody = document.getElementById('customFieldsTable');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="loading">
                            <div class="spinner"></div>
                            Loading custom fields...
                        </td>
                    </tr>
                `;
            }
            
            console.log('Making API call to /api/custom-fields');
            const response = await this.apiCall('/custom-fields', 'GET');
            console.log('API response:', response);
            
            if (response.success) {
                console.log('Custom fields loaded successfully:', response.fields);
                this.displayCustomFields(response.fields);
            } else {
                console.error('Failed to load custom fields:', response.message);
                this.displayCustomFields([]); // Show empty state
            }
        } catch (error) {
            console.error('Error loading custom fields:', error);
            // Show error message to user
            this.showError('Failed to load custom fields. Please check if the server is running and restart if necessary.');
            this.displayCustomFields([]); // Show empty state on error
        }
    }

    displayCustomFields(fields) {
        const tbody = document.getElementById('customFieldsTable');
        if (!tbody) {
            console.error('customFieldsTable element not found');
            return;
        }
        
        console.log('Displaying custom fields:', fields);
        console.log('Table element found:', tbody);

        if (fields.length === 0) {
            console.log('No custom fields found, showing empty state');
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-edit"></i>
                            <h4>No Custom Fields</h4>
                            <p>Create your first custom field to get started</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        console.log('Rendering custom fields table with', fields.length, 'fields');
        tbody.innerHTML = fields.map(field => `
            <tr>
                <td><code>${field.fieldId}</code></td>
                <td><strong>${field.label}</strong></td>
                <td>
                    <span class="badge badge-${this.getFieldTypeClass(field.fieldType)}">
                        ${this.getFieldTypeLabel(field.fieldType)}
                    </span>
                </td>
                <td>${this.getSectionLabel(field.placement.section)}</td>
                <td>
                    <span class="status-badge status-${field.status}">
                        ${field.status.charAt(0).toUpperCase() + field.status.slice(1)}
                    </span>
                </td>
                <td>
                    ${field.validation.required ? 
                        '<i class="fas fa-check text-success"></i>' : 
                        '<i class="fas fa-times text-muted"></i>'
                    }
                </td>
                <td>${field.placement.order || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="adminPanel.editCustomField('${field._id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="adminPanel.duplicateCustomField('${field._id}')" title="Duplicate">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteCustomField('${field._id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getFieldTypeClass(type) {
        const classes = {
            'text': 'primary',
            'email': 'info',
            'tel': 'info',
            'number': 'warning',
            'textarea': 'secondary',
            'select': 'success',
            'multiselect': 'success',
            'radio': 'success',
            'checkbox': 'success',
            'date': 'warning',
            'time': 'warning',
            'datetime': 'warning',
            'file': 'danger',
            'url': 'info',
            'password': 'danger'
        };
        return classes[type] || 'secondary';
    }

    getFieldTypeLabel(type) {
        const labels = {
            'text': 'Text',
            'email': 'Email',
            'tel': 'Phone',
            'number': 'Number',
            'textarea': 'Text Area',
            'select': 'Dropdown',
            'multiselect': 'Multi Select',
            'radio': 'Radio',
            'checkbox': 'Checkbox',
            'date': 'Date',
            'time': 'Time',
            'datetime': 'Date & Time',
            'file': 'File',
            'url': 'URL',
            'password': 'Password'
        };
        return labels[type] || type;
    }

    getSectionLabel(section) {
        const labels = {
            'job_posting': 'Job Posting',
            'user_registration': 'User Registration',
            'company_profile': 'Company Profile',
            'consultancy_profile': 'Consultancy Profile',
            'jobseeker_profile': 'Job Seeker Profile',
            'application_form': 'Application Form',
            'admin_panel': 'Admin Panel'
        };
        return labels[section] || section;
    }

    async filterCustomFields() {
        const section = document.getElementById('fieldSectionFilter').value;
        const type = document.getElementById('fieldTypeFilter').value;
        const status = document.getElementById('fieldStatusFilter').value;
        const search = document.getElementById('fieldSearch').value;

        const params = new URLSearchParams();
        if (section) params.append('section', section);
        if (type) params.append('fieldType', type);
        if (status) params.append('status', status);
        if (search) params.append('search', search);

        try {
            this.showLoading();
            const url = `/custom-fields?${params.toString()}`;
            console.log('Filtering custom fields with URL:', url);
            const response = await this.apiCall(url, 'GET');
            console.log('Filter response:', response);
            
            if (response.success) {
                this.displayCustomFields(response.fields);
            } else {
                this.showError('Failed to filter custom fields');
            }
        } catch (error) {
            console.error('Error filtering custom fields:', error);
            this.showError('Failed to filter custom fields: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    openCustomFieldModal(fieldId = null) {
        const modal = document.getElementById('customFieldModal');
        const title = document.getElementById('customFieldModalTitle');
        const form = document.getElementById('customFieldForm');
        
        if (fieldId) {
            title.textContent = 'Edit Custom Field';
            this.loadCustomFieldForEdit(fieldId);
        } else {
            title.textContent = 'Add Custom Field';
            form.reset();
            this.resetFieldOptions();
        }
        
        this.showModal('customFieldModal');
    }

    async loadCustomFieldForEdit(fieldId) {
        try {
            const response = await this.apiCall(`/custom-fields/${fieldId}`, 'GET');
            
            if (response.success) {
                const field = response.field;
                this.populateCustomFieldForm(field);
            } else {
                this.showError('Failed to load field details');
            }
        } catch (error) {
            console.error('Error loading field for edit:', error);
            this.showError('Failed to load field details: ' + error.message);
        }
    }

    populateCustomFieldForm(field) {
        // Basic information
        document.getElementById('fieldId').value = field.fieldId;
        document.getElementById('fieldName').value = field.name;
        document.getElementById('fieldLabel').value = field.label;
        document.getElementById('fieldType').value = field.fieldType;
        document.getElementById('fieldDescription').value = field.description || '';

        // Validation
        document.getElementById('fieldRequired').checked = field.validation.required || false;
        document.getElementById('fieldMinLength').value = field.validation.minLength || '';
        document.getElementById('fieldMaxLength').value = field.validation.maxLength || '';
        document.getElementById('fieldPattern').value = field.validation.pattern || '';

        // Placement
        document.getElementById('fieldSection').value = field.placement.section || '';
        document.getElementById('fieldOrder').value = field.placement.order || 0;
        document.getElementById('fieldGroup').value = field.placement.group || '';
        document.getElementById('fieldVisible').checked = field.placement.isVisible !== false;

        // Styling
        document.getElementById('fieldPlaceholder').value = field.styling.placeholder || '';
        document.getElementById('fieldCssClass').value = field.styling.cssClass || '';
        document.getElementById('fieldWidth').value = field.styling.width || '100%';
        document.getElementById('fieldHelpText').value = field.styling.helpText || '';

        // Status
        document.getElementById('fieldStatus').value = field.status || 'active';

        // Update field type options
        this.updateFieldTypeOptions();
        
        // Load options if applicable
        if (field.options && field.options.length > 0) {
            this.loadFieldOptions(field.options);
        }
    }

    updateFieldTypeOptions() {
        const fieldType = document.getElementById('fieldType').value;
        const optionsSection = document.getElementById('fieldOptionsSection');
        
        if (['select', 'multiselect', 'radio', 'checkbox'].includes(fieldType)) {
            optionsSection.style.display = 'block';
            if (document.getElementById('fieldOptionsContainer').children.length === 0) {
                this.addFieldOption();
            }
        } else {
            optionsSection.style.display = 'none';
        }
    }

    addFieldOption() {
        const container = document.getElementById('fieldOptionsContainer');
        const optionIndex = container.children.length;
        
        const optionDiv = document.createElement('div');
        optionDiv.className = 'field-option';
        optionDiv.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Option Value</label>
                    <input type="text" name="options[${optionIndex}].value" placeholder="e.g., small, medium, large" required>
                </div>
                <div class="form-group">
                    <label>Option Label</label>
                    <input type="text" name="options[${optionIndex}].label" placeholder="e.g., Small, Medium, Large" required>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="options[${optionIndex}].isDefault">
                        Default
                    </label>
                </div>
                <div class="form-group">
                    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(optionDiv);
    }

    loadFieldOptions(options) {
        const container = document.getElementById('fieldOptionsContainer');
        container.innerHTML = '';
        
        options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'field-option';
            optionDiv.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label>Option Value</label>
                        <input type="text" name="options[${index}].value" value="${option.value}" required>
                    </div>
                    <div class="form-group">
                        <label>Option Label</label>
                        <input type="text" name="options[${index}].label" value="${option.label}" required>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="options[${index}].isDefault" ${option.isDefault ? 'checked' : ''}>
                            Default
                        </label>
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.parentElement.remove()">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(optionDiv);
        });
    }

    resetFieldOptions() {
        const container = document.getElementById('fieldOptionsContainer');
        container.innerHTML = '';
    }

    async saveCustomField() {
        try {
            const form = document.getElementById('customFieldForm');
            const formData = new FormData(form);
            
            // Convert form data to object
            const fieldData = {
                fieldId: formData.get('fieldId'),
                name: formData.get('name'),
                label: formData.get('label'),
                description: formData.get('description'),
                fieldType: formData.get('fieldType'),
                validation: {
                    required: formData.get('validation.required') === 'on',
                    minLength: formData.get('validation.minLength') ? parseInt(formData.get('validation.minLength')) : null,
                    maxLength: formData.get('validation.maxLength') ? parseInt(formData.get('validation.maxLength')) : null,
                    pattern: formData.get('validation.pattern') || null
                },
                placement: {
                    section: formData.get('placement.section'),
                    order: parseInt(formData.get('placement.order')) || 0,
                    group: formData.get('placement.group') || 'general',
                    isVisible: formData.get('placement.isVisible') === 'on'
                },
                styling: {
                    placeholder: formData.get('styling.placeholder') || '',
                    cssClass: formData.get('styling.cssClass') || '',
                    width: formData.get('styling.width') || '100%',
                    helpText: formData.get('styling.helpText') || ''
                },
                status: formData.get('status') || 'active'
            };

            // Collect options
            const options = [];
            const optionElements = document.querySelectorAll('.field-option');
            optionElements.forEach((element, index) => {
                const value = element.querySelector(`input[name="options[${index}].value"]`).value;
                const label = element.querySelector(`input[name="options[${index}].label"]`).value;
                const isDefault = element.querySelector(`input[name="options[${index}].isDefault"]`).checked;
                
                if (value && label) {
                    options.push({ value, label, isDefault, order: index });
                }
            });
            fieldData.options = options;

            const fieldId = formData.get('fieldId');
            const isEdit = document.getElementById('customFieldModalTitle').textContent.includes('Edit');
            
            let response;
            if (isEdit) {
                // Find the field ID from the current field being edited
                const currentFieldId = document.getElementById('fieldId').getAttribute('data-original-id') || fieldId;
                response = await this.apiCall(`/custom-fields/${currentFieldId}`, 'PUT', fieldData);
            } else {
                response = await this.apiCall('/custom-fields', 'POST', fieldData);
            }

            if (response.success) {
                this.hideModal('customFieldModal');
                this.showSuccess(response.message);
                this.loadCustomFields();
            } else {
                this.showError(response.message || 'Failed to save field');
            }
        } catch (error) {
            console.error('Error saving custom field:', error);
            this.showError('Failed to save field: ' + error.message);
        }
    }

    async editCustomField(fieldId) {
        this.openCustomFieldModal(fieldId);
    }

    async duplicateCustomField(fieldId) {
        try {
            const response = await this.apiCall(`/custom-fields/${fieldId}/duplicate`, 'POST');
            
            if (response.success) {
                this.showSuccess('Field duplicated successfully');
                this.loadCustomFields();
            } else {
                this.showError(response.message || 'Failed to duplicate field');
            }
        } catch (error) {
            console.error('Error duplicating field:', error);
            this.showError('Failed to duplicate field: ' + error.message);
        }
    }

    async deleteCustomField(fieldId) {
        if (!confirm('Are you sure you want to delete this custom field? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await this.apiCall(`/custom-fields/${fieldId}`, 'DELETE');
            
            if (response.success) {
                this.showSuccess('Field deleted successfully');
                this.loadCustomFields();
            } else {
                this.showError(response.message || 'Failed to delete field');
            }
        } catch (error) {
            console.error('Error deleting field:', error);
            this.showError('Failed to delete field: ' + error.message);
        }
    }

    async refreshCustomFields() {
        this.loadCustomFields();
    }

    async testCustomFieldsAPI() {
        try {
            console.log('Testing Custom Fields API...');
            this.showLoading();
            
            // Test basic connectivity
            const response = await fetch('http://localhost:5000/api/health');
            if (!response.ok) {
                throw new Error(`Server health check failed: ${response.status}`);
            }
            
            const healthData = await response.json();
            console.log('Server health check passed:', healthData);
            
            // Test custom fields endpoint
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const customFieldsResponse = await fetch('http://localhost:5000/api/custom-fields', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!customFieldsResponse.ok) {
                const errorText = await customFieldsResponse.text();
                throw new Error(`Custom fields API failed: ${customFieldsResponse.status} - ${errorText}`);
            }
            
            const customFieldsData = await customFieldsResponse.json();
            console.log('Custom fields API test passed:', customFieldsData);
            
            this.hideLoading();
            this.showSuccess('API test passed! Custom fields endpoint is working correctly.');
            
        } catch (error) {
            console.error('API test failed:', error);
            this.hideLoading();
            this.showError(`API test failed: ${error.message}`);
        }
    }

    // Sales Enquiries Functions
    async loadSalesEnquiries() {
        try {
            this.showLoading();
            const response = await fetch('http://localhost:5000/api/sales-enquiry', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sales enquiries');
            }

            const data = await response.json();
            this.currentData.salesEnquiries = data;
            this.displaySalesEnquiries(data.enquiries);
            this.hideLoading();
        } catch (error) {
            console.error('Error loading sales enquiries:', error);
            this.hideLoading();
            this.showError('Failed to load sales enquiries');
        }
    }

    async loadSalesEnquiryStats() {
        try {
            const response = await fetch('http://localhost:5000/api/sales-enquiry/stats/overview', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sales enquiry stats');
            }

            const data = await response.json();
            this.displaySalesEnquiryStats(data.stats);
        } catch (error) {
            console.error('Error loading sales enquiry stats:', error);
        }
    }

    displaySalesEnquiries(enquiries) {
        const tbody = document.getElementById('salesEnquiriesTableBody');
        if (!tbody) return;

        if (enquiries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #7f8c8d;">No sales enquiries found</td></tr>';
            return;
        }

        tbody.innerHTML = enquiries.map(enquiry => `
            <tr>
                <td>
                    <div>
                        <strong>${enquiry.firstName} ${enquiry.lastName}</strong>
                        <br><small>${enquiry.email}</small>
                    </div>
                </td>
                <td>
                    <div>
                        <strong>${enquiry.company}</strong>
                        <br><small>${enquiry.position}</small>
                    </div>
                </td>
                <td>${enquiry.industry}</td>
                <td>
                    <span class="badge badge-info">${enquiry.enquiryType.replace('-', ' ').toUpperCase()}</span>
                </td>
                <td>
                    <span class="status-badge status-${enquiry.status}">${enquiry.status.replace('-', ' ').toUpperCase()}</span>
                </td>
                <td>
                    <span class="priority-badge priority-${enquiry.priority}">${enquiry.priority.toUpperCase()}</span>
                </td>
                <td>${JobWalaAPI.formatIndianDate(enquiry.submittedAt)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="adminPanel.viewSalesEnquiry('${enquiry._id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="adminPanel.editSalesEnquiry('${enquiry._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            </tr>
        `).join('');
    }

    displaySalesEnquiryStats(stats) {
        document.getElementById('newEnquiriesCount').textContent = stats.byStatus.find(s => s._id === 'new')?.count || 0;
        document.getElementById('contactedCount').textContent = stats.byStatus.find(s => s._id === 'contacted')?.count || 0;
        document.getElementById('qualifiedCount').textContent = stats.byStatus.find(s => s._id === 'qualified')?.count || 0;
        document.getElementById('closedWonCount').textContent = stats.byStatus.find(s => s._id === 'closed-won')?.count || 0;
    }

    async viewSalesEnquiry(enquiryId) {
        try {
            const response = await fetch(`/api/sales-enquiry/${enquiryId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sales enquiry details');
            }

            const data = await response.json();
            this.showSalesEnquiryModal(data.enquiry);
        } catch (error) {
            console.error('Error viewing sales enquiry:', error);
            this.showError('Failed to load sales enquiry details');
        }
    }

    showSalesEnquiryModal(enquiry) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2>Sales Enquiry Details</h2>
                    <button class="close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <h3>Contact Information</h3>
                            <p><strong>Name:</strong> ${enquiry.firstName} ${enquiry.lastName}</p>
                            <p><strong>Email:</strong> ${enquiry.email}</p>
                            <p><strong>Phone:</strong> ${enquiry.phone}</p>
                            <p><strong>Company:</strong> ${enquiry.company}</p>
                            <p><strong>Position:</strong> ${enquiry.position}</p>
                        </div>
                        <div>
                            <h3>Enquiry Details</h3>
                            <p><strong>Industry:</strong> ${enquiry.industry}</p>
                            <p><strong>Company Size:</strong> ${enquiry.companySize} employees</p>
                            <p><strong>Enquiry Type:</strong> ${enquiry.enquiryType.replace('-', ' ').toUpperCase()}</p>
                            <p><strong>Budget:</strong> ${enquiry.budget || 'Not specified'}</p>
                            <p><strong>Status:</strong> <span class="status-badge status-${enquiry.status}">${enquiry.status.replace('-', ' ').toUpperCase()}</span></p>
                            <p><strong>Priority:</strong> <span class="priority-badge priority-${enquiry.priority}">${enquiry.priority.toUpperCase()}</span></p>
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        <h3>Message</h3>
                        <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">${enquiry.message}</p>
                    </div>
                    ${enquiry.hearAbout ? `
                        <div style="margin-top: 20px;">
                            <h3>Source</h3>
                            <p>How they heard about us: ${enquiry.hearAbout.replace('-', ' ').toUpperCase()}</p>
                        </div>
                    ` : ''}
                    <div style="margin-top: 20px;">
                        <h3>Timeline</h3>
                        <p><strong>Submitted:</strong> ${JobWalaAPI.formatIndianDateTime(enquiry.submittedAt)}</p>
                        ${enquiry.contactedAt ? `<p><strong>Contacted:</strong> ${JobWalaAPI.formatIndianDateTime(enquiry.contactedAt)}</p>` : ''}
                        ${enquiry.lastContactedAt ? `<p><strong>Last Contacted:</strong> ${JobWalaAPI.formatIndianDateTime(enquiry.lastContactedAt)}</p>` : ''}
                        ${enquiry.nextFollowUp ? `<p><strong>Next Follow-up:</strong> ${JobWalaAPI.formatIndianDateTime(enquiry.nextFollowUp)}</p>` : ''}
                    </div>
                    ${enquiry.notes && enquiry.notes.length > 0 ? `
                        <div style="margin-top: 20px;">
                            <h3>Notes</h3>
                            ${enquiry.notes.map(note => `
                                <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px;">
                                    <p>${note.note}</p>
                                    <small style="color: #666;">
                                        Added by ${note.addedBy?.firstName} ${note.addedBy?.lastName} on ${JobWalaAPI.formatIndianDateTime(note.addedAt)}
                                    </small>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="adminPanel.editSalesEnquiry('${enquiry._id}'); this.closest('.modal').remove();">Edit Enquiry</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove();">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async editSalesEnquiry(enquiryId) {
        // This would open an edit modal for the sales enquiry
        // For now, just show a message
        this.showInfo('Edit functionality will be implemented in the next update');
    }

    async exportSalesEnquiries() {
        try {
            const response = await fetch('http://localhost:5000/api/sales-enquiry?limit=1000', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sales enquiries for export');
            }

            const data = await response.json();
            this.downloadCSV(data.enquiries, 'sales-enquiries.csv');
        } catch (error) {
            console.error('Error exporting sales enquiries:', error);
            this.showError('Failed to export sales enquiries');
        }
    }

    downloadCSV(data, filename) {
        const headers = ['Name', 'Email', 'Phone', 'Company', 'Position', 'Industry', 'Company Size', 'Enquiry Type', 'Budget', 'Status', 'Priority', 'Submitted At', 'Message'];
        const csvContent = [
            headers.join(','),
            ...data.map(enquiry => [
                `"${enquiry.firstName} ${enquiry.lastName}"`,
                `"${enquiry.email}"`,
                `"${enquiry.phone}"`,
                `"${enquiry.company}"`,
                `"${enquiry.position}"`,
                `"${enquiry.industry}"`,
                `"${enquiry.companySize}"`,
                `"${enquiry.enquiryType}"`,
                `"${enquiry.budget || ''}"`,
                `"${enquiry.status}"`,
                `"${enquiry.priority}"`,
                `"${JobWalaAPI.formatIndianDateTime(enquiry.submittedAt)}"`,
                `"${enquiry.message.replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Team Limits Management Methods
    async loadTeamLimits() {
        try {
            this.showLoading('Loading team limits...');
            
            const search = document.getElementById('teamLimitsSearch').value;
            const employerType = document.getElementById('teamLimitsTypeFilter').value;
            const page = this.currentData.teamLimits.page;
            
            const params = new URLSearchParams({
                page: page,
                limit: 10
            });
            
            if (search) params.append('search', search);
            if (employerType) params.append('employerType', employerType);
            
            const response = await fetch(`http://localhost:5000/api/admin/team-limits?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load team limits');
            }
            
            const data = await response.json();
            this.currentData.teamLimits = {
                data: data.employers,
                page: data.pagination.current,
                total: data.pagination.total
            };
            
            this.renderTeamLimitsTable(data.employers);
            this.updatePagination('teamLimitsPagination', data.pagination, 'loadTeamLimits');
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading team limits:', error);
            this.hideLoading();
            this.showError('Failed to load team limits');
            document.getElementById('teamLimitsTableBody').innerHTML = '<tr><td colspan="9" class="text-center">Error loading data</td></tr>';
        }
    }

    renderTeamLimitsTable(employers) {
        const tbody = document.getElementById('teamLimitsTableBody');
        
        if (!employers || employers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">No employers found</td></tr>';
            return;
        }
        
        tbody.innerHTML = employers.map(employer => {
            const remaining = employer.teamMemberLimits.maxTeamMembers - employer.teamMemberLimits.currentTeamMembers;
            const statusClass = employer.isEmployerVerified ? 'status-verified' : 'status-pending';
            const statusText = employer.isEmployerVerified ? 'Verified' : 'Pending';
            
            return `
                <tr>
                    <td>${employer.firstName} ${employer.lastName}</td>
                    <td>${employer.email}</td>
                    <td>${employer.companyName}</td>
                    <td><span class="badge badge-${employer.employerType === 'company' ? 'primary' : 'info'}">${employer.employerType}</span></td>
                    <td><strong>${employer.teamMemberLimits.currentTeamMembers}</strong></td>
                    <td><strong>${employer.teamMemberLimits.maxTeamMembers}</strong></td>
                    <td><span class="badge badge-${remaining > 0 ? 'success' : 'warning'}">${remaining}</span></td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="adminPanel.editTeamLimits('${employer.id}')">
                            <i class="fas fa-edit"></i> Edit Limit
                        </button>
                        <button class="btn btn-sm btn-info" onclick="adminPanel.viewTeamMembers('${employer.id}')">
                            <i class="fas fa-users"></i> View Team
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    editTeamLimits(employerId) {
        const employer = this.currentData.teamLimits.data.find(emp => emp.id === employerId);
        if (!employer) {
            this.showError('Employer not found');
            return;
        }
        
        document.getElementById('teamLimitsCompanyName').value = employer.companyName;
        document.getElementById('teamLimitsContactName').value = `${employer.firstName} ${employer.lastName}`;
        document.getElementById('teamLimitsEmail').value = employer.email;
        document.getElementById('teamLimitsCurrentMembers').value = employer.teamMemberLimits.currentTeamMembers;
        document.getElementById('teamLimitsMaxMembers').value = employer.teamMemberLimits.maxTeamMembers;
        
        this.updateRemainingSlots();
        this.currentEditingEmployerId = employerId;
        
        document.getElementById('teamLimitsModal').classList.add('show');
    }

    updateRemainingSlots() {
        const current = parseInt(document.getElementById('teamLimitsCurrentMembers').value) || 0;
        const max = parseInt(document.getElementById('teamLimitsMaxMembers').value) || 0;
        const remaining = Math.max(0, max - current);
        document.getElementById('teamLimitsRemainingSlots').value = remaining;
    }

    async saveTeamLimits() {
        try {
            const maxMembers = parseInt(document.getElementById('teamLimitsMaxMembers').value);
            
            if (isNaN(maxMembers) || maxMembers < 0) {
                this.showError('Please enter a valid number for maximum team members');
                return;
            }
            
            const response = await fetch(`http://localhost:5000/api/admin/team-limits/${this.currentEditingEmployerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    maxTeamMembers: maxMembers
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update team limits');
            }
            
            this.showSuccess('Team member limit updated successfully');
            this.hideTeamLimitsModal();
            this.loadTeamLimits();
            
        } catch (error) {
            console.error('Error saving team limits:', error);
            this.showError(error.message || 'Failed to save team limits');
        }
    }

    hideTeamLimitsModal() {
        document.getElementById('teamLimitsModal').classList.remove('show');
        this.currentEditingEmployerId = null;
    }

    async viewTeamMembers(employerId) {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/team-limits/${employerId}/subusers`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load team members');
            }
            
            const data = await response.json();
            this.showTeamMembersModal(data.employer, data.subusers);
            
        } catch (error) {
            console.error('Error loading team members:', error);
            this.showError('Failed to load team members');
        }
    }

    showTeamMembersModal(employer, subusers) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1000px;">
                <div class="modal-header">
                    <h3 class="modal-title">Team Members - ${employer.companyName}</h3>
                    <button class="close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="team-info mb-3">
                        <div class="row">
                            <div class="col-md-4">
                                <strong>Current Members:</strong> ${employer.teamMemberLimits.currentTeamMembers}
                            </div>
                            <div class="col-md-4">
                                <strong>Max Members:</strong> ${employer.teamMemberLimits.maxTeamMembers}
                            </div>
                            <div class="col-md-4">
                                <strong>Remaining:</strong> ${employer.teamMemberLimits.maxTeamMembers - employer.teamMemberLimits.currentTeamMembers}
                            </div>
                        </div>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Invited Date</th>
                                <th>Last Login</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subusers.map(subuser => `
                                <tr>
                                    <td>${subuser.firstName} ${subuser.lastName}</td>
                                    <td>${subuser.email}</td>
                                    <td><span class="badge badge-${subuser.role === 'admin' ? 'danger' : subuser.role === 'manager' ? 'warning' : 'secondary'}">${subuser.role}</span></td>
                                    <td><span class="status ${subuser.invitationAccepted ? 'status-verified' : 'status-pending'}">${subuser.invitationAccepted ? 'Active' : 'Pending'}</span></td>
                                    <td>${JobWalaAPI.formatIndianDateTime(subuser.invitedAt)}</td>
                                    <td>${subuser.lastLogin ? JobWalaAPI.formatIndianDateTime(subuser.lastLogin) : 'Never'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
    console.log('Admin panel initialized:', window.adminPanel);
});
