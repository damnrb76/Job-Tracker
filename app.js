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

    // Enhanced CV form with file upload and folder selection
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
                <div class="form-group">
                    <label for="lastUpdated">Last Updated</label>
                    <input type="date" id="lastUpdated" class="input-field" required>
                </div>
                <button type="submit" class="button">Save CV Version</button>
            </form>
        `;
    }

    // Cover Letter form
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
                    <label for="company">Company</label>
                    <input type="text" id="letterCompany" class="input-field" placeholder="Company name" required>
                </div>
                <div class="form-group">
                    <label for="letterNotes">Key Points</label>
                    <textarea id="letterNotes" class="input-field" rows="3" placeholder="Main points emphasized in this version"></textarea>
                </div>
                <div class="form-group">
                    <label for="letterDate">Created Date</label>
                    <input type="date" id="letterDate" class="input-field" required>
                </div>
                <button type="submit" class="button">Save Cover Letter</button>
            </form>
        `;
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

    // Updated CV list with folder organization
    function createCVList() {
        if (cvs.length === 0) {
            return '<p class="no-items">No CV versions added yet. Add your first CV version above!</p>';
        }
        return createFolderView(cvs, 'cv');
    }

    // Cover Letter list
    function createCoverLetterList() {
        if (coverLetters.length === 0) {
            return '<p class="no-items">No cover letters added yet. Add your first cover letter above!</p>';
        }
        return createFolderView(coverLetters, 'cover-letter');
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

    // Setup CV form listener with file handling
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
                    lastUpdated: document.getElementById('lastUpdated').value,
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
                    createdDate: document.getElementById('letterDate').value,
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

    // Render the entire app
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
                    `${createCVForm()}
                    <div id="cvList">${createCVList()}</div>` :
                    `${createCoverLetterForm()}
                    <div id="coverLetterList">${createCoverLetterList()}</div>`
                }
            </div>
        `;

        // Set up appropriate event listeners
        if (activeTab === 'jobs') {
            setupJobFormListener();
        } else if (activeTab === 'cvs') {
            setupCVFormListener();
        } else {
            setupCoverLetterFormListener();
        }
    }

    // Global functions
    window.switchTab = function(tab) {
        activeTab = tab;
        renderApp();
    };

    // Add other existing global functions (editJob, deleteJob, etc.)
    [Previous global functions remain the same...]

    // Initial render
    renderApp();
});
