document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements and initialize jobs array from localStorage
    const app = document.getElementById('app');
    let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');

    // Main render function
    function renderApp() {
        app.innerHTML = `
            <div class="header">
                <div class="container">
                    <h1>Job Search Tracker</h1>
                </div>
            </div>
            <div class="container">
                <form id="jobForm" class="job-form">
                    <h2>Add New Application</h2>
                    <div class="form-group">
                        <label for="company">Company</label>
                        <input type="text" id="company" class="input-field" placeholder="Enter company name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="position">Position</label>
                        <input type="text" id="position" class="input-field" placeholder="Enter job title" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group half">
                            <label for="salary">Salary</label>
                            <input type="text" id="salary" class="input-field" placeholder="£ Expected salary">
                        </div>
                        
                        <div class="form-group half">
                            <label for="location">Location</label>
                            <input type="text" id="location" class="input-field" placeholder="Job location">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="applicationDate">Application Date</label>
                        <input type="date" id="applicationDate" class="input-field" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="followUpDate">Follow-up Date</label>
                        <input type="date" id="followUpDate" class="input-field">
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
                        <textarea id="notes" class="input-field" placeholder="Add any important notes or reminders"></textarea>
                    </div>

                    <button type="submit" class="button">Save Application</button>
                </form>

                <div id="jobsList"></div>
            </div>
        `;

        renderJobs();
        setupEventListeners();
    }

    // Render jobs list
    function renderJobs() {
        const jobsList = document.getElementById('jobsList');
        if (jobs.length === 0) {
            jobsList.innerHTML = '<p class="no-jobs">No job applications yet. Add your first one above!</p>';
            return;
        }

        jobsList.innerHTML = jobs.map((job, index) => `
            <div class="job-card status-${job.status.toLowerCase()}">
                <div class="job-header">
                    <h3>${job.company}</h3>
                    <div class="job-actions">
                        <button onclick="editJob(${index})" class="edit-button">Edit</button>
                        <button onclick="deleteJob(${index})" class="delete-button">Delete</button>
                    </div>
                </div>
                
                <div class="job-details">
                    <p class="position"><strong>${job.position}</strong></p>
                    ${job.salary ? `<p class="salary">£${job.salary}</p>` : ''}
                    ${job.location ? `<p class="location">${job.location}</p>` : ''}
                    
                    <div class="dates">
                        <p>Applied: ${formatDate(job.applicationDate)}</p>
                        ${job.followUpDate ? `<p>Follow-up: ${formatDate(job.followUpDate)}</p>` : ''}
                    </div>
                    
                    <div class="status-badge ${job.status.toLowerCase()}">
                        ${job.status}
                    </div>
                    
                    ${job.notes ? `
                        <div class="notes">
                            <p>${job.notes}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Setup event listeners
    function setupEventListeners() {
        document.getElementById('jobForm').addEventListener('submit', function(e) {
            e.preventDefault();
            addJob();
        });
    }

    // Add new job
    function addJob() {
        const newJob = {
            company: document.getElementById('company').value,
            position: document.getElementById('position').value,
            salary: document.getElementById('salary').value,
            location: document.getElementById('location').value,
            applicationDate: document.getElementById('applicationDate').value,
            followUpDate: document.getElementById('followUpDate').value,
            status: document.getElementById('status').value,
            notes: document.getElementById('notes').value
        };

        jobs.unshift(newJob); // Add to beginning of array
        saveJobs();
        renderJobs();
        document.getElementById('jobForm').reset();
    }

    // Delete job
    window.deleteJob = function(index) {
        if (confirm('Are you sure you want to delete this application?')) {
            jobs.splice(index, 1);
            saveJobs();
            renderJobs();
        }
    };

    // Edit job
    window.editJob = function(index) {
        const job = jobs[index];
        document.getElementById('company').value = job.company;
        document.getElementById('position').value = job.position;
        document.getElementById('salary').value = job.salary;
        document.getElementById('location').value = job.location;
        document.getElementById('applicationDate').value = job.applicationDate;
        document.getElementById('followUpDate').value = job.followUpDate;
        document.getElementById('status').value = job.status;
        document.getElementById('notes').value = job.notes;

        jobs.splice(index, 1);
        saveJobs();
        renderJobs();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Save jobs to localStorage
    function saveJobs() {
        localStorage.setItem('jobs', JSON.stringify(jobs));
    }

    // Format date for display
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    }

    // Initial render
    renderApp();
});
