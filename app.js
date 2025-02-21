// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');
    let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    let cvs = JSON.parse(localStorage.getItem('cvs') || '[]');
    let coverLetters = JSON.parse(localStorage.getItem('coverLetters') || '[]');
    let activeTab = 'jobs';
    
    const FOLDERS = {
        'Leadership': [],
        'Customer Success/Manager': [],
        'Service Delivery Management': [],
        'Transformational': []
    };

    // Function to create navigation tabs
    function createNavigation() {
        return `
            <div class="nav-tabs">
                <button class="tab-button ${activeTab === 'jobs' ? 'active' : ''}" onclick="switchTab('jobs')">
                    Job Applications
                </button>
                <button class="tab-button ${activeTab === 'cvs' ? 'active' : ''}" onclick="switchTab('cvs')">
                    CV Manager
                </button>
                <button class="tab-button ${activeTab === 'coverLetters' ? 'active' : ''}" onclick="switchTab('coverLetters')">
                    Cover Letters
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
                    <label for="cvFolder">Category</label>
                    <select id="cvFolder" class="input-field" required>
                        ${Object.keys(FOLDERS).map(folder => 
                            `<option value="${folder}">${folder}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="cvFile">Upload CV (DOCX)</label>
                    <input type="file" id="cvFile" class="input-field" accept=".docx" required>
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
                <button type="submit" class="button">Save CV Version</button>
            </form>
        `;
    }

    // Function to create Cover Letter form
    function createCoverLetterForm() {
        return `
            <form id="coverLetterForm" class="cv-form job-form">
                <h2>Add New Cover Letter</h2>
                <div class="form-group">
                    <label for="letterTitle">Cover Letter Title</label>
                    <input type="text" id="letterTitle" class="input-field" placeholder="e.g., Program Director - Company X" required>
                </div>
                <div class="form-group">
                    <label for="letterFolder">Category</label>
                    <select id="letterFolder" class="input-field" required>
                        ${Object.keys(FOLDERS).map(folder => 
                            `<option value="${folder}">${folder}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="letterFile">Upload Cover Letter (DOCX)</label>
                    <input type="file" id="letterFile" class="input-field" accept=".docx" required>
                </div>
                <div class="form-group">
                    <label for="letterCompany">Company</label>
                    <input type="text" id="letterCompany" class="input-field" placeholder="Company name" required>
                </div>
                <div class="form-group">
                    <label for="letterNotes">Key Points</label>
                    <textarea id="letterNotes" class="input-field" rows="3" placeholder="Main points emphasized in this version"></textarea>
                </div>
                <button type="submit" class="button">Save Cover Letter</button>
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

    // Function to create folder view
    function createFolderView(items, type) {
        const itemsByFolder = Object.keys(FOLDERS).reduce((acc, folder) => {
            acc[folder] = items.filter(item => item.folder === folder);
            return acc;
        }, {});

        return Object.entries(itemsByFolder).map(([folder, folderItems]) => `
            <div class="folder-section">
                <h3 class="folder-title">${folder}</h3>
                <div class="folder-content">
                    ${folderItems.length === 0 ? 
                        `<p class="no-items">No ${type} in this folder</p>` :
                        folderItems.map((item, index) => `
                            <div class="job-card ${type}-card">
                                <div class="job-header">
                                    <h3>${item.title}</h3>
                                    <span class="date-badge">Updated: ${formatDate(item.lastUpdated || item.createdDate)}</span>
                                </div>
                                <div class="job-details">
                                    ${type === 'cv' ? `
                                        <p><strong>Target Role:</strong> ${item.targetRole}</p>
                                        ${item.keySkills ? `
                                            <div class="skills-section">
                                                <strong>Key Skills:</strong>
                                                <p>${item.keySkills}</p>
                                            </div>
                                        ` : ''}
                                    ` : `
                                        <p><strong>Company:</strong> ${item.company}</p>
                                    `}
                                    ${item.notes ? `
                                        <div class="notes">
                                            <strong>Notes:</strong>
                                            <p>${item.notes}</p>
                                        </div>
                                    ` : ''}
                                    ${item.fileName ? `
                                        <div class="file-info">
                                            <strong>File:</strong> ${item.fileName}
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="job-actions">
                                    <button onclick="${type === 'cv' ? 'editCV' : 'editCoverLetter'}(${index})" class="edit-button">Edit</button>
                                    <button onclick="${type === 'cv' ? 'deleteCV' : 'deleteCoverLetter'}(${index})" class="delete-button">Delete</button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `).join('');
    }

    // Function to create CV list
    function createCVList() {
        if (cvs.length === 0) {
            return '<p class="no-items">No CV versions added yet. Add your first CV version above!</p>';
        }
        return createFolderView(cvs, 'cv');
    }

    // Function to create Cover Letter list
    function createCoverLetterList() {
        if (coverLetters.length === 0) {
            return '<p class="no-items">No cover letters added yet. Add your first cover letter above!</p>';
        }
        return createFolderView(coverLetters, 'cover-letter');
    }

    // Format date for display
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    }

    // Function to handle file uploads
    async function handleFileUpload(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
                name: file.name,
                content: reader.result
            });
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
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
        document.getElementById('cvForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const fileInput = document.getElementById('cvFile');
            if (fileInput.files.length > 0) {
                const fileData = await handleFileUpload(fileInput.files[0]);
                const newCV = {
                    title: document.getElementById('cvTitle').value,
                    folder: document.getElementById('cvFolder').value,
                    targetRole: document.getElementById('targetRole').value,
                    keySkills: document.getElementById('keySkills').value,
                    notes: document.getElementById('cvNotes').value,
                    lastUpdated: new Date().toISOString().split('T')[0],
                    fileName: fileData.name,
                    fileContent: fileData.content
                };
                cvs.unshift(newCV);
                localStorage.setItem('cvs', JSON.stringify(cvs));
                renderApp();
                e.target.reset();
            }
        });
    }

    // Setup Cover Letter form listener
    function setupCoverLetterFormListener() {
        document.getElementById('coverLetterForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const fileInput = document.getElementById('letterFile');
            if (fileInput.files.length > 0) {
                const fileData = await handleFileUpload(fileInput.files[0]);
                const newLetter = {
                    title: document.getElementById('letterTitle').value,
                    folder: document.getElementById('letterFolder').value,
                    company: document.getElementById('letterCompany').value,
                    notes: document.getElementById('letterNotes').value,
                    createdDate: new Date().toISOString().split('T')[0],
                    fileName: fileData.name,
                    fileContent: fileData.content
                };
                coverLetters.unshift(newLetter);
                localStorage.setItem('coverLetters', JSON.stringify(coverLetters));
                renderApp();
                e.target.reset();
            }
        });
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
                    activeTab === 'cvs' ? 
                    `
