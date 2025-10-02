// Jobs Page JavaScript
let allJobs = [];
let currentJobs = [];
let currentJobPage = 1;
let isLoading = false;

// Load jobs from API
async function loadJobs() {
    try {
        const response = await window.api.getJobs({ page: currentJobPage, limit: 20 });
        
        if (response.jobs && response.jobs.length > 0) {
            // Filter out duplicates
            const uniqueJobs = [];
            const seenJobs = new Set();
            
            response.jobs.forEach(job => {
                const key = `${job.title}_${job.company?.name}_${job.description}`;
                if (!seenJobs.has(key)) {
                    seenJobs.add(key);
                    uniqueJobs.push(job);
                }
            });
            
            allJobs = [...allJobs, ...uniqueJobs];
            currentJobs = [...allJobs];
            
            displayJobs();
            hideLoadingIndicator();
        } else {
            showNoJobsMessage();
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
        showNoJobsMessage();
    }
}

// Display jobs
function displayJobs() {
    const jobsGrid = document.getElementById('all-jobs-grid');
    if (!jobsGrid) return;
    
    if (currentJobs.length === 0) {
        showNoJobsMessage();
        return;
    }
    
    jobsGrid.innerHTML = currentJobs.map(job => createJobCard(job)).join('');
    hideNoJobsMessage();
}

// Create job card HTML
function createJobCard(job) {
    const companyName = job.company?.name || 'Unknown Company';
    
    // Handle location data properly
    let locationText = 'Location not specified';
    if (job.location) {
        if (typeof job.location === 'string') {
            locationText = job.location;
        } else if (job.location.city && job.location.state) {
            locationText = `${job.location.city}, ${job.location.state}`;
        } else if (job.location.city) {
            locationText = job.location.city;
        } else if (job.location.state) {
            locationText = job.location.state;
        }
    }
    
    // Handle experience data properly
    let experienceText = 'Not specified';
    if (job.experience) {
        if (typeof job.experience === 'string') {
            experienceText = job.experience;
        } else if (job.experience.min && job.experience.max) {
            experienceText = `${job.experience.min}-${job.experience.max} years`;
        } else if (job.experience.min) {
            experienceText = `${job.experience.min}+ years`;
        } else if (job.experience.max) {
            experienceText = `Up to ${job.experience.max} years`;
        }
    }
    
    // Handle salary data properly
    let salaryText = 'Salary not specified';
    if (job.salary) {
        if (typeof job.salary === 'string') {
            salaryText = job.salary;
        } else if (job.salary.min && job.salary.max) {
            salaryText = `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}`;
        } else if (job.salary.min) {
            salaryText = `₹${job.salary.min.toLocaleString()}+`;
        } else if (job.salary.max) {
            salaryText = `Up to ₹${job.salary.max.toLocaleString()}`;
        }
    }
    
    return `
        <div class="job-card" onclick="openJobDetails('${job._id}')">
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <p class="job-company">${companyName}</p>
                </div>
            </div>
            <div class="job-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${locationText}</span>
                <span><i class="fas fa-briefcase"></i> ${experienceText}</span>
                <span><i class="fas fa-dollar-sign"></i> ${salaryText}</span>
            </div>
            <div class="job-description">
                ${job.description || 'No description available'}
            </div>
            <div class="job-actions">
                <button class="btn-apply" onclick="event.stopPropagation(); openJobApplication('${job._id}')">
                    Apply Now
                </button>
                <button class="btn-view" onclick="event.stopPropagation(); openJobDetails('${job._id}')">
                    View Details
                </button>
            </div>
        </div>
    `;
}

// Filter jobs by category
function filterJobsByCategory(category) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    let filteredJobs = [];
    
    switch (category) {
        case 'all':
            filteredJobs = allJobs;
            break;
        case 'it':
            filteredJobs = allJobs.filter(job => 
                job.jobSectorType === 'IT' || 
                job.skills?.some(skill => 
                    ['javascript', 'python', 'java', 'react', 'angular', 'node', 'programming', 'software', 'developer'].includes(skill.toLowerCase())
                )
            );
            break;
        case 'non-it':
            filteredJobs = allJobs.filter(job => 
                job.jobSectorType === 'Non-IT' || 
                !job.skills?.some(skill => 
                    ['javascript', 'python', 'java', 'react', 'angular', 'node', 'programming', 'software', 'developer'].includes(skill.toLowerCase())
                )
            );
            break;
        case 'work-from-home':
            filteredJobs = allJobs.filter(job => 
                job.jobModeType === 'Work From Home' || 
                job.location?.toLowerCase().includes('remote') ||
                job.title?.toLowerCase().includes('remote')
            );
            break;
        case 'work-from-office':
            filteredJobs = allJobs.filter(job => 
                job.jobModeType === 'Work From Office' || 
                job.location?.toLowerCase().includes('office')
            );
            break;
        case 'work-from-field':
            filteredJobs = allJobs.filter(job => 
                job.jobModeType === 'Work From Field' || 
                job.title?.toLowerCase().includes('field')
            );
            break;
        case 'hybrid':
            filteredJobs = allJobs.filter(job => 
                job.jobModeType === 'Hybrid' || 
                job.title?.toLowerCase().includes('hybrid')
            );
            break;
        case 'remote':
            filteredJobs = allJobs.filter(job => 
                job.jobModeType === 'Remote' || 
                job.location?.toLowerCase().includes('remote')
            );
            break;
        case 'day-shift':
            filteredJobs = allJobs.filter(job => 
                job.jobShiftType === 'Day Shift' || 
                job.title?.toLowerCase().includes('day')
            );
            break;
        case 'night-shift':
            filteredJobs = allJobs.filter(job => 
                job.jobShiftType === 'Night Shift' || 
                job.title?.toLowerCase().includes('night')
            );
            break;
        case 'rotational-shift':
            filteredJobs = allJobs.filter(job => 
                job.jobShiftType === 'Rotational Shift' || 
                job.title?.toLowerCase().includes('rotational')
            );
            break;
        case 'split-shift':
            filteredJobs = allJobs.filter(job => 
                job.jobShiftType === 'Split Shift' || 
                job.title?.toLowerCase().includes('split')
            );
            break;
        case 'full-time':
            filteredJobs = allJobs.filter(job => 
                job.employmentType === 'Full Time' || 
                job.title?.toLowerCase().includes('full time')
            );
            break;
        case 'part-time':
            filteredJobs = allJobs.filter(job => 
                job.employmentType === 'Part Time' || 
                job.title?.toLowerCase().includes('part time')
            );
            break;
        case 'permanent':
            filteredJobs = allJobs.filter(job => 
                job.jobPostType === 'Permanent' || 
                job.title?.toLowerCase().includes('permanent')
            );
            break;
        case 'temporary':
            filteredJobs = allJobs.filter(job => 
                job.jobPostType === 'Temporary/Contract' || 
                job.title?.toLowerCase().includes('temporary') ||
                job.title?.toLowerCase().includes('contract')
            );
            break;
        case 'freelance':
            filteredJobs = allJobs.filter(job => 
                job.employmentType === 'Freelance' || 
                job.title?.toLowerCase().includes('freelance')
            );
            break;
        case 'apprenticeship':
            filteredJobs = allJobs.filter(job => 
                job.employmentType === 'Apprenticeship' || 
                job.title?.toLowerCase().includes('apprenticeship')
            );
            break;
        default:
            filteredJobs = allJobs;
    }
    
    currentJobs = filteredJobs;
    displayJobs();
}

// Jobs page search functionality
function performJobsPageSearch() {
    const jobSearch = document.getElementById('jobsPageSearch').value.trim();
    const experience = document.getElementById('jobsPageExperience').value;
    const location = document.getElementById('jobsPageLocation').value.trim();
    
    console.log('Jobs page search:', { jobSearch, experience, location });
    
    // Filter jobs based on search criteria
    let filteredJobs = allJobs;
    
    if (jobSearch) {
        filteredJobs = filteredJobs.filter(job => 
            job.title?.toLowerCase().includes(jobSearch.toLowerCase()) ||
            job.company?.name?.toLowerCase().includes(jobSearch.toLowerCase()) ||
            job.description?.toLowerCase().includes(jobSearch.toLowerCase()) ||
            job.skills?.some(skill => skill.toLowerCase().includes(jobSearch.toLowerCase()))
        );
    }
    
    if (experience) {
        filteredJobs = filteredJobs.filter(job => {
            const jobExp = job.experience || '';
            return jobExp.includes(experience) || jobExp.includes(experience.replace('-', ' to '));
        });
    }
    
    if (location) {
        filteredJobs = filteredJobs.filter(job => 
            job.location?.toLowerCase().includes(location.toLowerCase())
        );
    }
    
    currentJobs = filteredJobs;
    displayJobs();
}

// Load more jobs
function loadMoreJobs() {
    if (isLoading) return;
    
    isLoading = true;
    currentJobPage++;
    loadJobs();
}

// Open job details modal
function openJobDetails(jobId) {
    const job = allJobs.find(j => j._id === jobId);
    if (!job) return;
    
    const modal = document.getElementById('jobDetailsModal');
    const content = document.getElementById('jobDetailsContent');
    
    if (modal && content) {
        content.innerHTML = createJobDetailsHTML(job);
        modal.style.display = 'block';
    }
}

// Close job details modal
function closeJobDetailsModal() {
    const modal = document.getElementById('jobDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Create job details HTML
function createJobDetailsHTML(job) {
    const companyName = job.company?.name || 'Unknown Company';
    
    // Handle location data properly
    let locationText = 'Location not specified';
    if (job.location) {
        if (typeof job.location === 'string') {
            locationText = job.location;
        } else if (job.location.city && job.location.state) {
            locationText = `${job.location.city}, ${job.location.state}`;
        } else if (job.location.city) {
            locationText = job.location.city;
        } else if (job.location.state) {
            locationText = job.location.state;
        }
    }
    
    // Handle experience data properly
    let experienceText = 'Not specified';
    if (job.experience) {
        if (typeof job.experience === 'string') {
            experienceText = job.experience;
        } else if (job.experience.min && job.experience.max) {
            experienceText = `${job.experience.min}-${job.experience.max} years`;
        } else if (job.experience.min) {
            experienceText = `${job.experience.min}+ years`;
        } else if (job.experience.max) {
            experienceText = `Up to ${job.experience.max} years`;
        }
    }
    
    // Handle salary data properly
    let salaryText = 'Salary not specified';
    if (job.salary) {
        if (typeof job.salary === 'string') {
            salaryText = job.salary;
        } else if (job.salary.min && job.salary.max) {
            salaryText = `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}`;
        } else if (job.salary.min) {
            salaryText = `₹${job.salary.min.toLocaleString()}+`;
        } else if (job.salary.max) {
            salaryText = `Up to ₹${job.salary.max.toLocaleString()}`;
        }
    }
    
    // Handle job mode and employment type
    const jobMode = job.jobModeType || 'Not specified';
    const employmentType = job.employmentType || 'Not specified';
    
    // Handle skills properly
    let skillsList = '<li>No specific requirements listed</li>';
    if (job.skills && Array.isArray(job.skills) && job.skills.length > 0) {
        skillsList = job.skills.map(skill => `<li>${skill}</li>`).join('');
    }
    
    // Handle job description
    const description = job.description || 'No description available';
    
    return `
        <div class="job-details">
            <div class="job-header">
                <h2>${job.title}</h2>
                <p class="company-name">${companyName}</p>
            </div>
            
            <div class="job-meta">
                <div class="meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${locationText}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-briefcase"></i>
                    <span>${experienceText}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span>${salaryText}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${jobMode}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-user-tie"></i>
                    <span>${employmentType}</span>
                </div>
            </div>
            
            <div class="job-description">
                <h3>Job Description</h3>
                <p>${description}</p>
            </div>
            
            <div class="job-requirements">
                <h3>Required Skills</h3>
                <ul>
                    ${skillsList}
                </ul>
            </div>
            
            ${job.responsibilities ? `
            <div class="job-responsibilities">
                <h3>Key Responsibilities</h3>
                <ul>
                    ${Array.isArray(job.responsibilities) ? 
                        job.responsibilities.map(resp => `<li>${resp}</li>`).join('') : 
                        `<li>${job.responsibilities}</li>`
                    }
                </ul>
            </div>
            ` : ''}
            
            ${job.benefits ? `
            <div class="job-benefits">
                <h3>Benefits & Perks</h3>
                <ul>
                    ${Array.isArray(job.benefits) ? 
                        job.benefits.map(benefit => `<li>${benefit}</li>`).join('') : 
                        `<li>${job.benefits}</li>`
                    }
                </ul>
            </div>
            ` : ''}
            
            <div class="job-actions">
                <button class="btn-primary" onclick="openJobApplication('${job._id}')">Apply Now</button>
                <button class="btn-secondary" onclick="closeJobDetailsModal()">Close</button>
            </div>
        </div>
    `;
}

// Open job application modal
function openJobApplication(jobId) {
    const job = allJobs.find(j => j._id === jobId);
    if (!job) return;
    
    const modal = document.getElementById('jobApplicationModal');
    const title = document.getElementById('jobApplicationTitle');
    const form = document.getElementById('jobApplicationForm');
    
    if (modal && title && form) {
        title.textContent = `Apply for ${job.title} at ${job.company?.name || 'Unknown Company'}`;
        form.innerHTML = createJobApplicationForm(job);
        
        // Store job ID in modal for form submission
        modal.dataset.jobId = jobId;
        
        modal.style.display = 'block';
        
        // Initialize autocomplete after form is created
        setTimeout(() => {
            initializeAutocomplete();
        }, 100);
    }
}

// Close job application modal
function closeJobApplicationModal() {
    const modal = document.getElementById('jobApplicationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Autocomplete data
const autocompleteData = {
    fieldOfStudy: [
        'Computer Science', 'Information Technology', 'Software Engineering', 'Computer Engineering',
        'Data Science', 'Artificial Intelligence', 'Machine Learning', 'Cybersecurity',
        'Information Systems', 'Computer Applications', 'Electronics Engineering', 'Electrical Engineering',
        'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Aerospace Engineering',
        'Biomedical Engineering', 'Industrial Engineering', 'Materials Science', 'Physics',
        'Mathematics', 'Statistics', 'Business Administration', 'Management Studies',
        'Marketing', 'Finance', 'Accounting', 'Economics', 'Commerce', 'Human Resources',
        'Psychology', 'Sociology', 'Political Science', 'International Relations',
        'English Literature', 'Journalism', 'Mass Communication', 'Media Studies',
        'Graphic Design', 'Fine Arts', 'Architecture', 'Urban Planning',
        'Medicine', 'Nursing', 'Pharmacy', 'Dentistry', 'Veterinary Science',
        'Agriculture', 'Environmental Science', 'Biology', 'Chemistry', 'Geology',
        'History', 'Geography', 'Philosophy', 'Education', 'Social Work',
        'Law', 'Criminology', 'Public Administration', 'Public Health'
    ],
    technicalSkills: [
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
        'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
        'HTML', 'CSS', 'Bootstrap', 'Tailwind CSS', 'SASS', 'LESS', 'jQuery',
        'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Elasticsearch', 'Oracle', 'SQLite',
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
        'Linux', 'Windows Server', 'Apache', 'Nginx', 'REST API', 'GraphQL',
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
        'Data Analysis', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Tableau', 'Power BI',
        'Mobile Development', 'React Native', 'Flutter', 'iOS Development', 'Android Development',
        'DevOps', 'CI/CD', 'Microservices', 'Agile', 'Scrum', 'Project Management'
    ],
    softSkills: [
        'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
        'Time Management', 'Adaptability', 'Creativity', 'Emotional Intelligence', 'Negotiation',
        'Presentation Skills', 'Public Speaking', 'Active Listening', 'Conflict Resolution',
        'Decision Making', 'Strategic Thinking', 'Analytical Skills', 'Attention to Detail',
        'Work Ethic', 'Reliability', 'Persistence', 'Flexibility', 'Innovation',
        'Mentoring', 'Coaching', 'Collaboration', 'Cross-functional Teamwork', 'Cultural Awareness',
        'Customer Service', 'Sales Skills', 'Networking', 'Relationship Building',
        'Stress Management', 'Self-motivation', 'Initiative', 'Accountability', 'Integrity',
        'Patience', 'Empathy', 'Diplomacy', 'Persuasion', 'Influence', 'Delegation',
        'Planning', 'Organization', 'Prioritization', 'Multitasking', 'Efficiency'
    ],
    languages: [
        'English', 'Hindi', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
        'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Japanese', 'Korean', 'Arabic', 'Turkish',
        'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech', 'Hungarian',
        'Romanian', 'Bulgarian', 'Croatian', 'Serbian', 'Slovak', 'Slovenian', 'Estonian',
        'Latvian', 'Lithuanian', 'Greek', 'Hebrew', 'Persian', 'Urdu', 'Bengali', 'Tamil',
        'Telugu', 'Marathi', 'Gujarati', 'Punjabi', 'Kannada', 'Malayalam', 'Odia', 'Assamese',
        'Nepali', 'Sinhala', 'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Tagalog', 'Filipino'
    ]
};

// Initialize autocomplete functionality
function initializeAutocomplete() {
    // Field of Study autocomplete
    setupAutocomplete('fieldOfStudy', autocompleteData.fieldOfStudy);
    
    // Technical Skills autocomplete
    setupAutocomplete('skills', autocompleteData.technicalSkills);
    
    // Soft Skills autocomplete
    setupAutocomplete('softSkills', autocompleteData.softSkills);
    
    // Languages autocomplete
    setupAutocomplete('languages', autocompleteData.languages);
}

// Setup autocomplete for a specific field
function setupAutocomplete(fieldId, suggestions) {
    const input = document.getElementById(fieldId);
    const suggestionsContainer = document.getElementById(fieldId + 'Suggestions');
    
    if (!input || !suggestionsContainer) return;
    
    let currentSuggestions = [];
    let selectedIndex = -1;
    
    input.addEventListener('input', function(e) {
        const value = e.target.value;
        const lastCommaIndex = value.lastIndexOf(',');
        const currentWord = lastCommaIndex === -1 ? value.trim() : value.substring(lastCommaIndex + 1).trim();
        
        if (currentWord.length < 1) {
            hideSuggestions();
            return;
        }
        
        // Filter suggestions that start with or contain the current word
        currentSuggestions = suggestions.filter(suggestion => {
            const suggestionLower = suggestion.toLowerCase();
            const currentWordLower = currentWord.toLowerCase();
            
            // Check if suggestion starts with current word or contains it
            const startsWith = suggestionLower.startsWith(currentWordLower);
            const contains = suggestionLower.includes(currentWordLower);
            
            // Don't show suggestions that are already in the full value
            const alreadyInValue = value.toLowerCase().includes(suggestion.toLowerCase());
            
            return (startsWith || contains) && !alreadyInValue;
        }).slice(0, 8);
        
        if (currentSuggestions.length > 0) {
            showSuggestions(currentSuggestions, currentWord);
        } else {
            hideSuggestions();
        }
    });
    
    input.addEventListener('keydown', function(e) {
        if (!suggestionsContainer.classList.contains('show')) return;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, currentSuggestions.length - 1);
                updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    selectSuggestion(currentSuggestions[selectedIndex]);
                }
                break;
            case 'Tab':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    selectSuggestion(currentSuggestions[selectedIndex]);
                } else if (currentSuggestions.length > 0) {
                    // If no suggestion is selected, select the first one
                    selectSuggestion(currentSuggestions[0]);
                }
                break;
            case 'Escape':
                hideSuggestions();
                break;
        }
    });
    
    input.addEventListener('blur', function() {
        // Delay hiding to allow clicking on suggestions
        setTimeout(() => hideSuggestions(), 200);
    });
    
    function showSuggestions(suggestions, searchTerm) {
        suggestionsContainer.innerHTML = '';
        suggestions.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.className = 'autocomplete-suggestion';
            div.innerHTML = highlightMatch(suggestion, searchTerm);
            div.addEventListener('click', () => selectSuggestion(suggestion));
            suggestionsContainer.appendChild(div);
        });
        suggestionsContainer.classList.add('show');
        selectedIndex = -1;
    }
    
    function hideSuggestions() {
        suggestionsContainer.classList.remove('show');
        selectedIndex = -1;
    }
    
    function updateSelection() {
        const suggestions = suggestionsContainer.querySelectorAll('.autocomplete-suggestion');
        suggestions.forEach((suggestion, index) => {
            suggestion.classList.toggle('highlighted', index === selectedIndex);
        });
    }
    
    function selectSuggestion(suggestion) {
        const value = input.value;
        const lastCommaIndex = value.lastIndexOf(',');
        
        if (lastCommaIndex === -1) {
            // No comma found, replace entire value
            input.value = suggestion;
        } else {
            // Comma found, replace only the current word after the last comma
            const beforeComma = value.substring(0, lastCommaIndex + 1).trim();
            input.value = beforeComma + ' ' + suggestion;
        }
        
        hideSuggestions();
        input.focus();
        
        // Trigger input event to update any other listeners
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    function highlightMatch(text, searchTerm) {
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
}

// Create job application form
function createJobApplicationForm(job) {
    return `
        <div class="form-section">
            <h3>Personal Information</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="fullName">Full Name *</label>
                    <input type="text" id="fullName" name="fullName" required>
                </div>
                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="mobileNumber">Mobile Number *</label>
                    <input type="tel" id="mobileNumber" name="mobileNumber" required>
                </div>
                <div class="form-group">
                    <label for="alternateNumber">Alternate Number</label>
                    <input type="tel" id="alternateNumber" name="alternateNumber">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="dateOfBirth">Date of Birth</label>
                    <input type="date" id="dateOfBirth" name="dateOfBirth">
                </div>
                <div class="form-group">
                    <label for="gender">Gender</label>
                    <select id="gender" name="gender">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="currentLocation">Current Location *</label>
                    <input type="text" id="currentLocation" name="currentLocation" placeholder="City, State" required>
                </div>
                <div class="form-group">
                    <label for="willingToRelocate">Willing to Relocate</label>
                    <select id="willingToRelocate" name="willingToRelocate">
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Maybe">Maybe (Depends on opportunity)</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h3>Professional Information</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="currentJobTitle">Current Job Title</label>
                    <input type="text" id="currentJobTitle" name="currentJobTitle">
                </div>
                <div class="form-group">
                    <label for="currentCompany">Current Company</label>
                    <input type="text" id="currentCompany" name="currentCompany">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="totalExperience">Total Experience *</label>
                    <select id="totalExperience" name="totalExperience" required>
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
                        <option value="30.5 Years">30.5 Years</option>
                        <option value="31 Years">31 Years</option>
                        <option value="31 Years Plus">31 Years Plus</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="relevantExperience">Relevant Experience (in this field)</label>
                    <select id="relevantExperience" name="relevantExperience">
                        <option value="">Select Relevant Experience</option>
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
                        <option value="30.5 Years">30.5 Years</option>
                        <option value="31 Years">31 Years</option>
                        <option value="31 Years Plus">31 Years Plus</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="currentAnnualSalary">Current Annual Salary (INR)</label>
                    <input type="number" id="currentAnnualSalary" name="currentAnnualSalary" placeholder="e.g., 500000">
                </div>
                <div class="form-group">
                    <label for="expectedAnnualSalary">Expected Annual Salary (INR) *</label>
                    <input type="number" id="expectedAnnualSalary" name="expectedAnnualSalary" placeholder="e.g., 600000" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="noticePeriod">Notice Period *</label>
                    <select id="noticePeriod" name="noticePeriod" required>
                        <option value="">Select Notice Period</option>
                        <option value="Immediate Joining">Immediate Joining</option>
                        <option value="7 Days">7 Days</option>
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="45 Days">45 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                        <option value="90 Days Plus">90 Days Plus</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="employmentType">Preferred Employment Type</label>
                    <select id="employmentType" name="employmentType">
                        <option value="">Select Type</option>
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h3>Education & Qualifications</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="highestQualification">Highest Qualification *</label>
                    <select id="highestQualification" name="highestQualification" required>
                        <option value="">Select Qualification</option>
                        <option value="High School">High School</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="PhD">PhD</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="fieldOfStudy">Field of Study</label>
                    <div class="autocomplete-container">
                        <input type="text" id="fieldOfStudy" name="fieldOfStudy" placeholder="e.g., Computer Science, Engineering" autocomplete="off">
                        <div class="autocomplete-suggestions" id="fieldOfStudySuggestions"></div>
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="university">University/Institution</label>
                    <input type="text" id="university" name="university" placeholder="Name of your university">
                </div>
                <div class="form-group">
                    <label for="graduationYear">Graduation Year</label>
                    <input type="number" id="graduationYear" name="graduationYear" placeholder="e.g., 2020" min="1950" max="2030">
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h3>Skills & Expertise</h3>
            <div class="form-group">
                <label for="skills">Technical Skills (comma-separated) *</label>
                <div class="autocomplete-container">
                    <input type="text" id="skills" name="skills" placeholder="e.g., JavaScript, Python, React, Node.js, MongoDB" required autocomplete="off">
                    <div class="autocomplete-suggestions" id="skillsSuggestions"></div>
                </div>
            </div>
            <div class="form-group">
                <label for="softSkills">Soft Skills (comma-separated)</label>
                <div class="autocomplete-container">
                    <input type="text" id="softSkills" name="softSkills" placeholder="e.g., Leadership, Communication, Problem Solving" autocomplete="off">
                    <div class="autocomplete-suggestions" id="softSkillsSuggestions"></div>
                </div>
            </div>
            <div class="form-group">
                <label for="languages">Languages Known</label>
                <div class="autocomplete-container">
                    <input type="text" id="languages" name="languages" placeholder="e.g., English, Hindi, Spanish" autocomplete="off">
                    <div class="autocomplete-suggestions" id="languagesSuggestions"></div>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h3>Additional Information</h3>
            <div class="form-group">
                <label for="coverLetter">Cover Letter</label>
                <textarea id="coverLetter" name="coverLetter" rows="4" placeholder="Tell us why you're interested in this position and what makes you a great fit..."></textarea>
            </div>
            <div class="form-group">
                <label for="portfolio">Portfolio/LinkedIn Profile</label>
                <input type="url" id="portfolio" name="portfolio" placeholder="https://your-portfolio.com or https://linkedin.com/in/yourprofile">
            </div>
            <div class="form-group">
                <label for="resume">Resume Upload</label>
                <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 100%;">
                <small style="color: #666; font-size: 12px;">Accepted formats: PDF, DOC, DOCX (Max size: 5MB)</small>
            </div>
            <div class="form-group">
                <label for="availability">Availability for Interview</label>
                <select id="availability" name="availability">
                    <option value="">Select Availability</option>
                    <option value="Weekdays Morning">Weekdays Morning (9 AM - 12 PM)</option>
                    <option value="Weekdays Afternoon">Weekdays Afternoon (12 PM - 5 PM)</option>
                    <option value="Weekdays Evening">Weekdays Evening (5 PM - 8 PM)</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Flexible">Flexible</option>
                </select>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn-primary">Submit Application</button>
            <button type="button" class="btn-secondary" onclick="closeJobApplicationModal()">Cancel</button>
        </div>
    `;
}

// Show/hide loading indicator
function showLoadingIndicator() {
    const loading = document.getElementById('jobsPageLoading');
    if (loading) {
        loading.style.display = 'block';
    }
}

function hideLoadingIndicator() {
    const loading = document.getElementById('jobsPageLoading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Show/hide no jobs message
function showNoJobsMessage() {
    const noJobs = document.getElementById('noJobsFound');
    if (noJobs) {
        noJobs.style.display = 'block';
    }
}

function hideNoJobsMessage() {
    const noJobs = document.getElementById('noJobsFound');
    if (noJobs) {
        noJobs.style.display = 'none';
    }
}

// Handle job application form submission
function handleJobApplication(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Get all form data
    const applicationData = {
        // Personal Information
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        mobileNumber: formData.get('mobileNumber'),
        alternateNumber: formData.get('alternateNumber'),
        dateOfBirth: formData.get('dateOfBirth'),
        gender: formData.get('gender'),
        currentLocation: formData.get('currentLocation'),
        willingToRelocate: formData.get('willingToRelocate'),
        
        // Professional Information
        currentJobTitle: formData.get('currentJobTitle'),
        currentCompany: formData.get('currentCompany'),
        totalExperience: formData.get('totalExperience'),
        relevantExperience: formData.get('relevantExperience'),
        currentAnnualSalary: formData.get('currentAnnualSalary'),
        expectedAnnualSalary: formData.get('expectedAnnualSalary'),
        noticePeriod: formData.get('noticePeriod'),
        employmentType: formData.get('employmentType'),
        
        // Education & Qualifications
        highestQualification: formData.get('highestQualification'),
        fieldOfStudy: formData.get('fieldOfStudy'),
        university: formData.get('university'),
        graduationYear: formData.get('graduationYear'),
        
        // Skills & Expertise
        skills: formData.get('skills'),
        softSkills: formData.get('softSkills'),
        languages: formData.get('languages'),
        
        // Additional Information
        coverLetter: formData.get('coverLetter'),
        portfolio: formData.get('portfolio'),
        availability: formData.get('availability'),
        
        // Resume file
        resume: formData.get('resume')
    };
    
    // Get job ID from the modal
    const jobId = form.closest('.modal').dataset.jobId;
    
    if (!jobId) {
        alert('Error: Job ID not found. Please try again.');
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    // Submit application
    api.applyForJob(jobId, applicationData)
        .then(response => {
            if (response.success) {
                alert('Application submitted successfully!');
                closeJobApplicationModal();
                form.reset();
            } else {
                alert('Error submitting application: ' + (response.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Application submission error:', error);
            alert('Error submitting application. Please try again.');
        })
        .finally(() => {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    showLoadingIndicator();
    loadJobs();
    
    // Handle search parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const companyFilter = urlParams.get('company');
    const searchQuery = urlParams.get('search');
    const experienceFilter = urlParams.get('experience');
    const locationFilter = urlParams.get('location');
    
    // Handle company filter from URL
    if (companyFilter) {
        // Filter jobs by company
        setTimeout(() => {
            filterJobsByCompany(companyFilter);
        }, 1000);
    }
    
    // Handle search parameters from homepage
    if (searchQuery || experienceFilter || locationFilter) {
        setTimeout(() => {
            // Populate search form with URL parameters
            if (searchQuery) {
                const searchInput = document.getElementById('jobsPageSearch');
                if (searchInput) searchInput.value = searchQuery;
            }
            if (experienceFilter) {
                const experienceSelect = document.getElementById('jobsPageExperience');
                if (experienceSelect) experienceSelect.value = experienceFilter;
            }
            if (locationFilter) {
                const locationInput = document.getElementById('jobsPageLocation');
                if (locationInput) locationInput.value = locationFilter;
            }
            
            // Perform search with the parameters
            performJobsPageSearch();
        }, 1000);
    }
    
    // Add event listeners for search
    const searchInput = document.getElementById('jobsPageSearch');
    const locationInput = document.getElementById('jobsPageLocation');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performJobsPageSearch();
            }
        });
    }
    
    if (locationInput) {
        locationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performJobsPageSearch();
            }
        });
    }
    
    // Add form submission handler
    document.addEventListener('submit', function(event) {
        if (event.target.id === 'jobApplicationForm') {
            handleJobApplication(event);
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const jobDetailsModal = document.getElementById('jobDetailsModal');
        const jobApplicationModal = document.getElementById('jobApplicationModal');
        
        if (event.target === jobDetailsModal) {
            closeJobDetailsModal();
        }
        if (event.target === jobApplicationModal) {
            closeJobApplicationModal();
        }
    });
});

// Filter jobs by company
function filterJobsByCompany(companyName) {
    console.log('Filtering jobs by company:', companyName);
    
    const filteredJobs = allJobs.filter(job => 
        job.company?.name?.toLowerCase().includes(companyName.toLowerCase())
    );
    
    currentJobs = filteredJobs;
    displayJobs();
    
    // Show search results message
    showCompanyJobsResults(companyName, filteredJobs.length);
}

// Show company jobs results
function showCompanyJobsResults(companyName, count) {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.innerHTML = `
            <div class="search-results-message">
                <div class="search-results-header">
                    <h3>Jobs from ${companyName}</h3>
                    <p>Found ${count} job${count !== 1 ? 's' : ''}</p>
                </div>
                <button class="clear-search-btn" onclick="clearCompanyFilter()">Clear Filter</button>
            </div>
        `;
    }
}

// Clear company filter
function clearCompanyFilter() {
    currentJobs = allJobs;
    displayJobs();
    
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.innerHTML = '';
    }
}
