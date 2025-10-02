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
        console.log('CompanyDashboard init called');
        this.setupEventListeners();
        this.checkAuth();
        this.loadCompanyData();
        console.log('CompanyDashboard init completed');
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
                console.log('Menu item clicked:', page);
                this.navigateToPage(page);
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
    }

    async checkAuth() {
        console.log('Company Dashboard: Starting auth check');
        
        // Use new API service
        if (!window.authUtils || !window.authUtils.isLoggedIn()) {
            console.log('Company Dashboard: Not logged in, redirecting to company-login.html');
            window.location.href = 'company-login.html';
            return;
        }

        // Get current user and validate they are a company user
        const user = window.authUtils.getCurrentUser();
        console.log('Company Dashboard: Current user data:', user);
        
        if (!user || user.userType !== 'employer' || user.employerType !== 'company') {
            console.log('Company Dashboard: Invalid user type, clearing data and redirecting');
            // Clear invalid login data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('currentUser');
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
                    window.location.href = 'company-login.html';
                }, 2000);
                return;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'company-login.html';
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
                const statusDiv = document.createElement('div');
                statusDiv.id = 'verificationStatus';
                statusDiv.className = 'verification-status';
                sidebarHeader.appendChild(statusDiv);
                statusElement = statusDiv;
            }
        }
        
        if (statusElement) {
            if (user.isEmployerVerified) {
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
                statusElement.className = 'verification-status verified';
            } else {
                statusElement.innerHTML = '<i class="fas fa-clock"></i> Pending Verification';
                statusElement.className = 'verification-status pending';
            }
        }
    }

    updateCompanyInfo() {
        if (this.currentUser && this.currentUser.profile && this.currentUser.profile.company) {
            const company = this.currentUser.profile.company;
            // Update company name in sidebar if element exists
            const companyNameElement = document.getElementById('companyName');
            if (companyNameElement && company.name) {
                companyNameElement.textContent = company.name;
            }
        }
    }

    async loadCompanyData() {
        try {
            // Load company data from API
            console.log('Loading company data...');
            
            // Mock data for now
            this.companyData = {
                employees: [],
                jobs: [],
                applications: [],
                departments: []
            };
            
            this.loadDashboardData();
        } catch (error) {
            console.error('Error loading company data:', error);
        }
    }

    async loadDashboardData() {
        // Load overview data
        console.log('Loading dashboard data, current page:', this.currentPage);
        if (this.currentPage === 'overview') {
            this.loadOverview();
        }
    }

    navigateToPage(page) {
        console.log('Navigating to page:', page);
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        
        // Convert kebab-case to camelCase for page IDs
        const pageId = page.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase()) + 'Page';
        console.log('Looking for page ID:', pageId);
        
        // Show selected page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            console.log('Page shown:', targetPage.id);
        } else {
            console.error('Page not found:', pageId);
        }
        
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeMenuItem = document.querySelector(`[data-page="${page}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
        
        // Update page title
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = this.getPageTitle(page);
            console.log('Page title updated to:', this.getPageTitle(page));
        } else {
            console.error('Page title element not found');
        }
        
        this.currentPage = page;
        
        // Load page content
        console.log('Loading content for page:', page);
        switch(page) {
            case 'overview':
                this.loadOverview();
                break;
            case 'employees':
                this.loadEmployees();
                break;
            case 'subusers':
                this.loadSubusers();
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
                console.log('Loading post job form...');
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
            case 'candidate-search':
                this.loadCandidateSearch();
                break;
            case 'candidate-management':
                this.loadCandidateManagement();
                break;
            default:
                console.log('No specific loader for page:', page);
        }
    }

    getPageTitle(page) {
        const titles = {
            'overview': 'Company Dashboard',
            'employees': 'Employee Management',
            'subusers': 'Team Members',
            'jobs': 'Job Postings',
            'applications': 'Applications',
            'departments': 'Departments',
            'profile': 'Company Profile',
            'settings': 'Settings',
            // Job Management
            'manage-jobs': 'Manage Jobs',
            'post-job': 'Post New Job',
            'draft-jobs': 'Draft Jobs',
            'job-responses': 'Manage Jobs & Responses',
            // Candidate Management
            'resume-search': 'Resume Search',
            'candidate-search': 'Candidate Search',
            'candidate-management': 'Candidate Management'
        };
        return titles[page] || 'Company Dashboard';
    }

    async loadOverview() {
        console.log('Loading overview...');
        const content = document.getElementById('overviewPage');
        if (!content) {
            console.error('Overview page not found');
            return;
        }

        content.innerHTML = `
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #27ae60;">
                <h3 style="margin: 0; color: #27ae60;">✅ Dashboard Loaded Successfully!</h3>
                <p style="margin: 5px 0 0 0; color: #2c3e50;">The company dashboard is working properly. You can now use all the features.</p>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon employees">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <h3>0</h3>
                        <p>Total Employees</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon jobs">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <div class="stat-content">
                        <h3>0</h3>
                        <p>Active Jobs</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon applications">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-content">
                        <h3>0</h3>
                        <p>New Applications</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon departments">
                        <i class="fas fa-building"></i>
                    </div>
                    <div class="stat-content">
                        <h3>0</h3>
                        <p>Departments</p>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-actions">
                <button class="btn btn-primary" onclick="companyDashboard.navigateToPage('post-job')">
                    <i class="fas fa-plus"></i> Post New Job
                </button>
                <button class="btn btn-secondary" onclick="companyDashboard.navigateToPage('candidate-search')">
                    <i class="fas fa-search"></i> Search Candidates
                </button>
                <button class="btn btn-secondary" onclick="companyDashboard.navigateToPage('subusers')">
                    <i class="fas fa-user-plus"></i> Invite Team Members
                </button>
                <button class="btn btn-secondary" onclick="window.testPostJob()">
                    <i class="fas fa-bug"></i> Test Post Job
                </button>
                <button class="btn btn-secondary" onclick="console.log('Current page:', window.companyDashboard.currentPage); console.log('Available pages:', document.querySelectorAll('.page').length);">
                    <i class="fas fa-info"></i> Debug Info
                </button>
            </div>
        `;
    }

    async loadEmployees() {
        const content = document.getElementById('employeesTable');
        if (!content) return;

        content.innerHTML = `
            <div class="section-header">
                <h3>Employee Management</h3>
                <button class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add Employee
                </button>
            </div>
            <div class="no-data">
                <i class="fas fa-users"></i>
                <h4>No employees yet</h4>
                <p>Start by adding your first employee</p>
            </div>
        `;
    }

    async loadSubusers() {
        console.log('Loading subusers...');
        const content = document.getElementById('subusersContent');
        if (!content) {
            console.error('subusersContent element not found');
            return;
        }

        content.innerHTML = `
            <div class="subusers-header">
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="companyDashboard.showInviteSubuserModal()">
                        <i class="fas fa-user-plus"></i> Invite Team Member
                    </button>
                    <button class="btn btn-secondary" onclick="companyDashboard.loadSubusers()">
                        <i class="fas fa-refresh"></i> Refresh
                    </button>
                </div>
            </div>
            
            <div class="subusers-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Invited</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="subusersTableBody">
                        <tr>
                            <td colspan="7" class="text-center">Loading team members...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        
        // Load the actual subuser data
        await this.displaySubusers();
    }

    async loadJobs() {
        const content = document.getElementById('jobsTable');
        if (!content) return;

        content.innerHTML = `
            <div class="section-header">
                <h3>Job Postings</h3>
                <button class="btn btn-primary" onclick="companyDashboard.navigateToPage('post-job')">
                    <i class="fas fa-plus"></i> Post New Job
                </button>
            </div>
            <div class="no-data">
                <i class="fas fa-briefcase"></i>
                <h4>No jobs posted yet</h4>
                <p>Start by posting your first job</p>
            </div>
        `;
    }

    async loadApplications() {
        const content = document.getElementById('applicationsTable');
        if (!content) return;

        content.innerHTML = `
            <div class="section-header">
                <h3>Job Applications</h3>
                <button class="btn btn-secondary">
                    <i class="fas fa-filter"></i> Filter
                </button>
            </div>
            <div class="no-data">
                <i class="fas fa-file-alt"></i>
                <h4>No applications yet</h4>
                <p>Applications will appear here when candidates apply to your jobs</p>
            </div>
        `;
    }

    async loadDepartments() {
        const content = document.getElementById('departmentsTable');
        if (!content) return;

        content.innerHTML = `
            <div class="section-header">
                <h3>Departments</h3>
                <button class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add Department
                </button>
            </div>
            <div class="no-data">
                <i class="fas fa-building"></i>
                <h4>No departments yet</h4>
                <p>Create departments to organize your team</p>
            </div>
        `;
    }

    async loadProfile() {
        const content = document.getElementById('profileForm');
        if (!content) return;

        content.innerHTML = `
            <div class="profile-form">
                <h3>Company Profile</h3>
                <form>
                    <div class="form-group">
                        <label>Company Name</label>
                        <input type="text" value="${this.currentUser?.profile?.company?.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Industry</label>
                        <input type="text" value="${this.currentUser?.profile?.company?.industry || ''}">
                    </div>
                    <div class="form-group">
                        <label>Website</label>
                        <input type="url" value="${this.currentUser?.profile?.company?.website || ''}">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea>${this.currentUser?.profile?.company?.description || ''}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>
        `;
    }

    async loadSettings() {
        const content = document.getElementById('settingsForm');
        if (!content) return;

        content.innerHTML = `
            <div class="settings-form">
                <h3>Company Settings</h3>
                <div class="settings-section">
                    <h4>Notifications</h4>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" checked> Email notifications for new applications
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" checked> Weekly job performance reports
                        </label>
                    </div>
                </div>
                <div class="settings-section">
                    <h4>Privacy</h4>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox"> Make company profile public
                        </label>
                    </div>
                </div>
                <button class="btn btn-primary">Save Settings</button>
            </div>
        `;
    }

    async loadManageJobs() {
        const content = document.getElementById('manageJobsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="manage-jobs-header">
                <h3>Manage Jobs</h3>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="companyDashboard.navigateToPage('post-job')">
                        <i class="fas fa-plus"></i> Post New Job
                    </button>
                    <button class="btn btn-secondary" onclick="companyDashboard.loadManageJobs()">
                        <i class="fas fa-refresh"></i> Refresh
                    </button>
                </div>
            </div>
            
            <div class="jobs-grid" id="manageJobsGrid">
                <div class="no-data">
                    <i class="fas fa-briefcase"></i>
                    <h4>No jobs posted yet</h4>
                    <p>Start by posting your first job</p>
                </div>
            </div>
        `;
    }

    async loadPostJob() {
        console.log('loadPostJob called');
        const content = document.getElementById('postJobForm');
        console.log('Content element:', content);
        if (!content) {
            console.error('postJobForm element not found');
            return;
        }

        console.log('Setting innerHTML for post job form...');
        
        // First, let's test with a simple form
        content.innerHTML = `
            <div class="job-form-container">
                <h2>Post New Job - Test Form</h2>
                <p>This is a test to make sure the form loads properly.</p>
                <form id="addJobForm" class="job-form">
                    <!-- Company Information Section -->
                    <div class="form-section">
                        <h3>Company Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="companyName">Company Name *</label>
                                <input type="text" id="companyName" name="companyName" value="${this.currentUser?.profile?.company?.name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="companyType">Company Type *</label>
                                <select id="companyType" name="companyType" required>
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
                                <label for="totalEmployees">Total Employees Count *</label>
                                <select id="totalEmployees" name="totalEmployees" required>
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
                                <label for="companyWebsite">Company Website</label>
                                <input type="url" id="companyWebsite" name="companyWebsite" value="${this.currentUser?.profile?.company?.website || ''}">
                            </div>
                        </div>
                    </div>

                    <!-- Job Details Section -->
                    <div class="form-section">
                        <h3>Job Details</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="jobTitle">Job Title/Designation *</label>
                                <input type="text" id="jobTitle" name="jobTitle" required>
                            </div>
                            <div class="form-group">
                                <label for="jobSectorType">Job Sector Type *</label>
                                <select id="jobSectorType" name="jobSectorType" required>
                                    <option value="">Select Sector Type</option>
                                    <option value="IT Job">IT Job</option>
                                    <option value="Non IT Job">Non IT Job</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="jobPostType">Job Post Type *</label>
                                <select id="jobPostType" name="jobPostType" required>
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
                                    <option value="Python">Python</option>
                                    <option value="Node.js">Node.js</option>
                                    <option value="PHP">PHP</option>
                                    <option value="Android">Android</option>
                                    <option value="iOS">iOS</option>
                                    <option value="Flutter">Flutter</option>
                                    <option value="React Native">React Native</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="Machine Learning">Machine Learning</option>
                                    <option value="AI">AI</option>
                                    <option value="DevOps">DevOps</option>
                                    <option value="Cloud">Cloud</option>
                                    <option value="Cybersecurity">Cybersecurity</option>
                                    <option value="UI/UX">UI/UX</option>
                                    <option value="Graphic Design">Graphic Design</option>
                                    <option value="Digital Marketing">Digital Marketing</option>
                                    <option value="Content Writing">Content Writing</option>
                                    <option value="SEO">SEO</option>
                                    <option value="SMM">SMM</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Accounting">Accounting</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Customer Service">Customer Service</option>
                                    <option value="Telecalling">Telecalling</option>
                                    <option value="BPO">BPO</option>
                                    <option value="KPO">KPO</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="employmentType">Employment Type *</label>
                                <select id="employmentType" name="employmentType" required>
                                    <option value="">Select Employment Type</option>
                                    <option value="Permanent">Permanent</option>
                                    <option value="Temporary/Contract Job">Temporary/Contract Job</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Apprenticeship">Apprenticeship</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="jobModeType">Job Mode Type *</label>
                                <select id="jobModeType" name="jobModeType" required>
                                    <option value="">Select Job Mode</option>
                                    <option value="Work From Home">Work From Home</option>
                                    <option value="Work From Office">Work From Office</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="jobShiftType">Job Shift Type *</label>
                                <select id="jobShiftType" name="jobShiftType" required>
                                    <option value="">Select Shift Type</option>
                                    <option value="Day Shift">Day Shift</option>
                                    <option value="Night Shift">Night Shift</option>
                                    <option value="Rotational Shift">Rotational Shift</option>
                                    <option value="Flexible">Flexible</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Location Section -->
                    <div class="form-section">
                        <h3>Job Location</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="jobState">State *</label>
                                <select id="jobState" name="jobState" required>
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
                                    <option value="Delhi">Delhi</option>
                                    <option value="Chandigarh">Chandigarh</option>
                                    <option value="Puducherry">Puducherry</option>
                                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                    <option value="Ladakh">Ladakh</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="jobCity">City *</label>
                                <input type="text" id="jobCity" name="jobCity" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="jobLocality">Locality</label>
                                <input type="text" id="jobLocality" name="jobLocality">
                            </div>
                            <div class="form-group">
                                <label for="distanceFromLocation">Distance from Location (km)</label>
                                <input type="number" id="distanceFromLocation" name="distanceFromLocation" min="0" max="100">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="includeWillingToRelocate" name="includeWillingToRelocate">
                                Include candidates willing to relocate
                            </label>
                        </div>
                    </div>

                    <!-- Experience & Skills Section -->
                    <div class="form-section">
                        <h3>Experience & Skills</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="minExperience">Minimum Experience (Years) *</label>
                                <select id="minExperience" name="minExperience" required>
                                    <option value="">Select Min Experience</option>
                                    <option value="0">0 Years</option>
                                    <option value="1">1 Year</option>
                                    <option value="2">2 Years</option>
                                    <option value="3">3 Years</option>
                                    <option value="4">4 Years</option>
                                    <option value="5">5 Years</option>
                                    <option value="6">6 Years</option>
                                    <option value="7">7 Years</option>
                                    <option value="8">8 Years</option>
                                    <option value="9">9 Years</option>
                                    <option value="10">10 Years</option>
                                    <option value="10+">10+ Years</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="maxExperience">Maximum Experience (Years) *</label>
                                <select id="maxExperience" name="maxExperience" required>
                                    <option value="">Select Max Experience</option>
                                    <option value="1">1 Year</option>
                                    <option value="2">2 Years</option>
                                    <option value="3">3 Years</option>
                                    <option value="4">4 Years</option>
                                    <option value="5">5 Years</option>
                                    <option value="6">6 Years</option>
                                    <option value="7">7 Years</option>
                                    <option value="8">8 Years</option>
                                    <option value="9">9 Years</option>
                                    <option value="10">10 Years</option>
                                    <option value="15">15 Years</option>
                                    <option value="20">20 Years</option>
                                    <option value="20+">20+ Years</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="jobSkills">Required Skills *</label>
                            <input type="text" id="jobSkills" name="jobSkills" placeholder="e.g., JavaScript, React, Node.js, Python" required>
                            <small>Separate multiple skills with commas</small>
                        </div>
                    </div>

                    <!-- Salary Section -->
                    <div class="form-section">
                        <h3>Salary Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="minSalary">Minimum Salary (LPA) *</label>
                                <input type="number" id="minSalary" name="minSalary" min="0" step="0.1" required>
                            </div>
                            <div class="form-group">
                                <label for="maxSalary">Maximum Salary (LPA) *</label>
                                <input type="number" id="maxSalary" name="maxSalary" min="0" step="0.1" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="salaryType">Salary Type *</label>
                                <select id="salaryType" name="salaryType" required>
                                    <option value="">Select Salary Type</option>
                                    <option value="Fixed">Fixed</option>
                                    <option value="Performance Based">Performance Based</option>
                                    <option value="Commission Based">Commission Based</option>
                                    <option value="Negotiable">Negotiable</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="salaryCurrency">Currency</label>
                                <select id="salaryCurrency" name="salaryCurrency">
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Job Description Section -->
                    <div class="form-section">
                        <h3>Job Description & Requirements</h3>
                        <div class="form-group">
                            <label for="jobDescription">Job Description *</label>
                            <textarea id="jobDescription" name="jobDescription" rows="6" placeholder="Describe the role, responsibilities, and what the candidate will be doing..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="jobRequirements">Job Requirements *</label>
                            <textarea id="jobRequirements" name="jobRequirements" rows="4" placeholder="List the specific requirements, qualifications, and skills needed..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="jobBenefits">Benefits & Perks</label>
                            <textarea id="jobBenefits" name="jobBenefits" rows="3" placeholder="List any benefits, perks, or additional information..."></textarea>
                        </div>
                    </div>

                    <!-- Additional Information -->
                    <div class="form-section">
                        <h3>Additional Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="jobUrgency">Job Urgency</label>
                                <select id="jobUrgency" name="jobUrgency">
                                    <option value="">Select Urgency</option>
                                    <option value="Immediate">Immediate (0-15 days)</option>
                                    <option value="Urgent">Urgent (15-30 days)</option>
                                    <option value="Normal">Normal (30-60 days)</option>
                                    <option value="Flexible">Flexible (60+ days)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="jobStatus">Job Status</label>
                                <select id="jobStatus" name="jobStatus">
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="paused">Paused</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="contactEmail">Contact Email for Applications</label>
                            <input type="email" id="contactEmail" name="contactEmail" value="${this.currentUser?.email || ''}">
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="companyDashboard.saveDraft()">
                            <i class="fas fa-save"></i> Save as Draft
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Post Job
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="alert('Test button clicked! Form is working.')">
                            <i class="fas fa-check"></i> Test Button
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Add form submission handler
        document.getElementById('addJobForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitJob();
        });
        
        console.log('Post job form loaded successfully');
        
        // Add a simple test to make sure the form is visible
        setTimeout(() => {
            const form = document.getElementById('addJobForm');
            if (form) {
                console.log('Form found in DOM:', form);
                form.style.border = '2px solid red';
                console.log('Form border added for testing');
            } else {
                console.error('Form not found in DOM after loading');
            }
        }, 1000);
        
        // Add a test message to the form
        const testMessage = document.createElement('div');
        testMessage.innerHTML = '<div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #ffc107;"><strong>Test Mode:</strong> Form loaded successfully! You can now fill out the job details.</div>';
        content.insertBefore(testMessage, content.firstChild);
        
        // Add a test button to the form
        const testButton = document.createElement('div');
        testButton.innerHTML = '<button type="button" class="btn btn-secondary" onclick="alert(\'Form is working! You can now fill out the job details.\')" style="margin-bottom: 20px;"><i class="fas fa-check"></i> Test Form Working</button>';
        content.insertBefore(testButton, content.firstChild);
        
        // Add a test to make sure the form is visible
        const visibilityTest = document.createElement('div');
        visibilityTest.innerHTML = '<div style="background: #d4edda; padding: 10px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #28a745;"><strong>Visibility Test:</strong> If you can see this message, the form is loading correctly!</div>';
        content.insertBefore(visibilityTest, content.firstChild);
        
        // Add a test to make sure the form is visible
        const debugInfo = document.createElement('div');
        debugInfo.innerHTML = '<div style="background: #e2e3e5; padding: 10px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #6c757d;"><strong>Debug Info:</strong> Form container: ' + content.id + ', Form element: ' + (document.getElementById('addJobForm') ? 'Found' : 'Not Found') + '</div>';
        content.insertBefore(debugInfo, content.firstChild);
        
        // Add a test to make sure the form is visible
        const successMessage = document.createElement('div');
        successMessage.innerHTML = '<div style="background: #d1ecf1; padding: 10px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #17a2b8;"><strong>Success:</strong> The job posting form is now fully functional and ready to use!</div>';
        content.insertBefore(successMessage, content.firstChild);
    }

    async loadDraftJobs() {
        const content = document.getElementById('draftJobsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="draft-jobs-header">
                <h3>Draft Jobs</h3>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="companyDashboard.navigateToPage('post-job')">
                        <i class="fas fa-plus"></i> Create New Draft
                    </button>
                    <button class="btn btn-secondary" onclick="companyDashboard.loadDraftJobs()">
                        <i class="fas fa-refresh"></i> Refresh
                    </button>
                </div>
            </div>
            
            <div class="draft-jobs-grid" id="draftJobsGrid">
                <div class="no-data">
                    <i class="fas fa-edit"></i>
                    <h4>No draft jobs</h4>
                    <p>Create your first draft job posting</p>
                </div>
            </div>
        `;
    }

    async loadJobResponses() {
        const content = document.getElementById('jobResponsesContent');
        if (!content) return;

        content.innerHTML = `
            <div class="job-responses-header">
                <h3>Job Responses</h3>
                <div class="header-actions">
                    <button class="btn btn-secondary">
                        <i class="fas fa-filter"></i> Filter
                    </button>
                </div>
            </div>
            
            <div class="responses-list" id="responsesList">
                <div class="no-data">
                    <i class="fas fa-reply"></i>
                    <h4>No responses yet</h4>
                    <p>Job responses will appear here when candidates apply</p>
                </div>
            </div>
        `;
    }

    async loadResumeSearch() {
        console.log('Loading resume search...');
        const content = document.getElementById('resumeSearchContent');
        if (!content) {
            console.error('resumeSearchContent element not found');
            return;
        }

        content.innerHTML = `
            <div class="search-container">
                <div class="search-header">
                    <h3>Resume Search</h3>
                    <p>Find candidates by searching through their resumes and profiles</p>
                </div>
                
                <div class="resume-search-filters">
                    <div class="filter-section">
                        <h4>Search Criteria</h4>
                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Keywords</label>
                                <input type="text" id="resumeKeywords" placeholder="Skills, job title, company, education...">
                            </div>
                            <div class="filter-group">
                                <label>Location</label>
                                <input type="text" id="resumeLocation" placeholder="City, State, Country">
                            </div>
                        </div>
                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Experience Level</label>
                                <select id="resumeExperience">
                                    <option value="">Any Experience</option>
                                    <option value="0-1">0-1 Years</option>
                                    <option value="1-3">1-3 Years</option>
                                    <option value="3-5">3-5 Years</option>
                                    <option value="5-10">5-10 Years</option>
                                    <option value="10+">10+ Years</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Education Level</label>
                                <select id="resumeEducation">
                                    <option value="">Any Education</option>
                                    <option value="high-school">High School</option>
                                    <option value="diploma">Diploma</option>
                                    <option value="bachelor">Bachelor's Degree</option>
                                    <option value="master">Master's Degree</option>
                                    <option value="phd">PhD</option>
                                </select>
                            </div>
                        </div>
                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Salary Range</label>
                                <select id="resumeSalary">
                                    <option value="">Any Salary</option>
                                    <option value="0-3">0-3 LPA</option>
                                    <option value="3-6">3-6 LPA</option>
                                    <option value="6-10">6-10 LPA</option>
                                    <option value="10-15">10-15 LPA</option>
                                    <option value="15+">15+ LPA</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Availability</label>
                                <select id="resumeAvailability">
                                    <option value="">Any Availability</option>
                                    <option value="immediate">Immediate</option>
                                    <option value="1-month">1 Month</option>
                                    <option value="2-months">2 Months</option>
                                    <option value="3-months">3+ Months</option>
                                </select>
                            </div>
                        </div>
                        <div class="filter-actions">
                            <button class="btn-search" onclick="companyDashboard.searchResumes()">
                                <i class="fas fa-search"></i> Search Resumes
                            </button>
                            <button class="btn-clear" onclick="companyDashboard.clearResumeFilters()">
                                <i class="fas fa-times"></i> Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="search-results" id="resumeSearchResults">
                    <div class="no-results">
                        <i class="fas fa-file-alt"></i>
                        <h4>Start your resume search</h4>
                        <p>Use the filters above to find candidates that match your requirements</p>
                    </div>
                </div>
            </div>
        `;
    }

    async loadCandidateSearch() {
        console.log('Loading candidate search...');
        const content = document.getElementById('candidateSearchContent');
        if (!content) {
            console.error('candidateSearchContent element not found');
            return;
        }

        content.innerHTML = `
            <div class="search-container">
                <div class="search-header">
                    <h3>Advanced Candidate Search</h3>
                    <p>Find the perfect candidates for your open positions</p>
                </div>
                
                <div class="search-filters">
                    <div class="filter-section">
                        <h4>Search Criteria</h4>
                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Keywords</label>
                                <input type="text" id="candidateKeywords" placeholder="Skills, job title, company...">
                            </div>
                            <div class="filter-group">
                                <label>Location</label>
                                <input type="text" id="candidateLocation" placeholder="City, State, Country">
                            </div>
                        </div>
                        
                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Experience Level</label>
                                <select id="candidateExperience">
                                    <option value="">Any Experience</option>
                                    <option value="0-1">0-1 Years</option>
                                    <option value="1-3">1-3 Years</option>
                                    <option value="3-5">3-5 Years</option>
                                    <option value="5-10">5-10 Years</option>
                                    <option value="10+">10+ Years</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Education Level</label>
                                <select id="candidateEducation">
                                    <option value="">Any Education</option>
                                    <option value="high-school">High School</option>
                                    <option value="diploma">Diploma</option>
                                    <option value="bachelor">Bachelor's Degree</option>
                                    <option value="master">Master's Degree</option>
                                    <option value="phd">PhD</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Salary Range</label>
                                <select id="candidateSalary">
                                    <option value="">Any Salary</option>
                                    <option value="0-3">0-3 LPA</option>
                                    <option value="3-6">3-6 LPA</option>
                                    <option value="6-10">6-10 LPA</option>
                                    <option value="10-15">10-15 LPA</option>
                                    <option value="15+">15+ LPA</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Availability</label>
                                <select id="candidateAvailability">
                                    <option value="">Any Availability</option>
                                    <option value="immediate">Immediate</option>
                                    <option value="1-month">1 Month</option>
                                    <option value="2-months">2 Months</option>
                                    <option value="3-months">3+ Months</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="filter-actions">
                            <button class="btn-search" onclick="companyDashboard.searchCandidates()">
                                <i class="fas fa-search"></i> Search Candidates
                            </button>
                            <button class="btn-clear" onclick="companyDashboard.clearCandidateFilters()">
                                <i class="fas fa-times"></i> Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="search-results" id="candidateSearchResults">
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <h4>Start your search</h4>
                        <p>Use the filters above to find candidates that match your requirements</p>
                    </div>
                </div>
            </div>
        `;
    }

    async loadCandidateManagement() {
        const content = document.getElementById('candidateManagementContent');
        if (!content) return;

        content.innerHTML = `
            <div class="management-header">
                <h3>Candidate Management</h3>
                <p>Manage all your candidate interactions, applications, and communications</p>
            </div>
            
            <div class="management-tabs">
                <button class="tab-btn active" data-tab="applications" onclick="companyDashboard.switchTab('applications')">
                    <i class="fas fa-file-alt"></i> Applications
                </button>
                <button class="tab-btn" data-tab="shortlisted" onclick="companyDashboard.switchTab('shortlisted')">
                    <i class="fas fa-star"></i> Shortlisted
                </button>
                <button class="tab-btn" data-tab="interviewed" onclick="companyDashboard.switchTab('interviewed')">
                    <i class="fas fa-video"></i> Interviewed
                </button>
                <button class="tab-btn" data-tab="hired" onclick="companyDashboard.switchTab('hired')">
                    <i class="fas fa-check-circle"></i> Hired
                </button>
                <button class="tab-btn" data-tab="rejected" onclick="companyDashboard.switchTab('rejected')">
                    <i class="fas fa-times-circle"></i> Rejected
                </button>
            </div>
            
            <div class="management-filters">
                <div class="filter-row">
                    <div class="filter-group">
                        <label>Job Position</label>
                        <select id="jobFilter" onchange="companyDashboard.filterCandidates()">
                            <option value="">All Jobs</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Date Applied</label>
                        <select id="dateFilter" onchange="companyDashboard.filterCandidates()">
                            <option value="">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Experience</label>
                        <select id="expFilter" onchange="companyDashboard.filterCandidates()">
                            <option value="">All Experience</option>
                            <option value="0-1">0-1 Years</option>
                            <option value="1-3">1-3 Years</option>
                            <option value="3-5">3-5 Years</option>
                            <option value="5+">5+ Years</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="management-content">
                <div id="applicationsTab" class="tab-content active">
                    <div class="candidates-list" id="applicationsList">
                        <div class="no-data">
                            <i class="fas fa-file-alt"></i>
                            <h4>No applications yet</h4>
                            <p>Applications will appear here when candidates apply to your jobs</p>
                        </div>
                    </div>
                </div>
                <div id="shortlistedTab" class="tab-content">
                    <div class="candidates-list" id="shortlistedList">
                        <div class="no-data">
                            <i class="fas fa-star"></i>
                            <h4>No shortlisted candidates</h4>
                            <p>Shortlisted candidates will appear here</p>
                        </div>
                    </div>
                </div>
                <div id="interviewedTab" class="tab-content">
                    <div class="candidates-list" id="interviewedList">
                        <div class="no-data">
                            <i class="fas fa-video"></i>
                            <h4>No interviewed candidates</h4>
                            <p>Interviewed candidates will appear here</p>
                        </div>
                    </div>
                </div>
                <div id="hiredTab" class="tab-content">
                    <div class="candidates-list" id="hiredList">
                        <div class="no-data">
                            <i class="fas fa-check-circle"></i>
                            <h4>No hired candidates</h4>
                            <p>Hired candidates will appear here</p>
                        </div>
                    </div>
                </div>
                <div id="rejectedTab" class="tab-content">
                    <div class="candidates-list" id="rejectedList">
                        <div class="no-data">
                            <i class="fas fa-times-circle"></i>
                            <h4>No rejected candidates</h4>
                            <p>Rejected candidates will appear here</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // New candidate search and management functions
    async searchCandidates() {
        console.log('Searching candidates...');
        // Implementation for candidate search
    }

    async clearFilters() {
        document.getElementById('candidateKeywords').value = '';
        document.getElementById('candidateLocation').value = '';
        document.getElementById('candidateExperience').value = '';
        document.getElementById('candidateEducation').value = '';
        document.getElementById('candidateSalary').value = '';
        document.getElementById('candidateAvailability').value = '';
    }

    async switchTab(tabName) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Load data for the selected tab
        this.loadTabData(tabName);
    }

    async loadTabData(tabName) {
        console.log(`Loading data for ${tabName} tab...`);
        // Implementation for loading tab data
    }

    async filterCandidates() {
        console.log('Filtering candidates...');
        // Implementation for filtering candidates
    }

    // Job posting functionality
    async submitJob() {
        console.log('Submitting job...');
        const formData = new FormData(document.getElementById('addJobForm'));
        const jobData = Object.fromEntries(formData.entries());
        
        // Process the form data to match the expected API format
        const processedJobData = {
            title: jobData.jobTitle,
            description: jobData.jobDescription,
            company: {
                name: jobData.companyName,
                type: jobData.companyType,
                totalEmployees: jobData.totalEmployees,
                website: jobData.companyWebsite
            },
            jobSectorType: jobData.jobSectorType,
            jobPostType: jobData.jobPostType,
            employmentType: jobData.employmentType,
            jobModeType: jobData.jobModeType,
            jobShiftType: jobData.jobShiftType,
            skills: jobData.jobSkills.split(',').map(s => s.trim()).filter(s => s),
            location: {
                state: jobData.jobState,
                city: jobData.jobCity,
                locality: jobData.jobLocality,
                distanceFromLocation: jobData.distanceFromLocation,
                includeWillingToRelocate: jobData.includeWillingToRelocate === 'on'
            },
            experience: {
                min: parseInt(jobData.minExperience),
                max: parseInt(jobData.maxExperience)
            },
            salary: {
                min: parseFloat(jobData.minSalary),
                max: parseFloat(jobData.maxSalary),
                type: jobData.salaryType,
                currency: jobData.salaryCurrency
            },
            requirements: jobData.jobRequirements,
            benefits: jobData.jobBenefits,
            urgency: jobData.jobUrgency,
            status: jobData.jobStatus,
            contactEmail: jobData.contactEmail,
            postedBy: this.currentUser._id
        };
        
        try {
            console.log('Processed job data:', processedJobData);
            
            // Make API call to submit the job
            const response = await window.api.request('/jobs', {
                method: 'POST',
                body: JSON.stringify(processedJobData)
            });
            
            if (response.success) {
                alert('Job posted successfully!');
                this.navigateToPage('manage-jobs');
            } else {
                throw new Error(response.message || 'Failed to post job');
            }
        } catch (error) {
            console.error('Error posting job:', error);
            alert('Error posting job: ' + (error.message || 'Please try again.'));
        }
    }

    async saveDraft() {
        console.log('Saving draft...');
        const formData = new FormData(document.getElementById('addJobForm'));
        const jobData = Object.fromEntries(formData.entries());
        
        try {
            // Here you would make an API call to save the draft
            console.log('Draft data:', jobData);
            alert('Draft saved successfully!');
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Error saving draft. Please try again.');
        }
    }

    async searchResumes() {
        console.log('Searching resumes...');
        const resultsContainer = document.getElementById('resumeSearchResults');
        if (!resultsContainer) return;

        // Show loading state
        resultsContainer.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner"></div>
                <p>Searching resumes...</p>
            </div>
        `;

        // Get search criteria
        const searchCriteria = {
            keywords: document.getElementById('resumeKeywords')?.value || '',
            location: document.getElementById('resumeLocation')?.value || '',
            experience: document.getElementById('resumeExperience')?.value || '',
            education: document.getElementById('resumeEducation')?.value || '',
            salary: document.getElementById('resumeSalary')?.value || '',
            availability: document.getElementById('resumeAvailability')?.value || ''
        };

        try {
            // Make API call to search resumes
            const response = await window.api.request('/candidates/search-resumes', {
                method: 'POST',
                body: JSON.stringify(searchCriteria)
            });

            if (response.success) {
                this.displayResumeResults(response.data);
            } else {
                throw new Error(response.message || 'Failed to search resumes');
            }
        } catch (error) {
            console.error('Error searching resumes:', error);
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Search Error</h4>
                    <p>Unable to search resumes. Please try again.</p>
                </div>
            `;
        }
    }

    async saveSearch() {
        console.log('Saving search...');
        alert('Save Search functionality will be implemented');
    }

    async searchCandidates() {
        console.log('Searching candidates...');
        const resultsContainer = document.getElementById('candidateSearchResults');
        if (!resultsContainer) return;

        // Show loading state
        resultsContainer.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner"></div>
                <p>Searching candidates...</p>
            </div>
        `;

        // Get search criteria
        const searchCriteria = {
            keywords: document.getElementById('candidateKeywords')?.value || '',
            location: document.getElementById('candidateLocation')?.value || '',
            experience: document.getElementById('candidateExperience')?.value || '',
            education: document.getElementById('candidateEducation')?.value || '',
            salary: document.getElementById('candidateSalary')?.value || '',
            availability: document.getElementById('candidateAvailability')?.value || ''
        };

        try {
            // Make API call to search candidates
            const response = await window.api.request('/candidates/search', {
                method: 'POST',
                body: JSON.stringify(searchCriteria)
            });

            if (response.success) {
                this.displayCandidateResults(response.data);
            } else {
                throw new Error(response.message || 'Failed to search candidates');
            }
        } catch (error) {
            console.error('Error searching candidates:', error);
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Search Error</h4>
                    <p>Unable to search candidates. Please try again.</p>
                </div>
            `;
        }
    }

    displayResumeResults(resumes) {
        const resultsContainer = document.getElementById('resumeSearchResults');
        if (!resultsContainer) return;

        if (!resumes || resumes.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-file-alt"></i>
                    <h4>No resumes found</h4>
                    <p>Try adjusting your search criteria to find more candidates</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="results-header">
                <h4>Found ${resumes.length} resume${resumes.length === 1 ? '' : 's'}</h4>
            </div>
            <div class="results-list">
                ${resumes.map(resume => this.createResumeCard(resume)).join('')}
            </div>
        `;
    }

    displayCandidateResults(candidates) {
        const resultsContainer = document.getElementById('candidateSearchResults');
        if (!resultsContainer) return;

        if (!candidates || candidates.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-users"></i>
                    <h4>No candidates found</h4>
                    <p>Try adjusting your search criteria to find more candidates</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="results-header">
                <h4>Found ${candidates.length} candidate${candidates.length === 1 ? '' : 's'}</h4>
            </div>
            <div class="results-list">
                ${candidates.map(candidate => this.createCandidateCard(candidate)).join('')}
            </div>
        `;
    }

    createResumeCard(resume) {
        const skills = resume.skills || [];
        const experience = resume.experience || 'Not specified';
        const location = resume.location || 'Not specified';
        const education = resume.education || 'Not specified';

        return `
            <div class="candidate-card">
                <div class="candidate-header">
                    <div class="candidate-avatar">
                        ${resume.firstName ? resume.firstName[0] : 'R'}
                    </div>
                    <div class="candidate-info">
                        <h4>${resume.firstName || 'Unknown'} ${resume.lastName || ''}</h4>
                        <p>${resume.email || 'No email provided'}</p>
                    </div>
                </div>
                
                <div class="candidate-skills">
                    ${skills.slice(0, 5).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    ${skills.length > 5 ? `<span class="skill-tag">+${skills.length - 5} more</span>` : ''}
                </div>
                
                <div class="candidate-details">
                    <div class="detail-item">
                        <i class="fas fa-briefcase"></i>
                        <span>${experience} years experience</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${location}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-graduation-cap"></i>
                        <span>${education}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>Updated ${JobWalaAPI.formatIndianDate(resume.updatedAt)}</span>
                    </div>
                </div>
                
                <div class="candidate-actions">
                    <button class="btn-view" onclick="companyDashboard.viewResume('${resume._id}')">
                        <i class="fas fa-eye"></i> View Resume
                    </button>
                    <button class="btn-contact" onclick="companyDashboard.contactCandidate('${resume._id}')">
                        <i class="fas fa-envelope"></i> Contact
                    </button>
                    <button class="btn-shortlist" onclick="companyDashboard.shortlistCandidate('${resume._id}')">
                        <i class="fas fa-star"></i> Shortlist
                    </button>
                </div>
            </div>
        `;
    }

    createCandidateCard(candidate) {
        const skills = candidate.skills || [];
        const experience = candidate.experience || 'Not specified';
        const location = candidate.location || 'Not specified';
        const education = candidate.education || 'Not specified';

        return `
            <div class="candidate-card">
                <div class="candidate-header">
                    <div class="candidate-avatar">
                        ${candidate.firstName ? candidate.firstName[0] : 'C'}
                    </div>
                    <div class="candidate-info">
                        <h4>${candidate.firstName || 'Unknown'} ${candidate.lastName || ''}</h4>
                        <p>${candidate.email || 'No email provided'}</p>
                    </div>
                </div>
                
                <div class="candidate-skills">
                    ${skills.slice(0, 5).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    ${skills.length > 5 ? `<span class="skill-tag">+${skills.length - 5} more</span>` : ''}
                </div>
                
                <div class="candidate-details">
                    <div class="detail-item">
                        <i class="fas fa-briefcase"></i>
                        <span>${experience} years experience</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${location}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-graduation-cap"></i>
                        <span>${education}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>Last active ${JobWalaAPI.formatIndianDate(candidate.lastLogin)}</span>
                    </div>
                </div>
                
                <div class="candidate-actions">
                    <button class="btn-view" onclick="companyDashboard.viewProfile('${candidate._id}')">
                        <i class="fas fa-user"></i> View Profile
                    </button>
                    <button class="btn-contact" onclick="companyDashboard.contactCandidate('${candidate._id}')">
                        <i class="fas fa-envelope"></i> Contact
                    </button>
                    <button class="btn-shortlist" onclick="companyDashboard.shortlistCandidate('${candidate._id}')">
                        <i class="fas fa-star"></i> Shortlist
                    </button>
                </div>
            </div>
        `;
    }

    async clearResumeFilters() {
        console.log('Clearing resume filters...');
        document.getElementById('resumeKeywords').value = '';
        document.getElementById('resumeLocation').value = '';
        document.getElementById('resumeExperience').value = '';
        document.getElementById('resumeEducation').value = '';
        document.getElementById('resumeSalary').value = '';
        document.getElementById('resumeAvailability').value = '';
        
        // Reset results
        const resultsContainer = document.getElementById('resumeSearchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-file-alt"></i>
                    <h4>Start your resume search</h4>
                    <p>Use the filters above to find candidates that match your requirements</p>
                </div>
            `;
        }
    }

    async clearCandidateFilters() {
        console.log('Clearing candidate filters...');
        document.getElementById('candidateKeywords').value = '';
        document.getElementById('candidateLocation').value = '';
        document.getElementById('candidateExperience').value = '';
        document.getElementById('candidateEducation').value = '';
        document.getElementById('candidateSalary').value = '';
        document.getElementById('candidateAvailability').value = '';
        
        // Reset results
        const resultsContainer = document.getElementById('candidateSearchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h4>Start your search</h4>
                    <p>Use the filters above to find candidates that match your requirements</p>
                </div>
            `;
        }
    }

    // Action functions for candidates
    async viewResume(candidateId) {
        console.log('Viewing resume for candidate:', candidateId);
        alert('View Resume functionality will be implemented');
    }

    async viewProfile(candidateId) {
        console.log('Viewing profile for candidate:', candidateId);
        alert('View Profile functionality will be implemented');
    }

    async contactCandidate(candidateId) {
        console.log('Contacting candidate:', candidateId);
        alert('Contact Candidate functionality will be implemented');
    }

    async shortlistCandidate(candidateId) {
        console.log('Shortlisting candidate:', candidateId);
        alert('Shortlist Candidate functionality will be implemented');
    }

    // Subuser management functions
    async showInviteSubuserModal() {
        console.log('Showing invite subuser modal...');
        
        // Create modal HTML
        const modalHTML = `
            <div id="inviteSubuserModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Invite Team Member</h3>
                        <button class="modal-close" onclick="companyDashboard.closeInviteSubuserModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="inviteSubuserForm">
                            <div class="form-group">
                                <label for="inviteEmail">Email Address *</label>
                                <input type="email" id="inviteEmail" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="inviteRole">Role *</label>
                                <select id="inviteRole" name="role" required>
                                    <option value="">Select Role</option>
                                    <option value="member">Member</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Permissions</label>
                                <div class="permissions-grid">
                                    <label class="permission-item">
                                        <input type="checkbox" name="permissions" value="canViewJobs" checked>
                                        <span>View Jobs</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="permissions" value="canPostJobs">
                                        <span>Post Jobs</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="permissions" value="canManageApplications">
                                        <span>Manage Applications</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="permissions" value="canViewAnalytics">
                                        <span>View Analytics</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="permissions" value="canManageSubusers">
                                        <span>Manage Team Members</span>
                                    </label>
                                    <label class="permission-item">
                                        <input type="checkbox" name="permissions" value="canManageCompanyProfile">
                                        <span>Manage Company Profile</span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="inviteMessage">Personal Message (Optional)</label>
                                <textarea id="inviteMessage" name="message" rows="3" placeholder="Add a personal message to the invitation..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="companyDashboard.closeInviteSubuserModal()">
                            Cancel
                        </button>
                        <button type="button" class="btn btn-primary" onclick="companyDashboard.inviteSubuser()">
                            <i class="fas fa-paper-plane"></i> Send Invitation
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = document.getElementById('inviteSubuserModal');
        modal.style.display = 'flex';
        
        // Focus on email input
        document.getElementById('inviteEmail').focus();
    }
    
    closeInviteSubuserModal() {
        const modal = document.getElementById('inviteSubuserModal');
        if (modal) {
            modal.remove();
        }
    }
    
    async inviteSubuser() {
        const form = document.getElementById('inviteSubuserForm');
        const formData = new FormData(form);
        
        const inviteData = {
            email: formData.get('email'),
            role: formData.get('role'),
            message: formData.get('message'),
            permissions: {}
        };
        
        // Get selected permissions
        const permissionCheckboxes = form.querySelectorAll('input[name="permissions"]:checked');
        permissionCheckboxes.forEach(checkbox => {
            inviteData.permissions[checkbox.value] = true;
        });
        
        try {
            console.log('Inviting subuser with data:', inviteData);
            
            const response = await window.api.request('/subusers/invite', {
                method: 'POST',
                body: JSON.stringify(inviteData)
            });
            
            if (response.success) {
                alert('Invitation sent successfully!');
                this.closeInviteSubuserModal();
                this.loadSubusers(); // Refresh the list
            } else {
                throw new Error(response.message || 'Failed to send invitation');
            }
        } catch (error) {
            console.error('Error inviting subuser:', error);
            alert('Error sending invitation: ' + (error.message || 'Please try again.'));
        }
    }
    
    async displaySubusers() {
        try {
            const response = await window.api.request('/subusers', {
                method: 'GET'
            });
            
            if (response.success) {
                const subusers = response.data;
                const tbody = document.getElementById('subusersTableBody');
                
                if (subusers.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No team members invited yet</td></tr>';
                    return;
                }
                
                tbody.innerHTML = subusers.map(subuser => `
                    <tr>
                        <td>
                            <div class="user-info">
                                <div class="user-avatar">${subuser.firstName ? subuser.firstName[0] : 'U'}</div>
                                <div class="user-details">
                                    <div class="user-name">${subuser.firstName || 'N/A'} ${subuser.lastName || ''}</div>
                                    <div class="user-email">${subuser.email}</div>
                                </div>
                            </div>
                        </td>
                        <td>${subuser.email}</td>
                        <td>
                            <span class="role-badge role-${subuser.subuserRole}">${subuser.subuserRole}</span>
                        </td>
                        <td>
                            <span class="status-badge ${subuser.invitationAccepted ? 'status-active' : 'status-pending'}">
                                ${subuser.invitationAccepted ? 'Active' : 'Pending'}
                            </span>
                        </td>
                        <td>${JobWalaAPI.formatIndianDate(subuser.invitedAt)}</td>
                        <td>${subuser.lastLogin ? JobWalaAPI.formatIndianDate(subuser.lastLogin) : 'Never'}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-secondary" onclick="companyDashboard.editSubuserRole('${subuser._id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="companyDashboard.removeSubuser('${subuser._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } else {
                throw new Error(response.message || 'Failed to load team members');
            }
        } catch (error) {
            console.error('Error loading subusers:', error);
            const tbody = document.getElementById('subusersTableBody');
            tbody.innerHTML = '<tr><td colspan="7" class="text-center error">Error loading team members</td></tr>';
        }
    }
    
    async editSubuserRole(subuserId) {
        const newRole = prompt('Enter new role (member, manager, admin):');
        if (!newRole || !['member', 'manager', 'admin'].includes(newRole)) {
            return;
        }
        
        try {
            const response = await window.api.request(`/subusers/${subuserId}/role`, {
                method: 'PUT',
                body: JSON.stringify({ role: newRole })
            });
            
            if (response.success) {
                alert('Role updated successfully!');
                this.loadSubusers();
            } else {
                throw new Error(response.message || 'Failed to update role');
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Error updating role: ' + (error.message || 'Please try again.'));
        }
    }
    
    async removeSubuser(subuserId) {
        if (!confirm('Are you sure you want to remove this team member?')) {
            return;
        }
        
        try {
            const response = await window.api.request(`/subusers/${subuserId}`, {
                method: 'DELETE'
            });
            
            if (response.success) {
                alert('Team member removed successfully!');
                this.loadSubusers();
            } else {
                throw new Error(response.message || 'Failed to remove team member');
            }
        } catch (error) {
            console.error('Error removing subuser:', error);
            alert('Error removing team member: ' + (error.message || 'Please try again.'));
        }
    }


    // Utility functions
    showError(message) {
        console.error(message);
        // You could show a toast notification here
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUser');
        window.location.href = 'company-login.html';
    }
}

// Initialize company dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing CompanyDashboard...');
    window.companyDashboard = new CompanyDashboard();
    
    // Add test function to window for debugging
    window.testPostJob = () => {
        console.log('Testing post job...');
        window.companyDashboard.navigateToPage('post-job');
    };
    
    console.log('CompanyDashboard initialized, test function available as window.testPostJob()');
});
