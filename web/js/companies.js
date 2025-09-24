// Companies Page JavaScript
let allCompanies = [];
let filteredCompanies = [];
let searchTimeout;

// Dynamic search functionality
function initializeSearch() {
    const searchInput = document.getElementById('companySearchInput');
    const industryFilter = document.getElementById('companyIndustryFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('focus', handleSearchFocus);
        searchInput.addEventListener('blur', handleSearchBlur);
    }
    
    if (industryFilter) {
        industryFilter.addEventListener('change', handleIndustryFilter);
    }
}

function handleSearchInput(e) {
    const query = e.target.value.toLowerCase().trim();
    
    // Clear previous timeout
    clearTimeout(searchTimeout);
    
    // Add loading state
    e.target.style.background = 'rgba(102, 126, 234, 0.1)';
    
    // Debounce search
    searchTimeout = setTimeout(() => {
        filterCompanies(query, document.getElementById('companyIndustryFilter').value);
        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
    }, 300);
}

function handleSearchFocus(e) {
    e.target.parentElement.style.transform = 'scale(1.02)';
    e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
}

function handleSearchBlur(e) {
    e.target.parentElement.style.transform = 'scale(1)';
    e.target.parentElement.style.boxShadow = 'none';
}

function handleIndustryFilter(e) {
    const industry = e.target.value;
    const searchQuery = document.getElementById('companySearchInput').value.toLowerCase().trim();
    filterCompanies(searchQuery, industry);
}

function filterCompanies(searchQuery, industry) {
    filteredCompanies = allCompanies.filter(company => {
        const matchesSearch = !searchQuery || 
            company.name.toLowerCase().includes(searchQuery) ||
            company.description.toLowerCase().includes(searchQuery);
        
        const matchesIndustry = !industry || company.industry === industry;
        
        return matchesSearch && matchesIndustry;
    });
    
    displayCompanies();
    updateSearchResults();
}

function updateSearchResults() {
    const resultsCount = document.getElementById('searchResultsCount');
    if (resultsCount) {
        resultsCount.textContent = `${filteredCompanies.length} companies found`;
    }
}

// Load companies from jobs data
async function loadCompanies() {
    try {
        console.log('Loading companies from jobs data...');
        
        // First load jobs to extract companies
        const response = await window.api.getJobs({ page: 1, limit: 100 });
        
        if (response.jobs && response.jobs.length > 0) {
            // Extract unique companies from jobs
            const companyMap = new Map();
            
            response.jobs.forEach(job => {
                if (job.company && job.company.name) {
                    const companyName = job.company.name;
                    if (!companyMap.has(companyName)) {
                        companyMap.set(companyName, {
                            name: companyName,
                            industry: job.company.industry || 'Technology',
                            description: job.company.description || 'Leading company in the industry',
                            jobs: [],
                            totalJobs: 0,
                            rating: Math.random() * 2 + 3, // Random rating between 3-5
                            logo: job.company.logo || null
                        });
                    }
                    
                    // Add job to company
                    const company = companyMap.get(companyName);
                    company.jobs.push(job);
                    company.totalJobs++;
                }
            });
            
            allCompanies = Array.from(companyMap.values());
            filteredCompanies = [...allCompanies];
            
            console.log('Loaded companies:', allCompanies.length);
            displayCompanies();
            initializeSearch();
        } else {
            showNoCompaniesMessage();
        }
    } catch (error) {
        console.error('Error loading companies:', error);
        showNoCompaniesMessage();
    }
}

// Display companies
function displayCompanies() {
    const companiesGrid = document.getElementById('companiesGrid');
    const loadingIndicator = document.getElementById('companiesLoading');
    const noCompaniesMessage = document.getElementById('noCompaniesFound');
    
    // Hide loading indicator
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    if (filteredCompanies.length === 0) {
        if (noCompaniesMessage) {
            noCompaniesMessage.style.display = 'block';
        }
        if (companiesGrid) {
            companiesGrid.innerHTML = '';
        }
        return;
    }
    
    // Hide no companies message
    if (noCompaniesMessage) {
        noCompaniesMessage.style.display = 'none';
    }
    
    // Display companies
    if (companiesGrid) {
        companiesGrid.innerHTML = filteredCompanies.map(company => createCompanyCard(company)).join('');
    }
}

// Create company card HTML
function createCompanyCard(company) {
    const firstLetter = company.name.charAt(0).toUpperCase();
    const stars = '★'.repeat(Math.floor(company.rating)) + '☆'.repeat(5 - Math.floor(company.rating));
    
    return `
        <div class="company-card" onclick="viewCompanyJobs('${company.name}')">
            <div class="company-header">
                <div class="company-logo">
                    ${firstLetter}
                </div>
                <div class="company-info">
                    <h3>${company.name}</h3>
                    <p class="company-industry">${company.industry}</p>
                </div>
            </div>
            <div class="company-stats">
                <span class="company-jobs">${company.totalJobs} open position${company.totalJobs !== 1 ? 's' : ''}</span>
                <div class="company-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating">${company.rating.toFixed(1)}/5</span>
                </div>
            </div>
            <div class="company-description">
                ${company.description}
            </div>
            <div class="company-actions">
                <button class="btn-view-jobs" onclick="event.stopPropagation(); viewCompanyJobs('${company.name}')">
                    View Jobs
                </button>
            </div>
        </div>
    `;
}

// View jobs for a specific company
function viewCompanyJobs(companyName) {
    console.log('Viewing jobs for company:', companyName);
    
    // Navigate to jobs page with company filter
    window.location.href = `jobs.html?company=${encodeURIComponent(companyName)}`;
}

// Company search functionality
function performCompanySearch() {
    const searchTerm = document.getElementById('companySearchInput').value.trim().toLowerCase();
    const industry = document.getElementById('companyIndustryFilter').value;
    
    console.log('Company search:', { searchTerm, industry });
    
    // Filter companies
    filteredCompanies = allCompanies.filter(company => {
        const matchesSearch = !searchTerm || company.name.toLowerCase().includes(searchTerm);
        const matchesIndustry = !industry || company.industry === industry;
        return matchesSearch && matchesIndustry;
    });
    
    displayCompanies();
}

// Clear company search
function clearCompanySearch() {
    document.getElementById('companySearchInput').value = '';
    document.getElementById('companyIndustryFilter').value = '';
    filteredCompanies = [...allCompanies];
    displayCompanies();
}

// Show no companies message
function showNoCompaniesMessage() {
    const loadingIndicator = document.getElementById('companiesLoading');
    const noCompaniesMessage = document.getElementById('noCompaniesFound');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    if (noCompaniesMessage) {
        noCompaniesMessage.style.display = 'block';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadCompanies();
    
    // Add event listeners for search
    const searchInput = document.getElementById('companySearchInput');
    const industryFilter = document.getElementById('companyIndustryFilter');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performCompanySearch();
            }
        });
    }
    
    if (industryFilter) {
        industryFilter.addEventListener('change', function() {
            performCompanySearch();
        });
    }
});
