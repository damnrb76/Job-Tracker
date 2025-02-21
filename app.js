// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');
    let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    let cvs = JSON.parse(localStorage.getItem('cvs') || '[]');
    let activeTab = 'jobs'; // Default tab

    // Function to create navigation tabs
    function createNavigation() {
        return `
            <div class="nav-tabs">
                <button 
                    class="tab-button ${activeTab === 'jobs' ? 'active' : ''}"
                    onclick="switchTab('jobs')"
                >
                    Job Applications
                </button>
                <button 
                    class="tab-button ${activeTab === 'cvs' ? 'active' : ''}"
                    onclick="switchTab('cvs')"
                >
                    CV Manager
                </button>
            </div>
        `;
    }

    // Function to create job form
    function createJobForm() {
        return `
            <form id="jobForm" class="job-form">
                <h2>Add New Job Application</h2>
                <div class="form-group">
                    <label for="company">Company Name</label>
                    <input type="text" placeholder="Enter company name" id="company" class="input-field" required>
                </div>

                <div class="form-group">
                    <label for="position">Position</label>
                    <input type="text" placeholder="Enter job title" id="position" class="input-field" required>
                </div>

                <div class="form-group">
                    <label for="salary">Salary</label>
                    <input type="text" placeholder="Expected salary" id="salary" class="input-field">
                </div>

                <div class="form-group">
                    <label for="location">Location</label>
                    <input type="text" placeholder="Job location" id="location" class="input-field">
                </div>

                <div class="form-group">
                    <label for="applicationDate">Application Date</label>
                    <input type="date" id="applicationDate" class="input-field" required>
                </div>

                <div class="form-group">
                    <label for="status">Status</label>
                    <select id="status" class="input-field">
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview Scheduled</option>
                        <option value="Offer">Offer Received</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Following">Following Up</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="notes">Notes</label>
                    <textarea id="notes" placeholder="Add any important notes or reminders" class="input-field" rows="3"></textarea>
                </div>

                <button type="submit" class="button">Save Application</button>
            </form>
        `;
    }

    // Function to create CV form
    function createCVForm() {
        return `
            <form id="cvForm" class="cv-form job-form">
                <h2>Add New CV Version</h2>
                <div class="form-group">
                    <label for="cvTitle">CV Title/Version</label>
                    <input type="text" id="cvTitle" class="input-field" placeholder="e.g., Program Director CV" required>
                </div>
                <div class="form-group">
                    <label for="targetRole">Target Role</label>
                    <input type="text" id="targetRole" class="input-field" placeholder="e.g., Program Director, Change Manager" required>
                </div>
                <div class="form-group">
                    <label for="keySkills">Key Skills Highlighted</label>
                    <textarea id="keySkills" class="input-field" rows="3" placeholder="List main skills emphasized in this version"></textarea>
                </div>
                <div class="form-group">
                    <label for="cvNotes">Notes</label>
                    <textarea id="cvNotes" class="input-field" rows="3" placeholder="Any specific changes or focus areas"></textarea>
                </div>
                <div class="form-group">
                    <label for="lastUpdated">Last Updated</label>
                    <input type="date" id="lastUpdated" class="input-field" required>
                </div>
                <button type="submit" class="button">Save CV Version</button>
            </form>
        `;
    }

    // Function to create job list HTML
    function createJobList() {
        if (jobs.length === 0) {
            return '<p class="no-jobs">No jobs added yet. Add your first job application above!</p>';
        }

        return jobs.map((job, index) => `
            <div class="job-card status-${job.status.toLowerCase()}">
                <div class="job-header">
                    <h3>${job.company}</h3>
                    <span class="status-badge">${job.status}</span>
                </div>
                <div class="job-details">
                    <p class="position-title">${job.position}</p>
                    ${job.salary ? `<p class="salary"><strong>Salary:</strong> ${job.salary}</p>` : ''}
                    ${job.location ? `<p class="location"><strong>Location:</strong> ${job.location}</p>` : ''}
                    <p class="date"><strong>Applied:</strong> ${formatDate(job.applicationDate)}</p>
                    ${job.notes ? `
                        <div class="notes">
                            <strong>Notes:</strong>
                            <p>${job.notes}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="job-actions">
                    <button onclick="editJob(${index})" class="edit-button">Edit</button>
                    <button onclick="deleteJob(${index})" class="delete-button">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Function to create CV list
    function createCVList() {
        if (cvs.length === 0) {
            return '<p class="no-jobs">No CV versions added yet. Add your first CV version above!</p>';
        }

        return cvs.map((cv, index) => `
            <div class="job-card cv-card">
                <div class="job-header">
                    <h3>${cv.title}</h3>
                    <span class="date-badge">Updated: ${formatDate(cv.lastUpdated)}</span>
                </div>
                <div class="job-details">
                    <p><strong>Target Role:</strong> ${cv.targetRole}</p>
                    ${cv.keySkills ? `
                        <div class="skills-section">
                            <strong>Key Skills:</strong>
                            <p>${cv.keySkills}</p>
                        </div>
                    ` : ''}
                    ${cv.notes ? `
                        <div class="notes">
                            <strong>Notes:</strong>
                            <p>${cv.notes}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="job-actions">
                    <button onclick="editCV(${index})" class="edit-button">Edit</button>
                    <button onclick="deleteCV(${index})" class="delete-button">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Format date for display
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    }

    // Function to render CV manager
    function renderCVManager() {
        return `
            <div class="cv-manager">
                ${createCVForm()}
                <div id="cvList">
                    ${createCVList()}
                </div>
            </div>
        `;
    }

    // Function to render the entire app
    function renderApp() {
        root.innerHTML = `
            <div class="header">
                <h1>Job Search Manager</h1>
                ${createNavigation()}
            </div>
            <div class="container">
                ${activeTab === 'jobs' ? 
                    `${createJobForm()}
                    <div id="jobsList">${createJobList()}</div>` : 
                    renderCVManager()
                }
            </div>
        `;

        // Set up event listeners based on active tab
        if (activeTab === 'jobs') {
            setupJobFormListener();
        } else {
            setupCVFormListener();
        }
    }

    // Setup job form listener
    function setupJobFormListener() {
        document.getElementById('jobForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const newJob = {
                company: document.getElementById('company').value,
                position: document.getElementById('position').value,
                salary: document.getElementById('salary').value,
                location: document.getElementById('location').value,
                applicationDate: document.getElementById('applicationDate').value,
                status: document.getElementById('status').value,
                notes: document.getElementById('notes').value
            };
            jobs.unshift(newJob);
            localStorage.setItem('jobs', JSON.stringify(jobs));
            renderApp();
            e.target.reset();
        });
    }

    // Setup CV form listener
    function setupCVFormListener() {
        document.getElementById('cvForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const newCV = {
                title: document.getElementById('cvTitle').value,
                targetRole: document.getElementById('targetRole').value,
                keySkills: document.getElementById('keySkills').value,
                notes: document.getElementById('cvNotes').value,
                lastUpdated: document.getElementById('lastUpdated').value
            };
            cvs.unshift(newCV);
            localStorage.setItem('cvs', JSON.stringify(cvs));
            renderApp();
            e.target.reset();
        });
    }

    // Global functions for tab switching and job/CV management
    window.switchTab = function(tab) {
        activeTab = tab;
        renderApp();
    };

    window.editJob = function(index) {
        const job = jobs[index];
        document.getElementById('company').value = job.company;
        document.getElementById('position').value = job.position;
        document.getElementById('salary').value = job.salary;
        document.getElementById('location').value = job.location;
        document.getElementById('applicationDate').value = job.applicationDate;
        document.getElementById('status').value = job.status;
        document.getElementById('notes').value = job.notes;
        
        jobs.splice(index, 1);
        localStorage.setItem('jobs', JSON.stringify(jobs));
        document.getElementById('jobForm').scrollIntoView({ behavior: 'smooth' });
    };

    window.deleteJob = function(index) {
        if (confirm('Are you sure you want to delete this job application?')) {
            jobs.splice(index, 1);
            localStorage.setItem('jobs', JSON.stringify(jobs));
            renderApp();
        }
    };

    window.editCV = function(index) {
        const cv = cvs[index];
        document.getElementById('cvTitle').value = cv.title;
        document.getElementById('targetRole').value = cv.targetRole;
        document.getElementById('keySkills').value = cv.keySkills;
        document.getElementById('cvNotes').value = cv.notes;
        document.getElementById('lastUpdated').value = cv.lastUpdated;
        
        cvs.splice(index, 1);
        localStorage.setItem('cvs', JSON.stringify(cvs));
        document.getElementById('cvForm').scrollIntoView({ behavior: 'smooth' });
    };

    window.deleteCV = function(index) {
        if (confirm('Are you sure you want to delete this CV version?')) {
            cvs.splice(index, 1);
            localStorage.setItem('cvs', JSON.stringify(cvs));
            renderApp();
        }
    };

    // Initial render
    renderApp();
});
