// Consultancy Dashboard JavaScript
class ConsultancyDashboard {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'overview';
        this.consultancyData = {
            clients: [],
            jobs: [],
            candidates: [],
            revenue: 0
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
        this.loadConsultancyData();
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
    }

    async checkAuth() {
        // Use new API service
        if (!window.authUtils || !window.authUtils.isLoggedIn()) {
            window.location.href = 'consultancy-login.html';
            return;
        }

        // Get current user and validate they are a consultancy user
        const user = window.authUtils.getCurrentUser();
        if (!user || user.userType !== 'employer' || user.employerType !== 'consultancy') {
            // Clear invalid login data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'consultancy-login.html';
            return;
        }

        try {
            this.currentUser = window.authUtils.getCurrentUser();
            this.updateUserInfo();
            
            // Check if user is consultancy employer
            if (this.currentUser.userType !== 'employer' || this.currentUser.employerType !== 'consultancy') {
                this.showError('Access denied. This dashboard is for consultancy employers only.');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
                return;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'login.html';
        }
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            document.getElementById('userAvatar').textContent = this.currentUser.firstName.charAt(0).toUpperCase();
            
            // Update consultancy info if available
            this.updateConsultancyInfo();
        }
    }
    
    updateConsultancyInfo() {
        const user = this.currentUser;
        if (!user || !user.profile?.company) return;
        
        // Update consultancy name in header
        const consultancyName = document.getElementById('consultancyName');
        if (consultancyName) {
            consultancyName.textContent = user.profile.company.name || 'Consultancy Name';
        }
        
        // Update consultancy details in overview
        this.updateConsultancyDetails();
    }
    
    updateConsultancyDetails() {
        const user = this.currentUser;
        if (!user || !user.profile?.company) return;
        
        const consultancyInfo = document.getElementById('consultancyInfo');
        if (consultancyInfo) {
            const consultancy = user.profile.company.consultancy || {};
            consultancyInfo.innerHTML = `
                <div class="info-item">
                    <i class="fas fa-building"></i>
                    <div>
                        <h4>${user.profile.company.name || 'Consultancy Name'}</h4>
                        <p>${user.profile.company.industry || 'Industry'}</p>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <div>
                        <h4>Established</h4>
                        <p>${consultancy.establishedYear || 'N/A'}</p>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-users"></i>
                    <div>
                        <h4>Team Size</h4>
                        <p>${consultancy.teamSize || 'N/A'} employees</p>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <h4>Location</h4>
                        <p>${user.profile.company.location?.city || 'N/A'}, ${user.profile.company.location?.state || 'N/A'}</p>
                    </div>
                </div>
            `;
        }
        
        // Update specializations
        const specializations = document.getElementById('specializations');
        if (specializations && user.profile.company.consultancy?.specializations) {
            specializations.innerHTML = user.profile.company.consultancy.specializations.map(spec => 
                `<span class="tag">${spec}</span>`
            ).join('');
        }
        
        // Update service areas
        const serviceAreas = document.getElementById('serviceAreas');
        if (serviceAreas && user.profile.company.consultancy?.serviceAreas) {
            serviceAreas.innerHTML = user.profile.company.consultancy.serviceAreas.map(area => 
                `<span class="tag">${area}</span>`
            ).join('');
        }
        
        // Update client types
        const clientTypes = document.getElementById('clientTypes');
        if (clientTypes && user.profile.company.consultancy?.clientTypes) {
            clientTypes.innerHTML = user.profile.company.consultancy.clientTypes.map(type => 
                `<span class="tag">${type}</span>`
            ).join('');
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
            case 'overview':
                this.loadOverview();
                break;
            case 'clients':
                this.loadClients();
                break;
            case 'jobs':
                this.loadJobs();
                break;
            case 'candidates':
                this.loadCandidates();
                break;
            case 'revenue':
                this.loadRevenue();
                break;
            case 'profile':
                this.loadProfile();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    getPageTitle(page) {
        const titles = {
            overview: 'Consultancy Overview',
            clients: 'Client Management',
            jobs: 'Job Postings',
            candidates: 'Candidates',
            revenue: 'Revenue Analytics',
            profile: 'Profile Settings',
            settings: 'Settings'
        };
        return titles[page] || 'Consultancy Dashboard';
    }

    async loadConsultancyData() {
        try {
            // Load clients (if endpoint exists)
            try {
                const clientsResponse = await this.apiCall('/api/consultancy/clients', 'GET');
                this.consultancyData.clients = clientsResponse.clients || [];
            } catch (error) {
                console.log('Clients endpoint not available');
                this.consultancyData.clients = [];
            }

            // Load jobs
            const jobsResponse = await this.apiCall('/api/jobs', 'GET');
            this.consultancyData.jobs = jobsResponse.jobs || [];

            // Load candidates (if endpoint exists)
            try {
                const candidatesResponse = await this.apiCall('/api/consultancy/candidates', 'GET');
                this.consultancyData.candidates = candidatesResponse.candidates || [];
            } catch (error) {
                console.log('Candidates endpoint not available');
                this.consultancyData.candidates = [];
            }

            this.updateDashboardStats();
        } catch (error) {
            console.error('Failed to load consultancy data:', error);
        }
    }

    updateDashboardStats() {
        // Update statistics
        document.getElementById('totalClients').textContent = this.consultancyData.clients.length;
        document.getElementById('totalJobs').textContent = this.consultancyData.jobs.length;
        document.getElementById('totalCandidates').textContent = this.consultancyData.candidates.length;
        document.getElementById('totalRevenue').textContent = `$${this.consultancyData.revenue.toLocaleString()}`;
    }

    async loadOverview() {
        this.updateDashboardStats();
        this.updateRecentClients();
        this.updateRecentJobs();
    }

    updateRecentClients() {
        const clientsContainer = document.getElementById('recentClients');
        
        if (this.consultancyData.clients.length === 0) {
            clientsContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No clients found</p>';
            return;
        }

        clientsContainer.innerHTML = this.consultancyData.clients.slice(0, 5).map(client => `
            <div class="client-item">
                <div class="client-avatar">${client.name.charAt(0).toUpperCase()}</div>
                <div class="client-info">
                    <h4>${client.name}</h4>
                    <p>${client.industry} • ${client.activeProjects || 0} active projects</p>
                </div>
                <div class="client-status ${client.status || 'active'}">${client.status || 'Active'}</div>
            </div>
        `).join('');
    }

    updateRecentJobs() {
        const jobsContainer = document.getElementById('recentJobs');
        
        if (this.consultancyData.jobs.length === 0) {
            jobsContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No job postings found</p>';
            return;
        }

        jobsContainer.innerHTML = this.consultancyData.jobs.slice(0, 5).map(job => `
            <div class="job-item">
                <div class="job-icon">
                    <i class="fas fa-briefcase"></i>
                </div>
                <div class="job-content">
                    <h4>${job.title}</h4>
                    <p>${job.company?.name || 'Unknown Company'} • Posted ${this.formatTimeAgo(new Date(job.createdAt))} • ${job.applications?.length || 0} applications</p>
                </div>
                <div class="job-actions">
                    <button class="btn btn-primary" onclick="consultancyDashboard.viewJob('${job._id}')">View</button>
                    <button class="btn btn-success" onclick="consultancyDashboard.editJob('${job._id}')">Edit</button>
                </div>
            </div>
        `).join('');
    }

    async loadClients() {
        // Implementation for client management
        console.log('Loading clients...');
    }

    async loadJobs() {
        const jobsContainer = document.getElementById('jobsContent');
        
        if (!jobsContainer) {
            console.error('Jobs content container not found');
            return;
        }
        
        if (this.consultancyData.jobs.length === 0) {
            jobsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <h3>No Job Postings Yet</h3>
                    <p>Start by creating your first job posting to attract candidates</p>
                    <button class="btn btn-primary" id="createJobBtnEmpty">
                        <i class="fas fa-plus"></i> Create Job Posting
                    </button>
                </div>
            `;
            return;
        }

        jobsContainer.innerHTML = `
            <div class="table-header">
                <h3>Job Postings (${this.consultancyData.jobs.length})</h3>
                <button class="btn btn-primary" id="createJobBtn">
                    <i class="fas fa-plus"></i> Create Job Posting
                </button>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Client</th>
                            <th>Type</th>
                            <th>Applications</th>
                            <th>Status</th>
                            <th>Posted Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.consultancyData.jobs.map(job => `
                            <tr>
                                <td>
                                    <div class="job-info">
                                        <div class="title">${job.title}</div>
                                        <div class="location">${job.location?.city || 'N/A'}, ${job.location?.state || 'N/A'}</div>
                                    </div>
                                </td>
                                <td>${job.company?.name || 'N/A'}</td>
                                <td><span class="job-type">${job.employmentType || 'N/A'}</span></td>
                                <td><span class="application-count">${job.applications?.length || 0}</span></td>
                                <td><span class="status-badge status-${job.status || 'active'}">${job.status || 'Active'}</span></td>
                                <td>${job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn btn-sm btn-primary" onclick="consultancyDashboard.viewJob('${job._id}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-success" onclick="consultancyDashboard.editJob('${job._id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="consultancyDashboard.deleteJob('${job._id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Add event listeners for create job buttons
        setTimeout(() => {
            const createJobBtn = document.getElementById('createJobBtn');
            const createJobBtnEmpty = document.getElementById('createJobBtnEmpty');
            
            if (createJobBtn) {
                createJobBtn.addEventListener('click', () => {
                    console.log('Create job button clicked');
                    this.showAddJobModal();
                });
            }
            
            if (createJobBtnEmpty) {
                createJobBtnEmpty.addEventListener('click', () => {
                    console.log('Create job button (empty state) clicked');
                    this.showAddJobModal();
                });
            }
        }, 100);
    }

    async loadCandidates() {
        // Implementation for candidate management
        console.log('Loading candidates...');
    }

    async loadRevenue() {
        // Implementation for revenue analytics
        console.log('Loading revenue...');
    }

    async loadProfile() {
        // Implementation for profile management
        console.log('Loading profile...');
    }

    async loadSettings() {
        // Implementation for settings
        console.log('Loading settings...');
    }

    async viewJob(jobId) {
        try {
            const response = await this.apiCall(`/api/jobs/${jobId}`, 'GET');
            if (response.success) {
                this.showJobDetails(response.job);
            } else {
                this.showError(response.message || 'Failed to load job details');
            }
        } catch (error) {
            console.error('Error viewing job:', error);
            this.showError('Failed to load job details');
        }
    }

    async editJob(jobId) {
        try {
            const response = await this.apiCall(`/api/jobs/${jobId}`, 'GET');
            if (response.success) {
                this.showEditJobModal(response.job);
            } else {
                this.showError(response.message || 'Failed to load job for editing');
            }
        } catch (error) {
            console.error('Error editing job:', error);
            this.showError('Failed to load job for editing');
        }
    }

    showJobDetails(job) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Job Details</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="job-details">
                        <h4>${job.title}</h4>
                        <p><strong>Client:</strong> ${job.company?.name || 'N/A'}</p>
                        <p><strong>Location:</strong> ${job.location?.city || 'N/A'}, ${job.location?.state || 'N/A'}</p>
                        <p><strong>Type:</strong> ${job.employmentType || 'N/A'}</p>
                        <p><strong>Experience:</strong> ${job.totalExperience || 'N/A'}</p>
                        <p><strong>Salary:</strong> ₹${job.salary?.min || 'N/A'} - ₹${job.salary?.max || 'N/A'}</p>
                        <p><strong>Skills:</strong> ${job.skills?.join(', ') || 'N/A'}</p>
                        <p><strong>Description:</strong></p>
                        <div class="job-description">${job.description || 'No description available'}</div>
                        <p><strong>Applications:</strong> ${job.applications?.length || 0}</p>
                        <p><strong>Status:</strong> ${job.status || 'Active'}</p>
                        <p><strong>Posted:</strong> ${job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                    <button class="btn btn-primary" onclick="consultancyDashboard.editJob('${job._id}'); this.closest('.modal-overlay').remove();">Edit Job</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showEditJobModal(job) {
        // This would show the comprehensive job form pre-filled with job data
        // For now, just show a message that editing is not fully implemented
        this.showSuccess('Job editing feature will be implemented soon!');
    }

    showSuccess(message) {
        // Create a temporary success message
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4edda;
            color: #155724;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    showError(message) {
        // Create a temporary error message
        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f8d7da;
            color: #721c24;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    showAddJobModal() {
        console.log('showAddJobModal called');
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1200px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3>Create Job Posting</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <form id="addJobForm">
                    <!-- Company Information Section -->
                    <div class="form-section">
                        <h4>Client Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Client Company Name *</label>
                                <input type="text" class="form-control" id="companyName" required>
                            </div>
                            <div class="form-group">
                                <label>Company Type *</label>
                                <select class="form-control" id="companyType" required>
                                    <option value="">Select Company Type</option>
                                    <option value="Indian MNC">Indian MNC</option>
                                    <option value="Foreign MNC">Foreign MNC</option>
                                    <option value="Govt/PSU">Govt/PSU</option>
                                    <option value="Startup">Startup</option>
                                    <option value="Unicorn">Unicorn</option>
                                    <option value="MSME">MSME</option>
                                    <option value="Corporate">Corporate</option>
                                    <option value="Consultancy">Consultancy</option>
                                    <option value="Ltd. Company">Ltd. Company</option>
                                    <option value="Pvt. Ltd. Company">Pvt. Ltd. Company</option>
                                    <option value="LLP. Company">LLP. Company</option>
                                    <option value="Proprietorship">Proprietorship</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Total Employees Count *</label>
                                <select class="form-control" id="totalEmployees" required>
                                    <option value="">Select Employee Count</option>
                                    <option value="0-10">0-10</option>
                                    <option value="11-50">11-50</option>
                                    <option value="51-100">51-100</option>
                                    <option value="101-200">101-200</option>
                                    <option value="201-500">201-500</option>
                                    <option value="500-1000">500-1000</option>
                                    <option value="1001-2000">1001-2000</option>
                                    <option value="2000-3000">2000-3000</option>
                                    <option value="3000 Above">3000 Above</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Company Website</label>
                                <input type="url" class="form-control" id="companyWebsite">
                            </div>
                        </div>
                    </div>

                    <!-- Job Details Section -->
                    <div class="form-section">
                        <h4>Job Details</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Job Title/Designation *</label>
                                <input type="text" class="form-control" id="jobTitle" required>
                            </div>
                            <div class="form-group">
                                <label>Job Sector Type *</label>
                                <select class="form-control" id="jobSectorType" required>
                                    <option value="">Select Sector Type</option>
                                    <option value="IT Job">IT Job</option>
                                    <option value="Non IT Job">Non IT Job</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Job Post Type *</label>
                                <select class="form-control" id="jobPostType" required>
                                    <option value="">Select Job Post Type</option>
                                    <option value="Sales">Sales</option>
                                    <option value="MS Office">MS Office</option>
                                    <option value="MS Word">MS Word</option>
                                    <option value="Field Sales">Field Sales</option>
                                    <option value="Home Loan Sales">Home Loan Sales</option>
                                    <option value="HL">HL</option>
                                    <option value="LAP">LAP</option>
                                    <option value="Java">Java</option>
                                    <option value="React">React</option>
                                    <option value="Angular">Angular</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Employment Type *</label>
                                <select class="form-control" id="employmentType" required>
                                    <option value="">Select Employment Type</option>
                                    <option value="Permanent">Permanent</option>
                                    <option value="Temporary/Contract Job">Temporary/Contract Job</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Apprenticeship">Apprenticeship</option>
                                    <option value="Internship">Internship</option>
                                    <option value="NAPS">NAPS</option>
                                    <option value="Trainee">Trainee</option>
                                    <option value="Fresher">Fresher</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Job Mode Type *</label>
                                <select class="form-control" id="jobModeType" required>
                                    <option value="">Select Job Mode</option>
                                    <option value="Full Time">Full Time</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Any">Any</option>
                                    <option value="Work From Home">Work From Home</option>
                                    <option value="Work From Office">Work From Office</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Job Shift Type *</label>
                                <select class="form-control" id="jobShiftType" required>
                                    <option value="">Select Shift Type</option>
                                    <option value="Day Shift">Day Shift</option>
                                    <option value="Night Shift">Night Shift</option>
                                    <option value="Rotational Shift">Rotational Shift</option>
                                    <option value="Split Shift">Split Shift</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Skills/IT Skills *</label>
                            <input type="text" class="form-control" id="jobSkills" placeholder="Enter skills separated by commas" required>
                        </div>
                    </div>

                    <!-- Location Details Section -->
                    <div class="form-section">
                        <h4>Location Details</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Job State *</label>
                                <select class="form-control" id="jobState" required>
                                    <option value="">Select State</option>
                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                    <option value="Assam">Assam</option>
                                    <option value="Bihar">Bihar</option>
                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                    <option value="Goa">Goa</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                    <option value="Jharkhand">Jharkhand</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Kerala">Kerala</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Manipur">Manipur</option>
                                    <option value="Meghalaya">Meghalaya</option>
                                    <option value="Mizoram">Mizoram</option>
                                    <option value="Nagaland">Nagaland</option>
                                    <option value="Odisha">Odisha</option>
                                    <option value="Punjab">Punjab</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Sikkim">Sikkim</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Telangana">Telangana</option>
                                    <option value="Tripura">Tripura</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Uttarakhand">Uttarakhand</option>
                                    <option value="West Bengal">West Bengal</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Job City/Region *</label>
                                <input type="text" class="form-control" id="jobCity" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Job Locality (Optional)</label>
                                <input type="text" class="form-control" id="jobLocality">
                            </div>
                            <div class="form-group">
                                <label>Distance From Job Location (Km)</label>
                                <input type="number" class="form-control" id="distanceFromLocation" placeholder="e.g., 5">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="includeWillingToRelocate"> 
                                Include Willing To Relocate Candidates
                            </label>
                        </div>
                    </div>

                    <!-- Candidate Requirements Section -->
                    <div class="form-section">
                        <h4>Candidate Requirements</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Candidate Type *</label>
                                <select class="form-control" id="candidateType" required>
                                    <option value="">Select Candidate Type</option>
                                    <option value="Fresher">Fresher</option>
                                    <option value="Experienced">Experienced</option>
                                    <option value="College Student">College Student</option>
                                    <option value="School Student">School Student</option>
                                    <option value="Any">Any</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Total Experience *</label>
                                <select class="form-control" id="totalExperience" required>
                                    <option value="">Select Experience</option>
                                    <option value="Fresher">Fresher</option>
                                    <option value="3 Months">3 Months</option>
                                    <option value="6 Months">6 Months</option>
                                    <option value="9 Months">9 Months</option>
                                    <option value="1 Year">1 Year</option>
                                    <option value="1.5 Years">1.5 Years</option>
                                    <option value="2 Years">2 Years</option>
                                    <option value="2.5 Years">2.5 Years</option>
                                    <option value="3 Years">3 Years</option>
                                    <option value="3.5 Years">3.5 Years</option>
                                    <option value="4 Years">4 Years</option>
                                    <option value="4.5 Years">4.5 Years</option>
                                    <option value="5 Years">5 Years</option>
                                    <option value="5.5 Years">5.5 Years</option>
                                    <option value="6 Years">6 Years</option>
                                    <option value="6.5 Years">6.5 Years</option>
                                    <option value="7 Years">7 Years</option>
                                    <option value="7.5 Years">7.5 Years</option>
                                    <option value="8 Years">8 Years</option>
                                    <option value="8.5 Years">8.5 Years</option>
                                    <option value="9 Years">9 Years</option>
                                    <option value="9.5 Years">9.5 Years</option>
                                    <option value="10 Years">10 Years</option>
                                    <option value="10.5 Years">10.5 Years</option>
                                    <option value="11 Years">11 Years</option>
                                    <option value="11.5 Years">11.5 Years</option>
                                    <option value="12 Years">12 Years</option>
                                    <option value="12.5 Years">12.5 Years</option>
                                    <option value="13 Years">13 Years</option>
                                    <option value="13.5 Years">13.5 Years</option>
                                    <option value="14 Years">14 Years</option>
                                    <option value="14.5 Years">14.5 Years</option>
                                    <option value="15 Years">15 Years</option>
                                    <option value="15.5 Years">15.5 Years</option>
                                    <option value="16 Years">16 Years</option>
                                    <option value="16.5 Years">16.5 Years</option>
                                    <option value="17 Years">17 Years</option>
                                    <option value="17.5 Years">17.5 Years</option>
                                    <option value="18 Years">18 Years</option>
                                    <option value="18.5 Years">18.5 Years</option>
                                    <option value="19 Years">19 Years</option>
                                    <option value="19.5 Years">19.5 Years</option>
                                    <option value="20 Years">20 Years</option>
                                    <option value="20.5 Years">20.5 Years</option>
                                    <option value="21 Years">21 Years</option>
                                    <option value="21.5 Years">21.5 Years</option>
                                    <option value="22 Years">22 Years</option>
                                    <option value="22.5 Years">22.5 Years</option>
                                    <option value="23 Years">23 Years</option>
                                    <option value="23.5 Years">23.5 Years</option>
                                    <option value="24 Years">24 Years</option>
                                    <option value="24.5 Years">24.5 Years</option>
                                    <option value="25 Years">25 Years</option>
                                    <option value="25.5 Years">25.5 Years</option>
                                    <option value="26 Years">26 Years</option>
                                    <option value="26.5 Years">26.5 Years</option>
                                    <option value="27 Years">27 Years</option>
                                    <option value="27.5 Years">27.5 Years</option>
                                    <option value="28 Years">28 Years</option>
                                    <option value="28.5 Years">28.5 Years</option>
                                    <option value="29 Years">29 Years</option>
                                    <option value="29.5 Years">29.5 Years</option>
                                    <option value="30 Years">30 Years</option>
                                    <option value="30+ Years">30+ Years</option>
                                    <option value="31 Years Plus">31 Years Plus</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>In Hand Salary per month (INR) *</label>
                                <input type="number" class="form-control" id="minSalary" required>
                            </div>
                            <div class="form-group">
                                <label>Maximum Salary (INR) *</label>
                                <input type="number" class="form-control" id="maxSalary" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="hideSalaryDetails"> 
                                Hide Salary Details From Candidates
                            </label>
                        </div>
                        <div class="form-group">
                            <label>Additional Benefits</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" value="Office Cab/Shuttle"> Office Cab/Shuttle</label>
                                <label><input type="checkbox" value="Food Allowance"> Food Allowance</label>
                                <label><input type="checkbox" value="Food Canteen"> Food Canteen</label>
                                <label><input type="checkbox" value="Subsidy Based Meals"> Subsidy Based Meals</label>
                                <label><input type="checkbox" value="Health Insurance"> Health Insurance</label>
                                <label><input type="checkbox" value="Annual Bonus"> Annual Bonus</label>
                                <label><input type="checkbox" value="PF"> PF</label>
                                <label><input type="checkbox" value="ESIC"> ESIC</label>
                                <label><input type="checkbox" value="Petrol Allowance"> Petrol Allowance</label>
                                <label><input type="checkbox" value="Incentives"> Incentives</label>
                                <label><input type="checkbox" value="Travel Allowance (TA)"> Travel Allowance (TA)</label>
                                <label><input type="checkbox" value="Daily Allowance (DA)"> Daily Allowance (DA)</label>
                                <label><input type="checkbox" value="Transport Facility"> Transport Facility</label>
                                <label><input type="checkbox" value="Food/Meals"> Food/Meals</label>
                                <label><input type="checkbox" value="Tea/Coffee Break"> Tea/Coffee Break</label>
                                <label><input type="checkbox" value="Mobile Allowance"> Mobile Allowance</label>
                                <label><input type="checkbox" value="Internet Allowance"> Internet Allowance</label>
                                <label><input type="checkbox" value="Overtime Pay"> Overtime Pay</label>
                                <label><input type="checkbox" value="Joining Bonus"> Joining Bonus</label>
                                <label><input type="checkbox" value="Other Benefits"> Other Benefits</label>
                                <label><input type="checkbox" value="Laptop"> Laptop</label>
                                <label><input type="checkbox" value="Mobile Phone"> Mobile Phone</label>
                                <label><input type="checkbox" value="Flexible Working Hours"> Flexible Working Hours</label>
                                <label><input type="checkbox" value="Weekly Payout"> Weekly Payout</label>
                                <label><input type="checkbox" value="Accommodation"> Accommodation</label>
                                <label><input type="checkbox" value="5 Working Days"> 5 Working Days</label>
                                <label><input type="checkbox" value="One-Way Cab"> One-Way Cab</label>
                                <label><input type="checkbox" value="Two-Way Cab"> Two-Way Cab</label>
                                <label><input type="checkbox" value="Accidental Insurance"> Accidental Insurance</label>
                                <label><input type="checkbox" value="GMC Insurance"> GMC Insurance</label>
                                <label><input type="checkbox" value="GPA Insurance"> GPA Insurance</label>
                            </div>
                        </div>
                    </div>

                    <!-- Job Description Section -->
                    <div class="form-section">
                        <h4>Job Description & Vacancy</h4>
                        <div class="form-group">
                            <label>Job Description *</label>
                            <textarea class="form-control" id="jobDescription" rows="6" maxlength="2500" required></textarea>
                            <small class="text-muted">Maximum 2500 words</small>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Number Of Vacancy *</label>
                                <input type="number" class="form-control" id="numberOfVacancy" min="1" required>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="includeWalkinDetails"> 
                                    Include Walk-in Details
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- HR Contact Information Section -->
                    <div class="form-section">
                        <h4>HR/Contact Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>HR/Contact Person Name *</label>
                                <input type="text" class="form-control" id="hrContactName" value="${this.currentUser.firstName} ${this.currentUser.lastName}" required>
                            </div>
                            <div class="form-group">
                                <label>HR/Contact Person Number *</label>
                                <input type="text" class="form-control" id="hrContactNumber" value="${this.currentUser.phone || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>HR/Contact Person Email *</label>
                                <input type="email" class="form-control" id="hrContactEmail" value="${this.currentUser.email}" required>
                            </div>
                            <div class="form-group">
                                <label>HR/Contact Person WhatsApp Number</label>
                                <input type="text" class="form-control" id="hrContactWhatsapp" value="${this.currentUser.phone || ''}">
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Job</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        console.log('Modal added to DOM');
        
        // Add form submission handler
        document.getElementById('addJobForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addJob();
        });

        // Add walk-in details toggle
        document.getElementById('includeWalkinDetails').addEventListener('change', function() {
            // This would show/hide walk-in details section if implemented
        });
    }

    async addJob() {
        // Prevent multiple submissions
        const submitBtn = document.querySelector('#addJobForm button[type="submit"]');
        if (submitBtn && submitBtn.disabled) {
            return; // Already submitting
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Posting Job...';
        }

        try {
            // Collect comprehensive form data
            const jobData = {
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
                    min: document.getElementById('minSalary').value,
                    max: document.getElementById('maxSalary').value,
                    hideDetails: document.getElementById('hideSalaryDetails').checked
                },
                additionalBenefits: Array.from(document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked')).map(cb => cb.value),
                numberOfVacancy: document.getElementById('numberOfVacancy').value,
                includeWalkinDetails: document.getElementById('includeWalkinDetails').checked,
                hrContact: {
                    name: document.getElementById('hrContactName').value,
                    number: document.getElementById('hrContactNumber').value,
                    email: document.getElementById('hrContactEmail').value,
                    whatsapp: document.getElementById('hrContactWhatsapp').value
                }
            };

            const response = await this.apiCall('/api/jobs', 'POST', jobData);
            if (response.success) {
                this.showSuccess('Job posted successfully!');
                document.querySelector('.modal-overlay').remove();
                this.loadJobs(); // Refresh the jobs list
            } else {
                this.showError(response.message || 'Failed to post job');
            }
        } catch (error) {
            console.error('Error posting job:', error);
            this.showError('Failed to post job. Please try again.');
        } finally {
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Post Job';
            }
        }
    }

    async deleteJob(jobId) {
        if (confirm('Are you sure you want to delete this job posting?')) {
            try {
                const response = await this.apiCall(`/api/jobs/${jobId}`, 'DELETE');
                if (response.success) {
                    this.showSuccess('Job deleted successfully!');
                    this.loadJobs(); // Refresh the jobs list
                } else {
                    this.showError(response.message || 'Failed to delete job');
                }
            } catch (error) {
                console.error('Error deleting job:', error);
                this.showError('Failed to delete job. Please try again.');
            }
        }
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

    showError(message) {
        alert('Error: ' + message);
    }

    logout() {
        window.authUtils.logout();
    }
}

// Initialize consultancy dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.consultancyDashboard = new ConsultancyDashboard();
});
