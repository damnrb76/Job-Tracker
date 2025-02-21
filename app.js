// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get root element
    const root = document.getElementById('root');
    
    // Get stored jobs or initialize empty array
    let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');

    // Function to create the job form
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

    // Format date for display
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    }

    // Function to render the entire app
    function renderApp() {
        root.innerHTML = `
            <div class="header">
                <h1>Job Application Tracker</h1>
            </div>
            <div class="container">
                ${createJobForm()}
                <div id="jobsList">
                    ${createJobList()}
                </div>
            </div>
        `;

        // Add form submit handler
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
            jobs.unshift(newJob); // Add to beginning of array
            localStorage.setItem('jobs', JSON.stringify(jobs));
            renderApp();
            e.target.reset(); // Clear the form
        });
    }

    // Global edit function
    window.editJob = function(index) {
        const job = jobs[index];
        document.getElementById('company').value = job.company;
        document.getElementById('position').value = job.position;
        document.getElementById('salary').value = job.salary;
        document.getElementById('location').value = job.location;
        document.getElementById('applicationDate').value = job.applicationDate;
        document.getElementById('status').value = job.status;
        document.getElementById('notes').value = job.notes;
        
        // Remove the job from the array
        jobs.splice(index, 1);
        localStorage.setItem('jobs', JSON.stringify(jobs));
        
        // Scroll to form
        document.getElementById('jobForm').scrollIntoView({ behavior: 'smooth' });
    };

    // Global delete function
    window.deleteJob = function(index) {
        if (confirm('Are you sure you want to delete this job application?')) {
            jobs.splice(index, 1);
            localStorage.setItem('jobs', JSON.stringify(jobs));
            renderApp();
        }
    };

    // Initial render
    renderApp();
});
