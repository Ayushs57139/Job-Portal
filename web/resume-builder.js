// Resume Builder JavaScript
class ResumeBuilder {
    constructor() {
        this.currentTemplate = 'modern';
        this.currentColor = 'blue';
        this.zoomLevel = 100;
        this.isFullscreen = false;
        this.resumeData = {
            personal: {
                fullName: '',
                title: '',
                email: '',
                phone: '',
                location: '',
                linkedin: '',
                website: '',
                summary: ''
            },
            experience: [],
            education: [],
            skills: {
                technical: '',
                soft: '',
                languages: '',
                certifications: ''
            },
            projects: []
        };
        
        this.templates = {
            modern: {
                name: 'Modern',
                description: 'Clean & Professional',
                layout: 'modern-layout'
            },
            classic: {
                name: 'Classic',
                description: 'Traditional & Elegant',
                layout: 'classic-layout'
            },
            creative: {
                name: 'Creative',
                description: 'Bold & Innovative',
                layout: 'creative-layout'
            },
            minimal: {
                name: 'Minimal',
                description: 'Simple & Clean',
                layout: 'minimal-layout'
            },
            executive: {
                name: 'Executive',
                description: 'Powerful & Authoritative',
                layout: 'executive-layout'
            },
            tech: {
                name: 'Tech',
                description: 'Modern & Dynamic',
                layout: 'tech-layout'
            },
            academic: {
                name: 'Academic',
                description: 'Scholarly & Formal',
                layout: 'academic-layout'
            },
            artistic: {
                name: 'Artistic',
                description: 'Creative & Vibrant',
                layout: 'artistic-layout'
            },
            corporate: {
                name: 'Corporate',
                description: 'Professional & Reliable',
                layout: 'corporate-layout'
            },
            startup: {
                name: 'Startup',
                description: 'Fresh & Energetic',
                layout: 'startup-layout'
            }
        };
        
        this.colorSchemes = {
            blue: { primary: '#1E88E5', secondary: '#1976D2', accent: '#42A5F5' },
            dark: { primary: '#2C3E50', secondary: '#34495E', accent: '#5D6D7E' },
            purple: { primary: '#8E24AA', secondary: '#7B1FA2', accent: '#AB47BC' },
            green: { primary: '#43A047', secondary: '#388E3C', accent: '#66BB6A' },
            red: { primary: '#E53935', secondary: '#D32F2F', accent: '#EF5350' },
            orange: { primary: '#FB8C00', secondary: '#F57C00', accent: '#FFB74D' },
            navy: { primary: '#1565C0', secondary: '#0D47A1', accent: '#42A5F5' },
            pink: { primary: '#E91E63', secondary: '#C2185B', accent: '#F06292' },
            gray: { primary: '#546E7A', secondary: '#455A64', accent: '#78909C' },
            teal: { primary: '#00ACC1', secondary: '#0097A7', accent: '#26C6DA' }
        };
        
        this.init();
    }
    
    init() {
        try {
            this.createTemplateCards();
            this.setupEventListeners();
            this.generateResumePreview();
            console.log('Resume Builder init completed');
        } catch (error) {
            console.error('Error in Resume Builder init:', error);
        }
    }
    
    createTemplateCards() {
        const templateGrid = document.querySelector('.template-grid');
        if (!templateGrid) {
            console.error('Template grid not found');
            return;
        }
        
        templateGrid.innerHTML = '';
        
        Object.keys(this.templates).forEach(templateKey => {
            const template = this.templates[templateKey];
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card';
            templateCard.dataset.template = templateKey;
            templateCard.dataset.color = 'blue';
            
            templateCard.innerHTML = `
                <div class="template-preview ${templateKey}-template blue-scheme">
                    <div class="preview-header">
                        <div class="preview-name">John Doe</div>
                        <div class="preview-title">Software Engineer</div>
                    </div>
                    <div class="preview-section">
                        <div class="preview-item"></div>
                        <div class="preview-item"></div>
                        <div class="preview-item"></div>
                    </div>
                </div>
                <div class="template-info">
                    <h4>${template.name}</h4>
                    <p>${template.description}</p>
                </div>
            `;
            
            templateGrid.appendChild(templateCard);
        });
        
        // Select the first template by default
        const firstCard = templateGrid.querySelector('.template-card');
        if (firstCard) {
            firstCard.classList.add('selected');
        }
        
        // Select the first color by default
        const firstColor = document.querySelector('.color-option');
        if (firstColor) {
            firstColor.classList.add('selected');
        }
    }
    
    setupEventListeners() {
        // Template selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.template-card')) {
                const card = e.target.closest('.template-card');
                this.selectTemplate(card.dataset.template, card.dataset.color);
            }
            
            if (e.target.closest('.color-option')) {
                const colorOption = e.target.closest('.color-option');
                this.selectColor(colorOption.dataset.color);
            }
            
            if (e.target.closest('.tab-btn')) {
                const tabBtn = e.target.closest('.tab-btn');
                this.switchTab(tabBtn.dataset.tab);
            }
        });
        
        // Form input listeners
        document.addEventListener('input', (e) => {
            if (e.target.id) {
                this.updateResumeData(e.target);
            }
        });
        
        // Add/remove buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-btn')) {
                if (e.target.textContent.includes('Experience')) {
                    this.addExperience();
                } else if (e.target.textContent.includes('Education')) {
                    this.addEducation();
                } else if (e.target.textContent.includes('Project')) {
                    this.addProject();
                }
            }
            
            if (e.target.classList.contains('remove-btn')) {
                e.target.closest('.experience-item, .education-item, .project-item').remove();
                this.generateResumePreview();
            }
        });
    }
    
    selectTemplate(template, color) {
        this.currentTemplate = template;
        this.currentColor = color;
        
        // Update UI
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-template="${template}"]`).classList.add('selected');
        
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-color="${color}"]`).classList.add('selected');
        
        this.generateResumePreview();
    }
    
    selectColor(color) {
        this.currentColor = color;
        
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-color="${color}"]`).classList.add('selected');
        
        // Update selected template card color
        const selectedCard = document.querySelector('.template-card.selected');
        if (selectedCard) {
            selectedCard.dataset.color = color;
            const preview = selectedCard.querySelector('.template-preview');
            preview.className = `template-preview ${this.currentTemplate}-template ${color}-scheme`;
        }
        
        this.generateResumePreview();
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }
    
    updateResumeData(input) {
        const field = input.id;
        const value = input.value;
        
        console.log('Updating resume data:', field, value);
        
        if (field in this.resumeData.personal) {
            this.resumeData.personal[field] = value;
        } else if (field === 'technicalSkills') {
            this.resumeData.skills.technical = value;
        } else if (field === 'softSkills') {
            this.resumeData.skills.soft = value;
        } else if (field === 'languages') {
            this.resumeData.skills.languages = value;
        } else if (field === 'certifications') {
            this.resumeData.skills.certifications = value;
        }
        
        this.generateResumePreview();
    }
    
    addExperience() {
        const experienceList = document.getElementById('experienceList');
        const experienceItem = document.createElement('div');
        experienceItem.className = 'experience-item';
        experienceItem.innerHTML = `
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" class="exp-title" placeholder="Software Engineer">
            </div>
            <div class="form-group">
                <label>Company</label>
                <input type="text" class="exp-company" placeholder="Company Name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="month" class="exp-start">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="month" class="exp-end">
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="exp-description" rows="3" placeholder="Describe your responsibilities and achievements..."></textarea>
            </div>
            <button type="button" class="remove-btn" onclick="removeExperience(this)">Remove</button>
        `;
        experienceList.appendChild(experienceItem);
    }
    
    addEducation() {
        const educationList = document.getElementById('educationList');
        const educationItem = document.createElement('div');
        educationItem.className = 'education-item';
        educationItem.innerHTML = `
            <div class="form-group">
                <label>Degree</label>
                <input type="text" class="edu-degree" placeholder="Bachelor of Science">
            </div>
            <div class="form-group">
                <label>Institution</label>
                <input type="text" class="edu-institution" placeholder="University Name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="month" class="edu-start">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="month" class="edu-end">
                </div>
            </div>
            <div class="form-group">
                <label>GPA (Optional)</label>
                <input type="text" class="edu-gpa" placeholder="3.8/4.0">
            </div>
            <button type="button" class="remove-btn" onclick="removeEducation(this)">Remove</button>
        `;
        educationList.appendChild(educationItem);
    }
    
    addProject() {
        const projectsList = document.getElementById('projectsList');
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.innerHTML = `
            <div class="form-group">
                <label>Project Name</label>
                <input type="text" class="proj-name" placeholder="E-commerce Website">
            </div>
            <div class="form-group">
                <label>Technologies Used</label>
                <input type="text" class="proj-tech" placeholder="React, Node.js, MongoDB">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="proj-description" rows="3" placeholder="Describe the project and your role..."></textarea>
            </div>
            <div class="form-group">
                <label>Project URL (Optional)</label>
                <input type="url" class="proj-url" placeholder="https://github.com/username/project">
            </div>
            <button type="button" class="remove-btn" onclick="removeProject(this)">Remove</button>
        `;
        projectsList.appendChild(projectItem);
    }
    
    generateResumePreview() {
        const preview = document.getElementById('resumePreview');
        if (!preview) {
            console.error('Resume preview element not found');
            return;
        }
        
        const colors = this.colorSchemes[this.currentColor];
        
        // Collect form data
        this.collectFormData();
        
        // Generate resume HTML based on template
        const resumeHTML = this.generateResumeHTML(colors);
        preview.innerHTML = resumeHTML;
        
        // Apply template-specific styles
        this.applyTemplateStyles(colors);
        
        console.log('Resume preview generated successfully');
    }
    
    collectFormData() {
        // Collect experience data
        this.resumeData.experience = [];
        document.querySelectorAll('.experience-item').forEach(item => {
            const experience = {
                title: item.querySelector('.exp-title')?.value || '',
                company: item.querySelector('.exp-company')?.value || '',
                startDate: item.querySelector('.exp-start')?.value || '',
                endDate: item.querySelector('.exp-end')?.value || '',
                description: item.querySelector('.exp-description')?.value || ''
            };
            if (experience.title || experience.company) {
                this.resumeData.experience.push(experience);
            }
        });
        
        // Collect education data
        this.resumeData.education = [];
        document.querySelectorAll('.education-item').forEach(item => {
            const education = {
                degree: item.querySelector('.edu-degree')?.value || '',
                institution: item.querySelector('.edu-institution')?.value || '',
                startDate: item.querySelector('.edu-start')?.value || '',
                endDate: item.querySelector('.edu-end')?.value || '',
                gpa: item.querySelector('.edu-gpa')?.value || ''
            };
            if (education.degree || education.institution) {
                this.resumeData.education.push(education);
            }
        });
        
        // Collect projects data
        this.resumeData.projects = [];
        document.querySelectorAll('.project-item').forEach(item => {
            const project = {
                name: item.querySelector('.proj-name')?.value || '',
                technologies: item.querySelector('.proj-tech')?.value || '',
                description: item.querySelector('.proj-description')?.value || '',
                url: item.querySelector('.proj-url')?.value || ''
            };
            if (project.name || project.description) {
                this.resumeData.projects.push(project);
            }
        });
    }
    
    generateResumeHTML(colors) {
        const data = this.resumeData;
        const template = this.currentTemplate;
        
        let html = `
            <div class="resume ${template}-template" style="--primary-color: ${colors.primary}; --secondary-color: ${colors.secondary}; --accent-color: ${colors.accent};">
        `;
        
        // Header section
        html += `
            <div class="resume-header">
                <h1 class="name">${data.personal.fullName || 'Your Name'}</h1>
                <h2 class="title">${data.personal.title || 'Your Title'}</h2>
                <div class="contact-info">
                    ${data.personal.email ? `<span><i class="fas fa-envelope"></i> ${data.personal.email}</span>` : ''}
                    ${data.personal.phone ? `<span><i class="fas fa-phone"></i> ${data.personal.phone}</span>` : ''}
                    ${data.personal.location ? `<span><i class="fas fa-map-marker-alt"></i> ${data.personal.location}</span>` : ''}
                    ${data.personal.linkedin ? `<span><i class="fab fa-linkedin"></i> ${data.personal.linkedin}</span>` : ''}
                    ${data.personal.website ? `<span><i class="fas fa-globe"></i> ${data.personal.website}</span>` : ''}
                </div>
            </div>
        `;
        
        // Summary section
        if (data.personal.summary) {
            html += `
                <div class="resume-section">
                    <h3 class="section-title">Professional Summary</h3>
                    <p class="summary">${data.personal.summary}</p>
                </div>
            `;
        }
        
        // Experience section
        if (data.experience.length > 0) {
            html += `
                <div class="resume-section">
                    <h3 class="section-title">Professional Experience</h3>
            `;
            data.experience.forEach(exp => {
                html += `
                    <div class="experience-item">
                        <div class="experience-header">
                            <h4 class="job-title">${exp.title}</h4>
                            <span class="company">${exp.company}</span>
                            <span class="duration">${this.formatDate(exp.startDate)} - ${exp.endDate ? this.formatDate(exp.endDate) : 'Present'}</span>
                        </div>
                        <p class="description">${exp.description}</p>
                    </div>
                `;
            });
            html += `</div>`;
        }
        
        // Education section
        if (data.education.length > 0) {
            html += `
                <div class="resume-section">
                    <h3 class="section-title">Education</h3>
            `;
            data.education.forEach(edu => {
                html += `
                    <div class="education-item">
                        <div class="education-header">
                            <h4 class="degree">${edu.degree}</h4>
                            <span class="institution">${edu.institution}</span>
                            <span class="duration">${this.formatDate(edu.startDate)} - ${edu.endDate ? this.formatDate(edu.endDate) : 'Present'}</span>
                            ${edu.gpa ? `<span class="gpa">GPA: ${edu.gpa}</span>` : ''}
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        
        // Skills section
        if (data.skills.technical || data.skills.soft || data.skills.languages) {
            html += `
                <div class="resume-section">
                    <h3 class="section-title">Skills</h3>
                    <div class="skills-grid">
            `;
            if (data.skills.technical) {
                html += `
                    <div class="skill-category">
                        <h4>Technical Skills</h4>
                        <p>${data.skills.technical}</p>
                    </div>
                `;
            }
            if (data.skills.soft) {
                html += `
                    <div class="skill-category">
                        <h4>Soft Skills</h4>
                        <p>${data.skills.soft}</p>
                    </div>
                `;
            }
            if (data.skills.languages) {
                html += `
                    <div class="skill-category">
                        <h4>Languages</h4>
                        <p>${data.skills.languages}</p>
                    </div>
                `;
            }
            html += `</div></div>`;
        }
        
        // Projects section
        if (data.projects.length > 0) {
            html += `
                <div class="resume-section">
                    <h3 class="section-title">Projects</h3>
            `;
            data.projects.forEach(proj => {
                html += `
                    <div class="project-item">
                        <div class="project-header">
                            <h4 class="project-name">${proj.name}</h4>
                            ${proj.url ? `<a href="${proj.url}" class="project-url" target="_blank"><i class="fas fa-external-link-alt"></i></a>` : ''}
                        </div>
                        ${proj.technologies ? `<p class="technologies"><strong>Technologies:</strong> ${proj.technologies}</p>` : ''}
                        <p class="description">${proj.description}</p>
                    </div>
                `;
            });
            html += `</div>`;
        }
        
        // Certifications section
        if (data.skills.certifications) {
            html += `
                <div class="resume-section">
                    <h3 class="section-title">Certifications</h3>
                    <p class="certifications">${data.skills.certifications}</p>
                </div>
            `;
        }
        
        html += `</div>`;
        return html;
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString + '-01');
        return JobWalaAPI.formatIndianDate(date);
    }
    
    applyTemplateStyles(colors) {
        const style = document.createElement('style');
        style.textContent = `
            .resume {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #2c3e50;
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            
            .resume-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid var(--primary-color);
            }
            
            .resume-header .name {
                font-size: 2.5rem;
                font-weight: bold;
                color: var(--primary-color);
                margin-bottom: 5px;
            }
            
            .resume-header .title {
                font-size: 1.3rem;
                color: var(--secondary-color);
                margin-bottom: 15px;
                font-weight: 500;
            }
            
            .contact-info {
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                gap: 20px;
                font-size: 0.9rem;
                color: #666;
            }
            
            .contact-info span {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .resume-section {
                margin-bottom: 25px;
            }
            
            .section-title {
                font-size: 1.4rem;
                color: var(--primary-color);
                border-bottom: 2px solid var(--accent-color);
                padding-bottom: 5px;
                margin-bottom: 15px;
                font-weight: 600;
            }
            
            .experience-item, .education-item, .project-item {
                margin-bottom: 20px;
            }
            
            .experience-header, .education-header, .project-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                flex-wrap: wrap;
                margin-bottom: 8px;
            }
            
            .job-title, .degree, .project-name {
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--secondary-color);
                margin: 0;
            }
            
            .company, .institution {
                color: var(--primary-color);
                font-weight: 500;
            }
            
            .duration, .gpa {
                color: #666;
                font-size: 0.9rem;
            }
            
            .description {
                margin: 0;
                color: #555;
            }
            
            .skills-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
            }
            
            .skill-category h4 {
                color: var(--primary-color);
                margin-bottom: 5px;
                font-size: 1rem;
            }
            
            .skill-category p {
                margin: 0;
                color: #555;
            }
            
            .technologies {
                font-size: 0.9rem;
                color: #666;
                margin: 5px 0;
            }
            
            .project-url {
                color: var(--primary-color);
                text-decoration: none;
            }
            
            .project-url:hover {
                text-decoration: underline;
            }
            
            .summary {
                font-style: italic;
                color: #555;
                margin: 0;
            }
            
            .certifications {
                margin: 0;
                color: #555;
            }
            
            /* Template-specific styles */
            .modern-template .resume-header {
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                margin: -40px -40px 30px -40px;
                padding: 40px;
            }
            
            .modern-template .resume-header .name,
            .modern-template .resume-header .title {
                color: white;
            }
            
            .modern-template .resume-header .contact-info {
                color: rgba(255, 255, 255, 0.9);
            }
            
            .creative-template .section-title {
                background: var(--primary-color);
                color: white;
                padding: 8px 15px;
                margin: 0 -15px 15px -15px;
                border-radius: 5px;
            }
            
            .minimal-template .resume-header {
                border-bottom: 1px solid #ddd;
                padding-bottom: 20px;
            }
            
            .minimal-template .section-title {
                border-bottom: 1px solid var(--primary-color);
                padding-bottom: 5px;
            }
            
            .executive-template .resume-header .name {
                font-size: 3rem;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            .tech-template .section-title {
                background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
                color: white;
                padding: 8px 15px;
                margin: 0 -15px 15px -15px;
                border-radius: 5px;
            }
            
            .academic-template .resume-header {
                background: var(--primary-color);
                color: white;
                margin: -40px -40px 30px -40px;
                padding: 40px;
            }
            
            .academic-template .resume-header .name,
            .academic-template .resume-header .title {
                color: white;
            }
            
            .academic-template .resume-header .contact-info {
                color: rgba(255, 255, 255, 0.9);
            }
            
            .artistic-template .resume-header {
                background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
                color: white;
                margin: -40px -40px 30px -40px;
                padding: 40px;
            }
            
            .artistic-template .resume-header .name,
            .artistic-template .resume-header .title {
                color: white;
            }
            
            .artistic-template .resume-header .contact-info {
                color: rgba(255, 255, 255, 0.9);
            }
            
            .corporate-template .resume-header {
                background: var(--primary-color);
                color: white;
                margin: -40px -40px 30px -40px;
                padding: 40px;
            }
            
            .corporate-template .resume-header .name,
            .corporate-template .resume-header .title {
                color: white;
            }
            
            .corporate-template .resume-header .contact-info {
                color: rgba(255, 255, 255, 0.9);
            }
            
            .startup-template .resume-header {
                background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                color: white;
                margin: -40px -40px 30px -40px;
                padding: 40px;
            }
            
            .startup-template .resume-header .name,
            .startup-template .resume-header .title {
                color: white;
            }
            
            .startup-template .resume-header .contact-info {
                color: rgba(255, 255, 255, 0.9);
            }
        `;
        
        // Remove existing template styles
        const existingStyle = document.getElementById('template-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        style.id = 'template-styles';
        document.head.appendChild(style);
    }
}

// Global functions for HTML onclick handlers
function removeExperience(button) {
    button.closest('.experience-item').remove();
    resumeBuilder.generateResumePreview();
}

function removeEducation(button) {
    button.closest('.education-item').remove();
    resumeBuilder.generateResumePreview();
}

function removeProject(button) {
    button.closest('.project-item').remove();
    resumeBuilder.generateResumePreview();
}

function addExperience() {
    resumeBuilder.addExperience();
}

function addEducation() {
    resumeBuilder.addEducation();
}

function addProject() {
    resumeBuilder.addProject();
}

function downloadPDF() {
    const resumeElement = document.getElementById('resumePreview');
    const { jsPDF } = window.jspdf;
    
    html2canvas(resumeElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        pdf.save('resume.pdf');
    });
}

function saveResume() {
    const resumeData = resumeBuilder.resumeData;
    const template = resumeBuilder.currentTemplate;
    const color = resumeBuilder.currentColor;
    
    const resumeToSave = {
        data: resumeData,
        template: template,
        color: color,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('savedResume', JSON.stringify(resumeToSave));
    alert('Resume saved successfully!');
}

function loadResume() {
    const savedResume = localStorage.getItem('savedResume');
    if (savedResume) {
        const resumeData = JSON.parse(savedResume);
        resumeBuilder.resumeData = resumeData.data;
        resumeBuilder.currentTemplate = resumeData.template;
        resumeBuilder.currentColor = resumeData.color;
        
        // Update form fields
        Object.keys(resumeData.data.personal).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = resumeData.data.personal[key];
            }
        });
        
        // Update skills
        Object.keys(resumeData.data.skills).forEach(key => {
            const input = document.getElementById(key === 'technical' ? 'technicalSkills' : 
                                                   key === 'soft' ? 'softSkills' : 
                                                   key === 'languages' ? 'languages' : 'certifications');
            if (input) {
                input.value = resumeData.data.skills[key];
            }
        });
        
        resumeBuilder.generateResumePreview();
        alert('Resume loaded successfully!');
    } else {
        alert('No saved resume found!');
    }
}

// Preview Control Functions
function zoomIn() {
    resumeBuilder.zoomLevel = Math.min(resumeBuilder.zoomLevel + 25, 200);
    updateZoom();
}

function zoomOut() {
    resumeBuilder.zoomLevel = Math.max(resumeBuilder.zoomLevel - 25, 50);
    updateZoom();
}

function updateZoom() {
    const preview = document.getElementById('resumePreview');
    const zoomLevel = document.getElementById('zoomLevel');
    
    preview.style.transform = `scale(${resumeBuilder.zoomLevel / 100})`;
    zoomLevel.textContent = `${resumeBuilder.zoomLevel}%`;
}

function resetPreview() {
    resumeBuilder.zoomLevel = 100;
    updateZoom();
}

function toggleFullscreen() {
    const previewContainer = document.querySelector('.resume-preview-container');
    const fullscreenBtn = document.querySelector('[onclick="toggleFullscreen()"]');
    
    if (!resumeBuilder.isFullscreen) {
        previewContainer.style.position = 'fixed';
        previewContainer.style.top = '0';
        previewContainer.style.left = '0';
        previewContainer.style.width = '100vw';
        previewContainer.style.height = '100vh';
        previewContainer.style.zIndex = '9999';
        previewContainer.style.background = 'white';
        previewContainer.style.padding = '20px';
        previewContainer.style.overflow = 'auto';
        
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        resumeBuilder.isFullscreen = true;
    } else {
        previewContainer.style.position = '';
        previewContainer.style.top = '';
        previewContainer.style.left = '';
        previewContainer.style.width = '';
        previewContainer.style.height = '';
        previewContainer.style.zIndex = '';
        previewContainer.style.background = '#f8f9fa';
        previewContainer.style.padding = '20px';
        previewContainer.style.overflow = '';
        
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        resumeBuilder.isFullscreen = false;
    }
}

function printResume() {
    const resumeElement = document.getElementById('resumePreview');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Resume - Print</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background: white;
                    }
                    .resume { 
                        max-width: 800px; 
                        margin: 0 auto; 
                        background: white;
                        padding: 40px;
                        box-shadow: none;
                    }
                    @media print {
                        body { margin: 0; padding: 0; }
                        .resume { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                ${resumeElement.outerHTML}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Initialize the resume builder when the page loads
let resumeBuilder;
document.addEventListener('DOMContentLoaded', () => {
    try {
        resumeBuilder = new ResumeBuilder();
        
        // Add load button to preview header if it exists
        setTimeout(() => {
            const previewHeader = document.querySelector('.preview-header');
            const previewActions = document.querySelector('.preview-actions');
            
            if (previewHeader && previewActions) {
                const loadBtn = document.createElement('button');
                loadBtn.className = 'btn-secondary';
                loadBtn.innerHTML = '<i class="fas fa-upload"></i> Load Resume';
                loadBtn.onclick = loadResume;
                previewActions.appendChild(loadBtn);
            }
        }, 100);
        
        console.log('Resume Builder initialized successfully');
    } catch (error) {
        console.error('Error initializing Resume Builder:', error);
    }
});
