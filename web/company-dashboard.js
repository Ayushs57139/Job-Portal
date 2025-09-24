// Company Dashboard JavaScript
class CompanyDashboard {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'overview';
        this.companyData = {
            employees: [],
            jobs: [],
            applications: [],
            departments: []
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
        this.loadCompanyData();
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
            window.location.href = 'company-login.html';
            return;
        }

        // Get current user and validate they are a company user
        const user = window.authUtils.getCurrentUser();
        if (!user || user.userType !== 'employer' || user.employerType !== 'company') {
            // Clear invalid login data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'company-login.html';
            return;
        }

        try {
            this.currentUser = window.authUtils.getCurrentUser();
            this.updateUserInfo();
            
            // Check if user is company employer
            if (this.currentUser.userType !== 'employer' || this.currentUser.employerType !== 'company') {
                this.showError('Access denied. This dashboard is for company employers only.');
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
            
            // Update company info if available
            this.updateCompanyInfo();
            
            // Update verification status
            this.updateVerificationStatus();
        }
    }
    
    updateVerificationStatus() {
        const user = this.currentUser;
        if (!user || user.userType !== 'employer') return;
        
        // Find or create verification status element
        let statusElement = document.getElementById('verificationStatus');
        if (!statusElement) {
            // Create verification status element in sidebar
            const sidebarHeader = document.querySelector('.sidebar-header');
            if (sidebarHeader) {
                statusElement = document.createElement('div');
                statusElement.id = 'verificationStatus';
                statusElement.style.cssText = `
                    padding: 10px 20px;
                    margin: 10px 0;
                    border-radius: 5px;
                    text-align: center;
                    font-size: 12px;
                    font-weight: 600;
                `;
                sidebarHeader.appendChild(statusElement);
            }
        }
        
        if (statusElement) {
            let statusText = '';
            let statusClass = '';
            
            if (user.isEmployerVerified && user.verificationStatus === 'verified') {
                statusText = '✓ Verified Employer';
                statusClass = 'verified';
                statusElement.style.backgroundColor = '#d4edda';
                statusElement.style.color = '#155724';
                statusElement.style.border = '1px solid #c3e6cb';
            } else if (user.verificationStatus === 'pending') {
                statusText = '⏳ Verification Pending';
                statusClass = 'pending';
                statusElement.style.backgroundColor = '#fff3cd';
                statusElement.style.color = '#856404';
                statusElement.style.border = '1px solid #ffeaa7';
            } else if (user.verificationStatus === 'rejected') {
                statusText = '❌ Verification Rejected';
                statusClass = 'rejected';
                statusElement.style.backgroundColor = '#f8d7da';
                statusElement.style.color = '#721c24';
                statusElement.style.border = '1px solid #f5c6cb';
            } else {
                statusText = '⚠️ Not Verified';
                statusClass = 'not-verified';
                statusElement.style.backgroundColor = '#e2e3e5';
                statusElement.style.color = '#383d41';
                statusElement.style.border = '1px solid #d6d8db';
            }
            
            statusElement.textContent = statusText;
            statusElement.className = `verification-status ${statusClass}`;
        }
    }
    
    updateCompanyInfo() {
        const user = this.currentUser;
        if (!user || !user.profile?.company) return;
        
        // Update company name in header
        const companyName = document.getElementById('companyName');
        if (companyName) {
            companyName.textContent = user.profile.company.name || 'Company Name';
        }
        
        // Update company details in overview
        this.updateCompanyDetails();
    }
    
    updateCompanyDetails() {
        const user = this.currentUser;
        if (!user || !user.profile?.company) return;
        
        const companyInfo = document.getElementById('companyInfo');
        if (companyInfo) {
            const company = user.profile.company.company || {};
            companyInfo.innerHTML = `
                <div class="info-item">
                    <i class="fas fa-building"></i>
                    <div>
                        <h4>${user.profile.company.name || 'Company Name'}</h4>
                        <p>${user.profile.company.industry || 'Industry'}</p>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <div>
                        <h4>Founded</h4>
                        <p>${company.foundedYear || 'N/A'}</p>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-users"></i>
                    <div>
                        <h4>Employees</h4>
                        <p>${company.employeeCount || 'N/A'} employees</p>
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
        
        // Update departments
        const departments = document.getElementById('departments');
        if (departments && user.profile.company.company?.departments) {
            departments.innerHTML = user.profile.company.company.departments.map(dept => 
                `<span class="tag">${dept}</span>`
            ).join('');
        }
        
        // Update benefits
        const benefits = document.getElementById('benefits');
        if (benefits && user.profile.company.company?.benefits) {
            benefits.innerHTML = user.profile.company.company.benefits.map(benefit => 
                `<span class="tag">${benefit}</span>`
            ).join('');
        }
        
        // Update company culture
        const culture = document.getElementById('companyCulture');
        if (culture && user.profile.company.company?.culture) {
            culture.textContent = user.profile.company.company.culture;
        }
        
        // Update work environment
        const workEnv = document.getElementById('workEnvironment');
        if (workEnv && user.profile.company.company?.workEnvironment) {
            workEnv.textContent = user.profile.company.company.workEnvironment;
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
            case 'employees':
                this.loadEmployees();
                break;
            case 'jobs':
                this.loadJobs();
                break;
            case 'applications':
                this.loadApplications();
                break;
            case 'departments':
                this.loadDepartments();
                break;
            case 'profile':
                this.loadProfile();
                break;
            case 'settings':
                this.loadSettings();
                break;
            // Job Management Pages
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
            // Candidate Management Pages
            case 'resume-search':
                this.loadResumeSearch();
                break;
            case 'candesk':
                this.loadCandesk();
                break;
            case 'matching-candidates':
                this.loadMatchingCandidates();
                break;
            case 'saved-candidates':
                this.loadSavedCandidates();
                break;
            case 'invite-candidates':
                this.loadInviteCandidates();
                break;
            // Search & Analytics Pages
            case 'saved-searches':
                this.loadSavedSearches();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            // Community Pages
            case 'social-centre':
                this.loadSocialCentre();
                break;
            case 'community-posts':
                this.loadCommunityPosts();
                break;
            case 'followers':
                this.loadFollowers();
                break;
            case 'messages':
                this.loadMessages();
                break;
            case 'comments':
                this.loadComments();
                break;
        }
    }

    getPageTitle(page) {
        const titles = {
            overview: 'Company Overview',
            employees: 'Employee Management',
            jobs: 'Job Postings',
            applications: 'Applications',
            departments: 'Departments',
            profile: 'Company Profile',
            settings: 'Settings',
            // Job Management
            'manage-jobs': 'Manage Jobs',
            'post-job': 'Post New Job',
            'draft-jobs': 'Draft Jobs',
            'job-responses': 'Manage Jobs & Responses',
            // Candidate Management
            'resume-search': 'Resume Search',
            'candesk': 'Candesk (Resume Search)',
            'matching-candidates': 'Matching Candidates',
            'saved-candidates': 'Saved Candidates',
            'invite-candidates': 'Invite Candidates',
            // Search & Analytics
            'saved-searches': 'Saved Searches',
            'analytics': 'Analytics',
            // Community
            'social-centre': 'Social Centre',
            'community-posts': 'Post in Community',
            'followers': 'Manage Followers',
            'messages': 'Messages',
            'comments': 'Comments'
        };
        return titles[page] || 'Company Dashboard';
    }

    async loadCompanyData() {
        try {
            // Load employees (if endpoint exists)
            try {
                const employeesResponse = await this.apiCall('/api/company/employees', 'GET');
                this.companyData.employees = employeesResponse.employees || [];
            } catch (error) {
                console.log('Employees endpoint not available');
                this.companyData.employees = [];
            }

            // Load jobs
            const jobsResponse = await this.apiCall('/api/jobs', 'GET');
            this.companyData.jobs = jobsResponse.jobs || [];

            // Load applications
            try {
                const applicationsResponse = await this.apiCall('/api/applications/company', 'GET');
                this.companyData.applications = applicationsResponse.applications || [];
            } catch (error) {
                console.log('Applications endpoint not available');
                this.companyData.applications = [];
            }

            // Load departments (if endpoint exists)
            try {
                const departmentsResponse = await this.apiCall('/api/company/departments', 'GET');
                this.companyData.departments = departmentsResponse.departments || [];
            } catch (error) {
                console.log('Departments endpoint not available');
                this.companyData.departments = [];
            }

            this.updateDashboardStats();
        } catch (error) {
            console.error('Failed to load company data:', error);
        }
    }

    updateDashboardStats() {
        // Update statistics
        document.getElementById('totalEmployees').textContent = this.companyData.employees.length;
        document.getElementById('totalJobs').textContent = this.companyData.jobs.length;
        document.getElementById('totalApplications').textContent = this.companyData.applications.length;
        document.getElementById('totalDepartments').textContent = this.companyData.departments.length;
    }

    async loadOverview() {
        try {
            await this.loadDashboardData();
            this.updateDashboardStats();
            this.updateRecentEmployees();
            this.updateRecentJobs();
            this.updateCompanyInfo();
        } catch (error) {
            console.error('Error loading overview:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadDashboardData() {
        try {
            // Load company data
            const companyResponse = await this.apiCall('/api/company/dashboard', 'GET');
            if (companyResponse.success) {
                this.companyData = companyResponse.data;
            }

            // Load employees
            const employeesResponse = await this.apiCall('/api/company/employees', 'GET');
            this.companyData.employees = employeesResponse.employees || [];

            // Load jobs
            const jobsResponse = await this.apiCall('/api/jobs', 'GET');
            this.companyData.jobs = jobsResponse.jobs || [];

            // Load applications
            const applicationsResponse = await this.apiCall('/api/company/applications', 'GET');
            this.companyData.applications = applicationsResponse.applications || [];

            // Load departments
            const departmentsResponse = await this.apiCall('/api/company/departments', 'GET');
            this.companyData.departments = departmentsResponse.departments || [];

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Set default empty data
            this.companyData = {
                employees: [],
                jobs: [],
                applications: [],
                departments: [],
                stats: {
                    totalEmployees: 0,
                    activeJobs: 0,
                    newApplications: 0,
                    totalDepartments: 0
                }
            };
        }
    }

    updateRecentEmployees() {
        const employeesContainer = document.getElementById('recentEmployees');
        
        if (this.companyData.employees.length === 0) {
            employeesContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No employees found</p>';
            return;
        }

        employeesContainer.innerHTML = this.companyData.employees.slice(0, 5).map(employee => `
            <div class="employee-item">
                <div class="employee-avatar">${employee.firstName.charAt(0).toUpperCase()}${employee.lastName.charAt(0).toUpperCase()}</div>
                <div class="employee-info">
                    <h4>${employee.firstName} ${employee.lastName}</h4>
                    <p>${employee.position || 'Employee'} • Joined ${this.formatTimeAgo(new Date(employee.joinedDate || employee.createdAt))}</p>
                </div>
                <div class="employee-role">${employee.department || 'General'}</div>
            </div>
        `).join('');
    }

    updateRecentJobs() {
        const jobsContainer = document.getElementById('recentJobs');
        
        if (this.companyData.jobs.length === 0) {
            jobsContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No job postings found</p>';
            return;
        }

        jobsContainer.innerHTML = this.companyData.jobs.slice(0, 5).map(job => `
            <div class="job-item">
                <div class="job-icon">
                    <i class="fas fa-briefcase"></i>
                </div>
                <div class="job-content">
                    <h4>${job.title}</h4>
                    <p>${job.department || 'General'} • Posted ${this.formatTimeAgo(new Date(job.createdAt))} • ${job.applications?.length || 0} applications</p>
                </div>
                <div class="job-actions">
                    <button class="btn btn-primary" onclick="companyDashboard.viewJob('${job._id}')">View</button>
                    <button class="btn btn-success" onclick="companyDashboard.editJob('${job._id}')">Edit</button>
                </div>
            </div>
        `).join('');
    }

    async loadEmployees() {
        try {
            await this.loadDashboardData();
            this.updateEmployeesTable();
        } catch (error) {
            console.error('Error loading employees:', error);
            this.showError('Failed to load employees');
        }
    }

    updateEmployeesTable() {
        const employeesContainer = document.getElementById('employeesTable');
        if (!employeesContainer) return;

        if (this.companyData.employees.length === 0) {
            employeesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No employees found</h3>
                    <p>Start by adding your first employee to the system.</p>
                    <button class="btn btn-primary" onclick="companyDashboard.showAddEmployeeModal()">
                        <i class="fas fa-plus"></i> Add Employee
                    </button>
                </div>
            `;
            return;
        }

        employeesContainer.innerHTML = `
            <div class="table-header">
                <h3>Employees (${this.companyData.employees.length})</h3>
                <button class="btn btn-primary" onclick="companyDashboard.showAddEmployeeModal()">
                    <i class="fas fa-plus"></i> Add Employee
                </button>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Position</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Join Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.companyData.employees.map(employee => `
                            <tr>
                                <td>
                                    <div class="employee-info">
                                        <div class="avatar">${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}</div>
                                        <div>
                                            <div class="name">${employee.firstName} ${employee.lastName}</div>
                                            <div class="email">${employee.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>${employee.position || 'N/A'}</td>
                                <td>${employee.department || 'N/A'}</td>
                                <td><span class="status-badge status-${employee.status || 'active'}">${employee.status || 'Active'}</span></td>
                                <td>${employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary" onclick="companyDashboard.viewEmployee('${employee._id}')" title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-warning" onclick="companyDashboard.editEmployee('${employee._id}')" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="companyDashboard.deleteEmployee('${employee._id}')" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    async loadJobs() {
        try {
            await this.loadDashboardData();
            this.updateJobsTable();
        } catch (error) {
            console.error('Error loading jobs:', error);
            this.showError('Failed to load jobs');
        }
    }

    updateJobsTable() {
        const jobsContainer = document.getElementById('jobsTable');
        if (!jobsContainer) return;

        if (this.companyData.jobs.length === 0) {
            jobsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-briefcase"></i>
                    <h3>No job postings found</h3>
                    <p>Create your first job posting to start attracting talent.</p>
                    <button class="btn btn-primary" onclick="companyDashboard.showAddJobModal()">
                        <i class="fas fa-plus"></i> Create Job Posting
                    </button>
                </div>
            `;
            return;
        }

        jobsContainer.innerHTML = `
            <div class="table-header">
                <h3>Job Postings (${this.companyData.jobs.length})</h3>
                <button class="btn btn-primary" onclick="companyDashboard.showAddJobModal()">
                    <i class="fas fa-plus"></i> Create Job Posting
                </button>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Department</th>
                            <th>Type</th>
                            <th>Applications</th>
                            <th>Status</th>
                            <th>Posted Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.companyData.jobs.map(job => `
                            <tr>
                                <td>
                                    <div class="job-info">
                                        <div class="title">${job.title}</div>
                                        <div class="location">${job.location?.city || 'N/A'}, ${job.location?.state || 'N/A'}</div>
                                    </div>
                                </td>
                                <td>${job.department || 'N/A'}</td>
                                <td><span class="job-type">${job.jobType || 'N/A'}</span></td>
                                <td><span class="application-count">${job.applications?.length || 0}</span></td>
                                <td><span class="status-badge status-${job.status || 'active'}">${job.status || 'Active'}</span></td>
                                <td>${job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary" onclick="companyDashboard.viewJob('${job._id}')" title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-warning" onclick="companyDashboard.editJob('${job._id}')" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="companyDashboard.deleteJob('${job._id}')" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    async loadApplications() {
        try {
            await this.loadDashboardData();
            this.updateApplicationsTable();
        } catch (error) {
            console.error('Error loading applications:', error);
            this.showError('Failed to load applications');
        }
    }

    updateApplicationsTable() {
        const applicationsContainer = document.getElementById('applicationsTable');
        if (!applicationsContainer) return;

        if (this.companyData.applications.length === 0) {
            applicationsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>No applications found</h3>
                    <p>Applications will appear here when candidates apply to your job postings.</p>
                </div>
            `;
            return;
        }

        applicationsContainer.innerHTML = `
            <div class="table-header">
                <h3>Applications (${this.companyData.applications.length})</h3>
                <div class="filter-options">
                    <select id="statusFilter" onchange="companyDashboard.filterApplications()">
                        <option value="">All Status</option>
                        <option value="applied">Applied</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                    </select>
                </div>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Candidate</th>
                            <th>Job Title</th>
                            <th>Applied Date</th>
                            <th>Status</th>
                            <th>Experience</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.companyData.applications.map(application => `
                            <tr>
                                <td>
                                    <div class="candidate-info">
                                        <div class="avatar">${application.user?.firstName?.charAt(0) || 'U'}${application.user?.lastName?.charAt(0) || 'N'}</div>
                                        <div>
                                            <div class="name">${application.user?.firstName || 'Unknown'} ${application.user?.lastName || 'User'}</div>
                                            <div class="email">${application.user?.email || 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>${application.job?.title || 'N/A'}</td>
                                <td>${application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'N/A'}</td>
                                <td><span class="status-badge status-${application.status || 'applied'}">${application.status || 'Applied'}</span></td>
                                <td>${application.user?.profile?.experience || 0} years</td>
                                <td>
                                    <button class="btn btn-sm btn-primary" onclick="companyDashboard.viewApplication('${application._id}')" title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-success" onclick="companyDashboard.updateApplicationStatus('${application._id}', 'shortlisted')" title="Shortlist">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <button class="btn btn-sm btn-warning" onclick="companyDashboard.updateApplicationStatus('${application._id}', 'reviewed')" title="Review">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="companyDashboard.updateApplicationStatus('${application._id}', 'rejected')" title="Reject">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    async loadDepartments() {
        try {
            await this.loadDashboardData();
            this.updateDepartmentsTable();
        } catch (error) {
            console.error('Error loading departments:', error);
            this.showError('Failed to load departments');
        }
    }

    updateDepartmentsTable() {
        const departmentsContainer = document.getElementById('departmentsTable');
        if (!departmentsContainer) return;

        if (this.companyData.departments.length === 0) {
            departmentsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-building"></i>
                    <h3>No departments found</h3>
                    <p>Create departments to organize your company structure.</p>
                    <button class="btn btn-primary" onclick="companyDashboard.showAddDepartmentModal()">
                        <i class="fas fa-plus"></i> Add Department
                    </button>
                </div>
            `;
            return;
        }

        departmentsContainer.innerHTML = `
            <div class="table-header">
                <h3>Departments (${this.companyData.departments.length})</h3>
                <button class="btn btn-primary" onclick="companyDashboard.showAddDepartmentModal()">
                    <i class="fas fa-plus"></i> Add Department
                </button>
            </div>
            <div class="departments-grid">
                ${this.companyData.departments.map(department => `
                    <div class="department-card">
                        <div class="department-header">
                            <h4>${department.name}</h4>
                            <div class="department-actions">
                                <button class="btn btn-sm btn-primary" onclick="companyDashboard.viewDepartment('${department._id}')" title="View">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="companyDashboard.editDepartment('${department._id}')" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="companyDashboard.deleteDepartment('${department._id}')" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="department-info">
                            <p><strong>Head:</strong> ${department.head || 'Not assigned'}</p>
                            <p><strong>Employees:</strong> ${department.employeeCount || 0}</p>
                            <p><strong>Description:</strong> ${department.description || 'No description'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async loadProfile() {
        try {
            await this.loadDashboardData();
            this.updateCompanyProfile();
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Failed to load company profile');
        }
    }

    updateCompanyProfile() {
        const profileContainer = document.getElementById('profileForm');
        if (!profileContainer) return;

        const company = this.currentUser.profile?.company || {};
        const companyDetails = company.company || {};

        profileContainer.innerHTML = `
            <form id="companyProfileForm">
                <div class="form-section">
                    <h3>Basic Information</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="companyName">Company Name *</label>
                            <input type="text" id="companyName" value="${company.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="website">Website</label>
                            <input type="url" id="website" value="${company.website || ''}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="industry">Industry *</label>
                            <select id="industry" required>
                                <option value="">Select Industry</option>
                                <option value="IT" ${company.industry === 'IT' ? 'selected' : ''}>Information Technology</option>
                                <option value="Finance" ${company.industry === 'Finance' ? 'selected' : ''}>Finance & Banking</option>
                                <option value="Healthcare" ${company.industry === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
                                <option value="Manufacturing" ${company.industry === 'Manufacturing' ? 'selected' : ''}>Manufacturing</option>
                                <option value="Retail" ${company.industry === 'Retail' ? 'selected' : ''}>Retail</option>
                                <option value="Education" ${company.industry === 'Education' ? 'selected' : ''}>Education</option>
                                <option value="Other" ${company.industry === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="size">Company Size *</label>
                            <select id="size" required>
                                <option value="">Select Size</option>
                                <option value="1-10" ${company.size === '1-10' ? 'selected' : ''}>1-10 employees</option>
                                <option value="11-50" ${company.size === '11-50' ? 'selected' : ''}>11-50 employees</option>
                                <option value="51-200" ${company.size === '51-200' ? 'selected' : ''}>51-200 employees</option>
                                <option value="201-500" ${company.size === '201-500' ? 'selected' : ''}>201-500 employees</option>
                                <option value="501-1000" ${company.size === '501-1000' ? 'selected' : ''}>501-1000 employees</option>
                                <option value="1000+" ${company.size === '1000+' ? 'selected' : ''}>1000+ employees</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Company Details</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="foundedYear">Founded Year</label>
                            <input type="number" id="foundedYear" value="${companyDetails.foundedYear || ''}" min="1900" max="2024">
                        </div>
                        <div class="form-group">
                            <label for="revenue">Annual Revenue</label>
                            <select id="revenue">
                                <option value="">Select Revenue Range</option>
                                <option value="0-1M" ${companyDetails.revenue === '0-1M' ? 'selected' : ''}>$0 - $1M</option>
                                <option value="1M-10M" ${companyDetails.revenue === '1M-10M' ? 'selected' : ''}>$1M - $10M</option>
                                <option value="10M-50M" ${companyDetails.revenue === '10M-50M' ? 'selected' : ''}>$10M - $50M</option>
                                <option value="50M-100M" ${companyDetails.revenue === '50M-100M' ? 'selected' : ''}>$50M - $100M</option>
                                <option value="100M-500M" ${companyDetails.revenue === '100M-500M' ? 'selected' : ''}>$100M - $500M</option>
                                <option value="500M+" ${companyDetails.revenue === '500M+' ? 'selected' : ''}>$500M+</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="description">Company Description</label>
                        <textarea id="description" rows="4">${company.description || ''}</textarea>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Location</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="city">City</label>
                            <input type="text" id="city" value="${company.location?.city || ''}">
                        </div>
                        <div class="form-group">
                            <label for="state">State</label>
                            <input type="text" id="state" value="${company.location?.state || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="country">Country</label>
                        <input type="text" id="country" value="${company.location?.country || ''}">
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                    <button type="button" class="btn btn-secondary" onclick="companyDashboard.cancelProfileEdit()">Cancel</button>
                </div>
            </form>
        `;

        // Add form submission handler
        document.getElementById('companyProfileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCompanyProfile();
        });
    }

    async loadSettings() {
        try {
            await this.loadDashboardData();
            this.updateSettingsForm();
        } catch (error) {
            console.error('Error loading settings:', error);
            this.showError('Failed to load settings');
        }
    }

    updateSettingsForm() {
        const settingsContainer = document.getElementById('settingsForm');
        if (!settingsContainer) return;

        settingsContainer.innerHTML = `
            <div class="settings-sections">
                <div class="settings-section">
                    <h3>Account Settings</h3>
                    <form id="accountSettingsForm">
                        <div class="form-group">
                            <label for="firstName">First Name</label>
                            <input type="text" id="firstName" value="${this.currentUser.firstName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="lastName">Last Name</label>
                            <input type="text" id="lastName" value="${this.currentUser.lastName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" value="${this.currentUser.email || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone</label>
                            <input type="tel" id="phone" value="${this.currentUser.phone || ''}">
                        </div>
                        <button type="submit" class="btn btn-primary">Update Account</button>
                    </form>
                </div>

                <div class="settings-section">
                    <h3>Password Settings</h3>
                    <form id="passwordSettingsForm">
                        <div class="form-group">
                            <label for="currentPassword">Current Password</label>
                            <input type="password" id="currentPassword" required>
                        </div>
                        <div class="form-group">
                            <label for="newPassword">New Password</label>
                            <input type="password" id="newPassword" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm New Password</label>
                            <input type="password" id="confirmPassword" required minlength="6">
                        </div>
                        <button type="submit" class="btn btn-primary">Change Password</button>
                    </form>
                </div>

                <div class="settings-section">
                    <h3>Notification Settings</h3>
                    <form id="notificationSettingsForm">
                        <div class="checkbox-group">
                            <input type="checkbox" id="emailNotifications" checked>
                            <label for="emailNotifications">Email Notifications</label>
                        </div>
                        <div class="checkbox-group">
                            <input type="checkbox" id="jobAlerts" checked>
                            <label for="jobAlerts">Job Application Alerts</label>
                        </div>
                        <div class="checkbox-group">
                            <input type="checkbox" id="marketingEmails">
                            <label for="marketingEmails">Marketing Emails</label>
                        </div>
                        <button type="submit" class="btn btn-primary">Save Preferences</button>
                    </form>
                </div>
            </div>
        `;

        // Add form submission handlers
        document.getElementById('accountSettingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateAccountSettings();
        });

        document.getElementById('passwordSettingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });

        document.getElementById('notificationSettingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateNotificationSettings();
        });
    }

    // Job Management Methods
    showAddJobModal() {
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
                        <h4>Company Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Company Name/Consultancy Name *</label>
                                <input type="text" class="form-control" id="companyName" value="${this.currentUser.profile?.company?.name || ''}" required>
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
                                <input type="url" class="form-control" id="companyWebsite" value="${this.currentUser.profile?.company?.website || ''}">
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
        // Check employer verification first
        if (!this.currentUser || this.currentUser.userType !== 'admin' && this.currentUser.userType !== 'superadmin') {
            if (!this.currentUser.isEmployerVerified || this.currentUser.verificationStatus !== 'verified') {
                this.showError('Your employer account is not verified yet. Please wait for admin verification before posting jobs.');
                return;
            }
        }

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
                this.showError(response.message || 'Failed to create job');
            }
        } catch (error) {
            console.error('Error creating job:', error);
            this.showError('Failed to create job');
        } finally {
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Post Job';
            }
        }
    }

    // Department Management Methods
    showAddDepartmentModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Department</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <form id="addDepartmentForm">
                    <div class="form-group">
                        <label for="deptName">Department Name *</label>
                        <input type="text" id="deptName" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="deptDescription">Description</label>
                        <textarea id="deptDescription" name="description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="deptHead">Department Head</label>
                        <input type="text" id="deptHead" name="head">
                    </div>
                    <div class="form-group">
                        <label for="deptBudget">Budget</label>
                        <input type="number" id="deptBudget" name="budget" placeholder="Annual budget">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Department</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add form submission handler
        document.getElementById('addDepartmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addDepartment();
        });
    }

    async addDepartment() {
        try {
            const formData = new FormData(document.getElementById('addDepartmentForm'));
            const departmentData = {
                name: formData.get('name'),
                description: formData.get('description'),
                head: formData.get('head'),
                budget: formData.get('budget') ? parseInt(formData.get('budget')) : null
            };

            const response = await this.apiCall('/api/company/departments', 'POST', departmentData);
            if (response.success) {
                this.showSuccess('Department added successfully!');
                document.querySelector('.modal-overlay').remove();
                this.loadDepartments(); // Refresh the departments list
            } else {
                this.showError(response.message || 'Failed to add department');
            }
        } catch (error) {
            console.error('Error adding department:', error);
            this.showError('Failed to add department');
        }
    }

    // Employee Management Methods
    showAddEmployeeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2>Add New Employee</h2>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addEmployeeForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="empFirstName">First Name *</label>
                                <input type="text" id="empFirstName" required>
                            </div>
                            <div class="form-group">
                                <label for="empLastName">Last Name *</label>
                                <input type="text" id="empLastName" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="empEmail">Email *</label>
                                <input type="email" id="empEmail" required>
                            </div>
                            <div class="form-group">
                                <label for="empPhone">Phone</label>
                                <input type="tel" id="empPhone">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="empPosition">Position *</label>
                                <input type="text" id="empPosition" required>
                            </div>
                            <div class="form-group">
                                <label for="empDepartment">Department</label>
                                <select id="empDepartment">
                                    <option value="">Select Department</option>
                                    ${this.companyData.departments.map(dept => 
                                        `<option value="${dept.name}">${dept.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="empSalary">Salary</label>
                            <input type="number" id="empSalary" placeholder="Annual salary">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Employee</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('addEmployeeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addEmployee();
        });
    }

    async addEmployee() {
        try {
            const employeeData = {
                firstName: document.getElementById('empFirstName').value,
                lastName: document.getElementById('empLastName').value,
                email: document.getElementById('empEmail').value,
                phone: document.getElementById('empPhone').value,
                position: document.getElementById('empPosition').value,
                department: document.getElementById('empDepartment').value,
                salary: document.getElementById('empSalary').value
            };

            const response = await this.apiCall('/api/company/employees', 'POST', employeeData);
            if (response.success) {
                this.showSuccess('Employee added successfully!');
                document.querySelector('.modal-overlay').remove();
                this.loadEmployees();
            } else {
                this.showError(response.message || 'Failed to add employee');
            }
        } catch (error) {
            console.error('Error adding employee:', error);
            this.showError('Failed to add employee');
        }
    }

    async viewEmployee(employeeId) {
        try {
            const response = await this.apiCall(`/api/company/employees/${employeeId}`, 'GET');
            if (response.success) {
                this.showEmployeeDetails(response.employee);
            } else {
                this.showError('Failed to load employee details');
            }
        } catch (error) {
            console.error('Error viewing employee:', error);
            this.showError('Failed to load employee details');
        }
    }

    showEmployeeDetails(employee) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2>Employee Details</h2>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="employee-details">
                        <div class="employee-header">
                            <div class="avatar large">${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}</div>
                            <div class="employee-info">
                                <h3>${employee.firstName} ${employee.lastName}</h3>
                                <p>${employee.position || 'N/A'}</p>
                                <p>${employee.department || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="details-grid">
                            <div class="detail-item">
                                <strong>Email:</strong> ${employee.email}
                            </div>
                            <div class="detail-item">
                                <strong>Phone:</strong> ${employee.phone || 'N/A'}
                            </div>
                            <div class="detail-item">
                                <strong>Salary:</strong> ${employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}
                            </div>
                            <div class="detail-item">
                                <strong>Join Date:</strong> ${employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div class="detail-item">
                                <strong>Status:</strong> <span class="status-badge status-${employee.status || 'active'}">${employee.status || 'Active'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async editEmployee(employeeId) {
        // Implementation for editing employee
        console.log('Editing employee:', employeeId);
    }

    async deleteEmployee(employeeId) {
        if (confirm('Are you sure you want to delete this employee?')) {
            try {
                const response = await this.apiCall(`/api/company/employees/${employeeId}`, 'DELETE');
                if (response.success) {
                    this.showSuccess('Employee deleted successfully!');
                    this.loadEmployees();
                } else {
                    this.showError(response.message || 'Failed to delete employee');
                }
            } catch (error) {
                console.error('Error deleting employee:', error);
                this.showError('Failed to delete employee');
            }
        }
    }

    async viewJob(jobId) {
        // Implementation for viewing job details
        console.log('Viewing job:', jobId);
    }

    async editJob(jobId) {
        // Implementation for editing job
        console.log('Editing job:', jobId);
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

    openDashboard() {
        console.log('openDashboard called');
        // Navigate to the main dashboard overview page
        this.navigateToPage('overview');
        // Also scroll to top to ensure user sees the overview
        window.scrollTo(0, 0);
        console.log('Navigation completed');
    }

    // ===== NEW PAGE LOADING METHODS =====

    // Job Management Pages
    async loadManageJobs() {
        const content = document.getElementById('manageJobsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="page-actions">
                <button class="btn btn-primary" onclick="companyDashboard.navigateToPage('post-job')">
                    <i class="fas fa-plus"></i> Post New Job
                </button>
                <button class="btn btn-secondary" onclick="companyDashboard.loadManageJobs()">
                    <i class="fas fa-refresh"></i> Refresh
                </button>
            </div>
            
            <div class="jobs-grid" id="manageJobsGrid">
                <!-- Jobs will be loaded here -->
            </div>
        `;

        // Load company's jobs
        try {
            const response = await this.apiCall('/api/jobs/company', 'GET');
            const jobs = response.jobs || [];
            this.displayManageJobs(jobs);
        } catch (error) {
            console.error('Error loading jobs:', error);
            content.innerHTML += '<div class="error">Failed to load jobs</div>';
        }
    }

    async loadPostJob() {
        const content = document.getElementById('postJobForm');
        if (!content) return;

        content.innerHTML = `
            <form id="addJobForm" class="job-form">
                <div class="form-section">
                    <h3>Job Details</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="jobTitle">Job Title *</label>
                            <input type="text" id="jobTitle" name="title" required>
                        </div>
                        <div class="form-group">
                            <label for="jobPostType">Job Post Type *</label>
                            <select id="jobPostType" name="jobPostType" required>
                                <option value="">Select Type</option>
                                <option value="Sales">Sales</option>
                                <option value="Java">Java</option>
                                <option value="React">React</option>
                                <option value="Python">Python</option>
                                <option value="Marketing">Marketing</option>
                                <option value="HR">HR</option>
                                <option value="Finance">Finance</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="jobDescription">Job Description *</label>
                        <textarea id="jobDescription" name="description" rows="5" required></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="employmentType">Employment Type *</label>
                            <select id="employmentType" name="employmentType" required>
                                <option value="">Select Type</option>
                                <option value="Permanent">Permanent</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                                <option value="Part-time">Part-time</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="jobModeType">Job Mode *</label>
                            <select id="jobModeType" name="jobModeType" required>
                                <option value="">Select Mode</option>
                                <option value="Work From Office">Work From Office</option>
                                <option value="Work From Home">Work From Home</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Company Details</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="companyName">Company Name *</label>
                            <input type="text" id="companyName" name="companyName" value="${this.currentUser?.profile?.company?.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="totalEmployees">Total Employees</label>
                            <select id="totalEmployees" name="totalEmployees">
                                <option value="">Select Size</option>
                                <option value="0-10">0-10</option>
                                <option value="11-50">11-50</option>
                                <option value="51-100">51-100</option>
                                <option value="101-500">101-500</option>
                                <option value="500+">500+</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="companyWebsite">Company Website</label>
                        <input type="url" id="companyWebsite" name="companyWebsite" value="${this.currentUser?.profile?.company?.website || ''}">
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Location & Salary</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="jobState">State *</label>
                            <input type="text" id="jobState" name="state" required>
                        </div>
                        <div class="form-group">
                            <label for="jobCity">City *</label>
                            <input type="text" id="jobCity" name="city" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="salaryMin">Min Salary (₹)</label>
                            <input type="number" id="salaryMin" name="salaryMin" placeholder="500000">
                        </div>
                        <div class="form-group">
                            <label for="salaryMax">Max Salary (₹)</label>
                            <input type="number" id="salaryMax" name="salaryMax" placeholder="1000000">
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Skills & Requirements</h3>
                    <div class="form-group">
                        <label for="jobSkills">Required Skills (comma-separated)</label>
                        <input type="text" id="jobSkills" name="skills" placeholder="JavaScript, React, Node.js">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="experienceMin">Min Experience</label>
                            <select id="experienceMin" name="experienceMin">
                                <option value="">Select</option>
                                <option value="Fresher">Fresher</option>
                                <option value="1 Year">1 Year</option>
                                <option value="2 Years">2 Years</option>
                                <option value="3 Years">3 Years</option>
                                <option value="5+ Years">5+ Years</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="experienceMax">Max Experience</label>
                            <select id="experienceMax" name="experienceMax">
                                <option value="">Select</option>
                                <option value="1 Year">1 Year</option>
                                <option value="2 Years">2 Years</option>
                                <option value="3 Years">3 Years</option>
                                <option value="5 Years">5 Years</option>
                                <option value="10+ Years">10+ Years</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="companyDashboard.saveDraft()">
                        <i class="fas fa-save"></i> Save as Draft
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-paper-plane"></i> Post Job
                    </button>
                </div>
            </form>
        `;

        // Add form event listener
        document.getElementById('addJobForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addJob();
        });
    }

    async loadDraftJobs() {
        const content = document.getElementById('draftJobsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="page-actions">
                <button class="btn btn-primary" onclick="companyDashboard.navigateToPage('post-job')">
                    <i class="fas fa-plus"></i> Create New Draft
                </button>
                <button class="btn btn-secondary" onclick="companyDashboard.loadDraftJobs()">
                    <i class="fas fa-refresh"></i> Refresh
                </button>
            </div>
            
            <div class="draft-jobs-grid" id="draftJobsGrid">
                <!-- Draft jobs will be loaded here -->
            </div>
        `;

        // Load draft jobs
        try {
            const response = await this.apiCall('/api/jobs/drafts', 'GET');
            const drafts = response.drafts || [];
            this.displayDraftJobs(drafts);
        } catch (error) {
            console.error('Error loading draft jobs:', error);
            content.innerHTML += '<div class="error">Failed to load draft jobs</div>';
        }
    }

    async loadJobResponses() {
        const content = document.getElementById('jobResponsesContent');
        if (!content) return;

        content.innerHTML = `
            <div class="responses-header">
                <div class="responses-stats">
                    <div class="stat-item">
                        <span class="stat-number" id="totalResponses">0</span>
                        <span class="stat-label">Total Responses</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" id="newResponses">0</span>
                        <span class="stat-label">New This Week</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" id="shortlisted">0</span>
                        <span class="stat-label">Shortlisted</span>
                    </div>
                </div>
            </div>
            
            <div class="responses-filters">
                <select id="jobFilter" onchange="companyDashboard.filterResponses()">
                    <option value="">All Jobs</option>
                </select>
                <select id="statusFilter" onchange="companyDashboard.filterResponses()">
                    <option value="">All Status</option>
                    <option value="applied">Applied</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                </select>
            </div>
            
            <div class="responses-table" id="responsesTable">
                <!-- Responses will be loaded here -->
            </div>
        `;

        // Load job responses
        try {
            const response = await this.apiCall('/api/applications/company', 'GET');
            const responses = response.applications || [];
            this.displayJobResponses(responses);
        } catch (error) {
            console.error('Error loading job responses:', error);
            content.innerHTML += '<div class="error">Failed to load job responses</div>';
        }
    }

    // Candidate Management Pages
    async loadResumeSearch() {
        const content = document.getElementById('resumeSearchContent');
        if (!content) return;

        content.innerHTML = `
            <div class="search-filters">
                <div class="filter-section">
                    <h3>Search Filters</h3>
                    <div class="filter-row">
                        <div class="filter-group">
                            <label>Keywords</label>
                            <input type="text" id="searchKeywords" placeholder="Skills, job title, company...">
                        </div>
                        <div class="filter-group">
                            <label>Location</label>
                            <input type="text" id="searchLocation" placeholder="City, State">
                        </div>
                    </div>
                    
                    <div class="filter-row">
                        <div class="filter-group">
                            <label>Experience</label>
                            <select id="searchExperience">
                                <option value="">Any Experience</option>
                                <option value="0-1">0-1 Years</option>
                                <option value="1-3">1-3 Years</option>
                                <option value="3-5">3-5 Years</option>
                                <option value="5+">5+ Years</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Salary Range</label>
                            <select id="searchSalary">
                                <option value="">Any Salary</option>
                                <option value="0-3">0-3 LPA</option>
                                <option value="3-6">3-6 LPA</option>
                                <option value="6-10">6-10 LPA</option>
                                <option value="10+">10+ LPA</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="filter-actions">
                        <button class="btn btn-primary" onclick="companyDashboard.searchResumes()">
                            <i class="fas fa-search"></i> Search Resumes
                        </button>
                        <button class="btn btn-secondary" onclick="companyDashboard.saveSearch()">
                            <i class="fas fa-save"></i> Save Search
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="search-results" id="resumeSearchResults">
                <!-- Search results will be loaded here -->
            </div>
        `;
    }

    async loadCandesk() {
        const content = document.getElementById('candeskContent');
        if (!content) return;

        content.innerHTML = `
            <div class="candesk-header">
                <h3>Advanced Candidate Search & Management</h3>
                <div class="candesk-actions">
                    <button class="btn btn-primary" onclick="companyDashboard.advancedSearch()">
                        <i class="fas fa-search-plus"></i> Advanced Search
                    </button>
                    <button class="btn btn-secondary" onclick="companyDashboard.bulkActions()">
                        <i class="fas fa-tasks"></i> Bulk Actions
                    </button>
                </div>
            </div>
            
            <div class="candesk-filters">
                <div class="filter-tabs">
                    <button class="filter-tab active" data-filter="all">All Candidates</button>
                    <button class="filter-tab" data-filter="recent">Recent</button>
                    <button class="filter-tab" data-filter="saved">Saved</button>
                    <button class="filter-tab" data-filter="contacted">Contacted</button>
                </div>
            </div>
            
            <div class="candesk-results" id="candeskResults">
                <!-- Candesk results will be loaded here -->
            </div>
        `;
    }

    async loadMatchingCandidates() {
        const content = document.getElementById('matchingCandidatesContent');
        if (!content) return;

        content.innerHTML = `
            <div class="matching-header">
                <h3>Candidates Matching Your Job Requirements</h3>
                <div class="matching-stats">
                    <span class="match-count" id="matchCount">0</span> candidates found
                </div>
            </div>
            
            <div class="matching-filters">
                <select id="jobMatchFilter" onchange="companyDashboard.filterMatchingCandidates()">
                    <option value="">Select Job to Match</option>
                </select>
                <select id="matchScoreFilter" onchange="companyDashboard.filterMatchingCandidates()">
                    <option value="">All Match Scores</option>
                    <option value="90-100">90-100%</option>
                    <option value="80-89">80-89%</option>
                    <option value="70-79">70-79%</option>
                    <option value="60-69">60-69%</option>
                </select>
            </div>
            
            <div class="matching-results" id="matchingResults">
                <!-- Matching candidates will be loaded here -->
            </div>
        `;
    }

    async loadSavedCandidates() {
        const content = document.getElementById('savedCandidatesContent');
        if (!content) return;

        content.innerHTML = `
            <div class="saved-header">
                <h3>Your Saved Candidates</h3>
                <div class="saved-actions">
                    <button class="btn btn-primary" onclick="companyDashboard.exportSavedCandidates()">
                        <i class="fas fa-download"></i> Export List
                    </button>
                    <button class="btn btn-secondary" onclick="companyDashboard.bulkInvite()">
                        <i class="fas fa-envelope"></i> Bulk Invite
                    </button>
                </div>
            </div>
            
            <div class="saved-filters">
                <input type="text" id="savedSearch" placeholder="Search saved candidates..." onkeyup="companyDashboard.searchSavedCandidates()">
                <select id="savedSort" onchange="companyDashboard.sortSavedCandidates()">
                    <option value="date">Sort by Date Saved</option>
                    <option value="name">Sort by Name</option>
                    <option value="experience">Sort by Experience</option>
                </select>
            </div>
            
            <div class="saved-results" id="savedResults">
                <!-- Saved candidates will be loaded here -->
            </div>
        `;
    }

    async loadInviteCandidates() {
        const content = document.getElementById('inviteCandidatesContent');
        if (!content) return;

        content.innerHTML = `
            <div class="invite-header">
                <h3>Invite Candidates to Apply</h3>
                <p>Send personalized invitations to candidates for your job openings</p>
            </div>
            
            <div class="invite-methods">
                <div class="invite-method">
                    <h4><i class="fas fa-envelope"></i> Email Invitations</h4>
                    <p>Send email invitations to specific candidates</p>
                    <button class="btn btn-primary" onclick="companyDashboard.showEmailInvite()">
                        Send Email Invites
                    </button>
                </div>
                
                <div class="invite-method">
                    <h4><i class="fas fa-link"></i> Share Job Link</h4>
                    <p>Generate shareable links for your job postings</p>
                    <button class="btn btn-secondary" onclick="companyDashboard.showJobLinks()">
                        Generate Links
                    </button>
                </div>
                
                <div class="invite-method">
                    <h4><i class="fas fa-users"></i> Bulk Invitations</h4>
                    <p>Invite multiple candidates at once</p>
                    <button class="btn btn-secondary" onclick="companyDashboard.showBulkInvite()">
                        Bulk Invite
                    </button>
                </div>
            </div>
            
            <div class="invite-history" id="inviteHistory">
                <!-- Invitation history will be loaded here -->
            </div>
        `;
    }

    // Search & Analytics Pages
    async loadSavedSearches() {
        const content = document.getElementById('savedSearchesContent');
        if (!content) return;

        content.innerHTML = `
            <div class="saved-searches-header">
                <h3>Your Saved Searches</h3>
                <button class="btn btn-primary" onclick="companyDashboard.createNewSearch()">
                    <i class="fas fa-plus"></i> Create New Search
                </button>
            </div>
            
            <div class="saved-searches-grid" id="savedSearchesGrid">
                <!-- Saved searches will be loaded here -->
            </div>
        `;
    }

    async loadAnalytics() {
        const content = document.getElementById('analyticsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="analytics-dashboard">
                <div class="analytics-header">
                    <h3>Company Analytics Dashboard</h3>
                    <div class="analytics-filters">
                        <select id="analyticsPeriod" onchange="companyDashboard.updateAnalytics()">
                            <option value="7">Last 7 Days</option>
                            <option value="30" selected>Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="365">Last Year</option>
                        </select>
                    </div>
                </div>
                
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <h4>Job Performance</h4>
                        <div class="analytics-chart" id="jobPerformanceChart">
                            <!-- Chart will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <h4>Application Trends</h4>
                        <div class="analytics-chart" id="applicationTrendsChart">
                            <!-- Chart will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <h4>Candidate Sources</h4>
                        <div class="analytics-chart" id="candidateSourcesChart">
                            <!-- Chart will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <h4>Response Rates</h4>
                        <div class="analytics-chart" id="responseRatesChart">
                            <!-- Chart will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Community Pages
    async loadSocialCentre() {
        const content = document.getElementById('socialCentreContent');
        if (!content) return;

        content.innerHTML = `
            <div class="social-centre">
                <div class="social-header">
                    <h3>FreeJobWala Community</h3>
                    <p>Connect with other employers and share insights</p>
                </div>
                
                <div class="social-feed">
                    <div class="post-composer">
                        <textarea placeholder="Share an update with the community..." id="communityPost"></textarea>
                        <div class="composer-actions">
                            <button class="btn btn-primary" onclick="companyDashboard.postToCommunity()">
                                <i class="fas fa-paper-plane"></i> Post
                            </button>
                        </div>
                    </div>
                    
                    <div class="social-posts" id="socialPosts">
                        <!-- Community posts will be loaded here -->
                    </div>
                </div>
            </div>
        `;
    }

    async loadCommunityPosts() {
        const content = document.getElementById('communityPostsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="community-posts">
                <div class="posts-header">
                    <h3>Your Community Posts</h3>
                    <button class="btn btn-primary" onclick="companyDashboard.navigateToPage('social-centre')">
                        <i class="fas fa-plus"></i> Create New Post
                    </button>
                </div>
                
                <div class="posts-filters">
                    <select id="postStatusFilter" onchange="companyDashboard.filterCommunityPosts()">
                        <option value="">All Posts</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                    </select>
                </div>
                
                <div class="posts-list" id="communityPostsList">
                    <!-- Community posts will be loaded here -->
                </div>
            </div>
        `;
    }

    async loadFollowers() {
        const content = document.getElementById('followersContent');
        if (!content) return;

        content.innerHTML = `
            <div class="followers-management">
                <div class="followers-header">
                    <h3>Manage Your Followers</h3>
                    <div class="followers-stats">
                        <span class="follower-count" id="followerCount">0</span> followers
                    </div>
                </div>
                
                <div class="followers-filters">
                    <input type="text" id="followerSearch" placeholder="Search followers..." onkeyup="companyDashboard.searchFollowers()">
                    <select id="followerSort" onchange="companyDashboard.sortFollowers()">
                        <option value="recent">Recently Followed</option>
                        <option value="name">Name</option>
                        <option value="activity">Most Active</option>
                    </select>
                </div>
                
                <div class="followers-list" id="followersList">
                    <!-- Followers will be loaded here -->
                </div>
            </div>
        `;
    }

    async loadMessages() {
        const content = document.getElementById('messagesContent');
        if (!content) return;

        content.innerHTML = `
            <div class="messages-container">
                <div class="messages-header">
                    <h3>Messages</h3>
                    <button class="btn btn-primary" onclick="companyDashboard.composeMessage()">
                        <i class="fas fa-plus"></i> Compose
                    </button>
                </div>
                
                <div class="messages-layout">
                    <div class="messages-sidebar">
                        <div class="message-filters">
                            <button class="filter-btn active" data-filter="all">All</button>
                            <button class="filter-btn" data-filter="unread">Unread</button>
                            <button class="filter-btn" data-filter="candidates">Candidates</button>
                            <button class="filter-btn" data-filter="employers">Employers</button>
                        </div>
                        
                        <div class="conversations-list" id="conversationsList">
                            <!-- Conversations will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="messages-main">
                        <div class="message-view" id="messageView">
                            <div class="no-message-selected">
                                <i class="fas fa-comments"></i>
                                <p>Select a conversation to view messages</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadComments() {
        const content = document.getElementById('commentsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="comments-management">
                <div class="comments-header">
                    <h3>Comments on Your Posts</h3>
                    <div class="comments-stats">
                        <span class="comment-count" id="commentCount">0</span> total comments
                    </div>
                </div>
                
                <div class="comments-filters">
                    <select id="commentPostFilter" onchange="companyDashboard.filterComments()">
                        <option value="">All Posts</option>
                    </select>
                    <select id="commentStatusFilter" onchange="companyDashboard.filterComments()">
                        <option value="">All Comments</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                
                <div class="comments-list" id="commentsList">
                    <!-- Comments will be loaded here -->
                </div>
            </div>
        `;
    }

    // ===== DISPLAY METHODS =====

    displayManageJobs(jobs) {
        const grid = document.getElementById('manageJobsGrid');
        if (!grid) return;

        if (jobs.length === 0) {
            grid.innerHTML = '<div class="no-data">No jobs posted yet. <a href="#" onclick="companyDashboard.navigateToPage(\'post-job\')">Post your first job</a></div>';
            return;
        }

        grid.innerHTML = jobs.map(job => `
            <div class="job-card">
                <div class="job-header">
                    <h4>${job.title}</h4>
                    <span class="job-status ${job.status}">${job.status}</span>
                </div>
                <div class="job-details">
                    <p><i class="fas fa-building"></i> ${job.company?.name || 'Company'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${job.location?.city}, ${job.location?.state}</p>
                    <p><i class="fas fa-briefcase"></i> ${job.employmentType}</p>
                    <p><i class="fas fa-users"></i> ${job.applications?.length || 0} applications</p>
                </div>
                <div class="job-actions">
                    <button class="btn btn-sm btn-primary" onclick="companyDashboard.viewJob('${job._id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="companyDashboard.editJob('${job._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="companyDashboard.deleteJob('${job._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    displayDraftJobs(drafts) {
        const grid = document.getElementById('draftJobsGrid');
        if (!grid) return;

        if (drafts.length === 0) {
            grid.innerHTML = '<div class="no-data">No draft jobs. <a href="#" onclick="companyDashboard.navigateToPage(\'post-job\')">Create your first draft</a></div>';
            return;
        }

        grid.innerHTML = drafts.map(draft => `
            <div class="draft-card">
                <div class="draft-header">
                    <h4>${draft.title || 'Untitled Draft'}</h4>
                    <span class="draft-date">${this.formatTimeAgo(new Date(draft.updatedAt))}</span>
                </div>
                <div class="draft-preview">
                    <p>${draft.description?.substring(0, 100)}...</p>
                </div>
                <div class="draft-actions">
                    <button class="btn btn-sm btn-primary" onclick="companyDashboard.editDraft('${draft._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-success" onclick="companyDashboard.publishDraft('${draft._id}')">
                        <i class="fas fa-paper-plane"></i> Publish
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="companyDashboard.deleteDraft('${draft._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    displayJobResponses(responses) {
        const table = document.getElementById('responsesTable');
        if (!table) return;

        if (responses.length === 0) {
            table.innerHTML = '<div class="no-data">No job responses yet.</div>';
            return;
        }

        table.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Candidate</th>
                        <th>Job Title</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                        <th>Match Score</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${responses.map(response => `
                        <tr>
                            <td>
                                <div class="candidate-info">
                                    <strong>${response.fullName}</strong>
                                    <small>${response.email}</small>
                                </div>
                            </td>
                            <td>${response.job?.title || 'N/A'}</td>
                            <td>${this.formatTimeAgo(new Date(response.createdAt))}</td>
                            <td>
                                <span class="status-badge ${response.status}">${response.status}</span>
                            </td>
                            <td>
                                <div class="match-score">
                                    <div class="score-bar">
                                        <div class="score-fill" style="width: ${response.matchScore || 0}%"></div>
                                    </div>
                                    <span>${response.matchScore || 0}%</span>
                                </div>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="companyDashboard.viewResponse('${response._id}')">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button class="btn btn-sm btn-success" onclick="companyDashboard.shortlistResponse('${response._id}')">
                                    <i class="fas fa-check"></i> Shortlist
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // ===== UTILITY METHODS =====

    async saveDraft() {
        console.log('Saving job as draft...');
    }

    async searchResumes() {
        console.log('Searching resumes...');
    }

    async saveSearch() {
        console.log('Saving search...');
    }

    async advancedSearch() {
        console.log('Advanced search...');
    }

    async bulkActions() {
        console.log('Bulk actions...');
    }

    async filterMatchingCandidates() {
        console.log('Filtering matching candidates...');
    }

    async exportSavedCandidates() {
        console.log('Exporting saved candidates...');
    }

    async bulkInvite() {
        console.log('Bulk invite...');
    }

    async searchSavedCandidates() {
        console.log('Searching saved candidates...');
    }

    async sortSavedCandidates() {
        console.log('Sorting saved candidates...');
    }

    async showEmailInvite() {
        console.log('Showing email invite...');
    }

    async showJobLinks() {
        console.log('Showing job links...');
    }

    async showBulkInvite() {
        console.log('Showing bulk invite...');
    }

    async createNewSearch() {
        console.log('Creating new search...');
    }

    async updateAnalytics() {
        console.log('Updating analytics...');
    }

    async postToCommunity() {
        console.log('Posting to community...');
    }

    async filterCommunityPosts() {
        console.log('Filtering community posts...');
    }

    async searchFollowers() {
        console.log('Searching followers...');
    }

    async sortFollowers() {
        console.log('Sorting followers...');
    }

    async composeMessage() {
        console.log('Composing message...');
    }

    async filterComments() {
        console.log('Filtering comments...');
    }

    async editDraft(draftId) {
        console.log('Editing draft:', draftId);
    }

    async publishDraft(draftId) {
        console.log('Publishing draft:', draftId);
    }

    async deleteDraft(draftId) {
        console.log('Deleting draft:', draftId);
    }

    async viewResponse(responseId) {
        console.log('Viewing response:', responseId);
    }

    async shortlistResponse(responseId) {
        console.log('Shortlisting response:', responseId);
    }

    async deleteJob(jobId) {
        console.log('Deleting job:', jobId);
    }
}

// Initialize company dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.companyDashboard = new CompanyDashboard();
});
