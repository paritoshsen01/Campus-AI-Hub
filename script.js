let hobbies = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadHobbies();
});

// Function to load hobbies from localStorage
function loadHobbies() {
    hobbies = JSON.parse(localStorage.getItem('hobbies') || '[]');
    displayHobbies();
}

// Function to display hobbies in the gallery
function displayHobbies() {
    const hobbiesGallery = document.getElementById('hobbies-gallery');
    
    if (hobbies.length === 0) {
        hobbiesGallery.innerHTML = `
            <div class="no-hobbies">
                <i class="fas fa-palette" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                <h3>No hobbies shared yet</h3>
                <p>Be the first to share your amazing hobby with the community!</p>
            </div>
        `;
        return;
    }
    
    hobbiesGallery.innerHTML = hobbies.map(hobby => `
        <div class="hobby-card">
            <button class="delete-hobby-btn" onclick="deleteHobby('${hobby.id}')" title="Delete hobby">
                <i class="fas fa-trash"></i>
            </button>
            <h3>${hobby.title}</h3>
            <p>${hobby.description}</p>
            <div class="media-preview">
                ${hobby.mediaType.startsWith('video') ? 
                    `<video src="${hobby.media}" controls></video>` : 
                    `<audio src="${hobby.media}" controls></audio>`
                }
            </div>
            <div class="hobby-actions">
                <button onclick="likeHobby('${hobby.id}')" title="Like this hobby">
                    <i class="fas fa-heart"></i>
                    Like (${hobby.likes || 0})
                </button>
                <button onclick="commentHobby('${hobby.id}')" title="Add comment">
                    <i class="fas fa-comment"></i>
                    Comment
                </button>
            </div>
            <div class="comments-section" id="comments-${hobby.id}">
                ${hobby.comments && hobby.comments.length > 0 ? 
                    hobby.comments.map((comment, index) => `
                        <div class="comment-item">
                            <p>${comment}</p>
                            <button class="delete-comment-btn" onclick="deleteComment('${hobby.id}', ${index})" title="Delete comment">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('') : 
                    '<p style="color: rgba(255,255,255,0.6); font-style: italic;">No comments yet</p>'
                }
            </div>
        </div>
    `).join('');
}

// Function to delete a hobby
function deleteHobby(id) {
    if (confirm('Are you sure you want to delete this hobby? This action cannot be undone.')) {
        hobbies = hobbies.filter(hobby => hobby.id !== id);
        localStorage.setItem('hobbies', JSON.stringify(hobbies));
        displayHobbies();
        showModal('Hobby deleted successfully!');
    }
}

// Function to delete a comment
function deleteComment(hobbyId, commentIndex) {
    if (confirm('Are you sure you want to delete this comment?')) {
        const hobby = hobbies.find(h => h.id === hobbyId);
        if (hobby && hobby.comments) {
            hobby.comments.splice(commentIndex, 1);
            localStorage.setItem('hobbies', JSON.stringify(hobbies));
            displayHobbies();
            showModal('Comment deleted successfully!');
        }
    }
}

// Function to handle hobby uploads
document.getElementById('hobby-upload-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('hobby-title').value;
    const description = document.getElementById('hobby-description').value;
    const category = document.getElementById('hobby-category').value;
    const mediaInput = document.getElementById('hobby-media');
    const mediaFile = mediaInput.files[0];
    
    if (!mediaFile) {
        alert('Please upload a video or audio file.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const hobby = {
            id: Date.now().toString(),
            title,
            description,
            media: event.target.result,
            mediaType: mediaFile.type,
            likes: 0,
            comments: []
        };
        
        hobbies.push(hobby);
        localStorage.setItem('hobbies', JSON.stringify(hobbies));
        displayHobbies();
        this.reset();
    }.bind(this);
    
    reader.readAsDataURL(mediaFile);
});

// Function to like a hobby
function likeHobby(id) {
    const hobby = hobbies.find(h => h.id === id);
    if (hobby) {
        hobby.likes = (hobby.likes || 0) + 1;
        localStorage.setItem('hobbies', JSON.stringify(hobbies));
        displayHobbies();
    }
}

// Function to comment on a hobby
function commentHobby(id) {
    const comment = prompt('Enter your comment:');
    if (comment) {
        const hobby = hobbies.find(h => h.id === id);
        if (hobby) {
            hobby.comments.push(comment);
            localStorage.setItem('hobbies', JSON.stringify(hobbies));
            displayHobbies();
        }
    }
}
let currentPage = 'home';
let assessmentQuestions = [];
let currentQuestionIndex = 0;
let assessmentAnswers = [];

// Mental health questions
const mentalHealthQuestions = [
    {
        question: "How would you rate your overall mood in the past week?",
        options: [
            "Very positive and energetic",
            "Generally positive",
            "Neutral/Okay",
            "Somewhat negative",
            "Very negative and down"
        ]
    },
    {
        question: "How well have you been sleeping lately?",
        options: [
            "Excellent - 7-8 hours nightly",
            "Good - 6-7 hours mostly",
            "Fair - some restless nights",
            "Poor - frequent insomnia",
            "Very poor - barely sleeping"
        ]
    },
    {
        question: "How would you describe your stress levels?",
        options: [
            "Very low - feel calm and in control",
            "Low - manageable stress",
            "Moderate - some challenging moments",
            "High - frequently overwhelmed",
            "Very high - constantly stressed"
        ]
    },
    {
        question: "How connected do you feel to others?",
        options: [
            "Very connected - strong support system",
            "Quite connected",
            "Somewhat connected",
            "Rather isolated",
            "Very isolated and lonely"
        ]
    },
    {
        question: "How would you rate your energy levels?",
        options: [
            "Very high - feel energized",
            "Good energy most days",
            "Moderate energy",
            "Often tired or drained",
            "Constantly exhausted"
        ]
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupForms();
    setupAdminDashboard();
    loadIssuesFromStorage();
}

// Navigation functions
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            navigateToPage(targetPage);
            
            // Close mobile menu if open
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

function navigateToPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(pageName);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageName;
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// AI Notes Generator functions
function generateNotes() {
    const topicInput = document.getElementById('topic-input');
    const topic = topicInput.value.trim();
    
    if (!topic) {
        showModal('Please enter a topic to generate notes.');
        return;
    }
    
    // Show loading spinner
    document.getElementById('loading-spinner').classList.remove('hidden');
    document.getElementById('notes-output').classList.add('hidden');
    
    // Simulate API call delay
    setTimeout(() => {
        generateDummyNotes(topic);
    }, 1500);
}

function generateDummyNotes(topic) {
    // Hide loading spinner
    document.getElementById('loading-spinner').classList.add('hidden');
    
    // Generate dummy content (replace with actual API call)
    const notesContent = `
        <h3>${topic}</h3>
        <h4>Introduction</h4>
        <p>${topic} is a fundamental concept that plays a crucial role in modern education and learning. Understanding this topic thoroughly can significantly enhance your academic performance and practical knowledge.</p>
        
        <h4>Key Concepts</h4>
        <ul>
            <li>Core principles and fundamental theories</li>
            <li>Practical applications and real-world examples</li>
            <li>Important formulas and methodologies</li>
            <li>Common misconceptions and how to avoid them</li>
        </ul>
        
        <h4>Detailed Explanation</h4>
        <p>The study of ${topic} involves multiple interconnected concepts that build upon each other. Students should focus on understanding the basic principles before moving to advanced applications.</p>
        
        <h4>Examples and Practice</h4>
        <p>Consider the following example to understand ${topic} better: [Detailed example would be provided here with step-by-step solution]</p>
        
        <h4>Summary</h4>
        <p>Mastering ${topic} requires consistent practice and deep understanding of underlying concepts. Regular revision and application of learned concepts is key to success.</p>
        
        <p><em><strong>Note: This is dummy content. In production, integrate with actual AI API like OpenAI GPT, Google Bard, or similar services.</strong></em></p>
    `;
    
    // Display notes
    document.getElementById('notes-title').textContent = `Notes: ${topic}`;
    document.getElementById('notes-content').innerHTML = notesContent;
    document.getElementById('notes-output').classList.remove('hidden');
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const title = document.getElementById('notes-title').textContent;
    const content = document.getElementById('notes-content').innerText;
    
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    doc.setFontSize(12);
    const splitContent = doc.splitTextToSize(content, 170);
    doc.text(splitContent, 20, 40);
    
    doc.save(`${title.replace('Notes: ', '')}-notes.pdf`);
}

// Mental Health Assessment functions
function startAssessment() {
    document.getElementById('assessment-start').classList.add('hidden');
    document.getElementById('assessment-questions').classList.remove('hidden');
    
    currentQuestionIndex = 0;
    assessmentAnswers = [];
    displayQuestion();
}

function displayQuestion() {
    const question = mentalHealthQuestions[currentQuestionIndex];
    const questionText = document.getElementById('question-text');
    const questionOptions = document.getElementById('question-options');
    const questionCounter = document.getElementById('question-counter');
    
    questionText.textContent = question.question;
    questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${mentalHealthQuestions.length}`;
    
    questionOptions.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'question-option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectAnswer(index);
        questionOptions.appendChild(optionDiv);
    });
}

function selectAnswer(answerIndex) {
    assessmentAnswers.push(answerIndex);
    
    if (currentQuestionIndex < mentalHealthQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        showAssessmentResults();
    }
}

function showAssessmentResults() {
    document.getElementById('assessment-questions').classList.add('hidden');
    document.getElementById('assessment-results').classList.remove('hidden');
    
    // Analyze results
    const totalScore = assessmentAnswers.reduce((sum, answer) => sum + answer, 0);
    const maxScore = mentalHealthQuestions.length * 4;
    const percentage = ((totalScore / maxScore) * 100).toFixed(1);
    
    let status, recommendations;
    
    if (totalScore <= 5) {
        status = "Excellent";
        recommendations = `
            <p><strong>Your mental health appears to be in excellent condition!</strong></p>
            <ul>
                <li>Continue your current positive habits</li>
                <li>Maintain regular sleep schedule</li>
                <li>Keep up with social connections</li>
                <li>Consider helping others who might be struggling</li>
            </ul>
        `;
    } else if (totalScore <= 10) {
        status = "Good";
        recommendations = `
            <p><strong>Your mental health is generally good with room for improvement.</strong></p>
            <ul>
                <li>Focus on improving sleep quality</li>
                <li>Practice stress management techniques like meditation</li>
                <li>Increase physical activity</li>
                <li>Reach out to friends and family more often</li>
            </ul>
        `;
    } else if (totalScore <= 15) {
        status = "Fair";
        recommendations = `
            <p><strong>Your mental health needs attention and care.</strong></p>
            <ul>
                <li>Consider speaking with a mental health professional</li>
                <li>Establish a consistent sleep routine</li>
                <li>Reduce stress through relaxation techniques</li>
                <li>Increase social support and connection</li>
                <li>Consider campus counseling services</li>
            </ul>
        `;
    } else {
        status = "Needs Attention";
        recommendations = `
            <p><strong>Your mental health requires immediate attention.</strong></p>
            <ul>
                <li><strong>Please reach out to a mental health professional</strong></li>
                <li>Contact campus counseling services immediately</li>
                <li>Talk to trusted friends or family members</li>
                <li>Focus on basic self-care: sleep, nutrition, and exercise</li>
                <li>Consider reducing academic load if possible</li>
                <li>Emergency contacts: Campus Health Center or local mental health hotline</li>
            </ul>
        `;
    }
    
    const resultsContent = `
        <h3>Assessment Results</h3>
        <p><strong>Overall Status:</strong> ${status}</p>
        <p><strong>Score:</strong> ${totalScore}/${maxScore} (${percentage}%)</p>
        <h4>Personalized Recommendations:</h4>
        ${recommendations}
        <p><em><strong>Note: This assessment is for educational purposes. For serious mental health concerns, please consult with licensed mental health professionals.</strong></em></p>
    `;
    
    document.getElementById('results-content').innerHTML = resultsContent;
}

function restartAssessment() {
    document.getElementById('assessment-results').classList.add('hidden');
    document.getElementById('assessment-start').classList.remove('hidden');
}

// Issue Reporting functions
function setupForms() {
    const anonymousForm = document.getElementById('anonymous-form');
    const personalForm = document.getElementById('personal-form');
    const lostForm = document.getElementById('lost-form');
    const foundForm = document.getElementById('found-form');
    
    anonymousForm.addEventListener('submit', handleAnonymousSubmit);
    personalForm.addEventListener('submit', handlePersonalSubmit);
    lostForm.addEventListener('submit', handleLostSubmit);
    foundForm.addEventListener('submit', handleFoundSubmit);
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.report-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function switchIssueTab(tabName) {
    const tabs = document.querySelectorAll('#issue-report .tab-btn');
    const forms = document.querySelectorAll('.report-form');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    forms.forEach(form => form.classList.remove('active'));
    
    document.querySelector(`[onclick="switchIssueTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-form`).classList.add('active');
}

function switchLostFoundTab(tabName) {
    const tabs = document.querySelectorAll('#lost-found .tab-btn');
    const forms = document.querySelectorAll('.lost-found-form');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    forms.forEach(form => form.classList.remove('active'));
    
    document.querySelector(`[onclick="switchLostFoundTab('${tabName}')"]`).classList.add('active');
    
    if (tabName === 'view-all') {
        document.getElementById('view-all-items').classList.add('active');
        displayAllItems();
    } else {
        document.getElementById(`${tabName}-form`).classList.add('active');
    }
}

// Display all lost and found items
function displayAllItems() {
    const items = loadLostFoundItems();
    const itemsList = document.getElementById('items-list');
    
    if (items.length === 0) {
        itemsList.innerHTML = `
            <div class="no-items">
                <i class="fas fa-inbox"></i>
                <h3>No items found</h3>
                <p>No items have been reported yet. Be the first to report a lost or found item!</p>
            </div>
        `;
        return;
    }
    
    // Sort items by date (newest first)
    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    renderItems(items);
}

// Render items to the display
function renderItems(items) {
    const itemsList = document.getElementById('items-list');
    const isAdmin = currentPage === 'admin-dashboard';
    
    itemsList.innerHTML = items.map(item => `
        <div class="item-card ${item.type}">
            <span class="item-type-badge ${item.type}">${item.type.toUpperCase()}</span>
            <h4 class="item-title">${item.item}</h4>
            <div class="item-location">
                <i class="fas fa-map-marker-alt"></i>
                ${item.location}
            </div>
            <div class="item-date">
                <i class="fas fa-calendar"></i>
                ${item.type === 'lost' ? 'Lost on' : 'Found on'} ${formatDateForDisplay(item.date)}
            </div>
            <div class="item-reporter">
                <i class="fas fa-user"></i>
                Reported by ${item.reporter}
            </div>
            <div class="item-description">${item.description}</div>
            <div class="item-contact">
                <i class="fas fa-envelope"></i>
                <small>${item.email}</small>
            </div>
            ${item.status ? `
                <div class="item-status">
                    <i class="fas fa-info-circle"></i>
                    <span class="status-badge ${item.status.toLowerCase()}">${item.status}</span>
                </div>
            ` : ''}
            ${isAdmin ? `
                <div class="item-actions">
                    <button class="btn btn-danger" onclick="removeItem(${item.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Filter items based on search and type
function filterItems() {
    const searchTerm = document.getElementById('search-items').value.toLowerCase();
    const filterType = document.getElementById('filter-type').value;
    
    const items = loadLostFoundItems();
    
    let filteredItems = items;
    
    // Filter by type
    if (filterType !== 'all') {
        filteredItems = filteredItems.filter(item => item.type === filterType);
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredItems = filteredItems.filter(item => 
            item.item.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.location.toLowerCase().includes(searchTerm) ||
            item.reporter.toLowerCase().includes(searchTerm)
        );
    }
    
    renderItems(filteredItems);
}

// Format date for display
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Remove item function for admin
function removeItem(itemId) {
    if (confirm('Are you sure you want to remove this item?')) {
        const items = loadLostFoundItems();
        const updatedItems = items.filter(item => item.id !== itemId);
        localStorage.setItem('campusLostFound', JSON.stringify(updatedItems));
        
        // Refresh the display
        if (currentPage === 'admin-dashboard') {
            loadAdminDashboard();
        } else if (document.getElementById('view-all-items').classList.contains('active')) {
            displayAllItems();
        }
        
        showModal('Item removed successfully!');
    }
}

// Update the handleLostSubmit and handleFoundSubmit to refresh the display
function handleLostSubmit(e) {
    e.preventDefault();
    
    const lostData = {
        id: Date.now(),
        type: 'lost',
        name: document.getElementById('lost-name').value,
        email: document.getElementById('lost-email').value,
        item: document.getElementById('lost-item').value,
        location: document.getElementById('lost-location').value,
        date: document.getElementById('lost-date').value,
        description: document.getElementById('lost-description').value,
        reporter: document.getElementById('lost-name').value,
        reportDate: new Date().toLocaleDateString()
    };
    
    saveLostFoundItem(lostData);
    this.reset();
    showModal('Your lost item report has been submitted successfully!');
    
    // Refresh display if we're on the view-all tab
    if (document.getElementById('view-all-items') && document.getElementById('view-all-items').classList.contains('active')) {
        displayAllItems();
    }
}

function handleFoundSubmit(e) {
    e.preventDefault();
    
    const foundData = {
        id: Date.now(),
        type: 'found',
        name: document.getElementById('found-name').value,
        email: document.getElementById('found-email').value,
        item: document.getElementById('found-item').value,
        location: document.getElementById('found-location').value,
        date: document.getElementById('found-date').value,
        description: document.getElementById('found-description').value,
        reporter: document.getElementById('found-name').value,
        reportDate: new Date().toLocaleDateString()
    };
    
    saveLostFoundItem(foundData);
    this.reset();
    showModal('Your found item report has been submitted successfully!');
    
    // Refresh display if we're on the view-all tab
    if (document.getElementById('view-all-items') && document.getElementById('view-all-items').classList.contains('active')) {
        displayAllItems();
    }
}

// Update admin dashboard to include lost/found items with remove functionality
function loadAdminDashboard() {
    const issues = loadIssuesFromStorage();
    const lostFoundItems = loadLostFoundItems();
    
    // Update statistics
    const totalIssues = issues.length;
    const totalLostFound = lostFoundItems.length;
    
    document.getElementById('total-issues').textContent = totalIssues + totalLostFound;
    document.getElementById('anonymous-issues').textContent = issues.filter(i => i.type === 'anonymous').length;
    document.getElementById('personal-issues').textContent = issues.filter(i => i.type === 'personal').length;
    
    // Populate table with remove buttons
    const tbody = document.getElementById('issues-tbody');
    tbody.innerHTML = '';
    
    const allItems = [...issues, ...lostFoundItems];
    
    if (allItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No reports found</td></tr>';
        return;
    }
    
    allItems.forEach(item => {
        const row = document.createElement('tr');
        if (item.type === 'lost' || item.type === 'found') {
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.type}</td>
                <td>${item.item}</td>
                <td>${item.reporter}</td>
                <td>${item.description.substring(0, 50)}${item.description.length > 50 ? '...' : ''}</td>
                <td>${item.reportDate}</td>
                <td>
                    <button class="btn btn-danger" onclick="removeItem(${item.id})" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        } else {
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.type}</td>
                <td>${item.issueType}</td>
                <td>${item.reporter}</td>
                <td>${item.description.substring(0, 50)}${item.description.length > 50 ? '...' : ''}</td>
                <td>${item.date}</td>
                <td>
                    <button class="btn btn-danger" onclick="removeItem(${item.id})" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        }
        tbody.appendChild(row);
    });
}

function handleLostSubmit(e) {
    e.preventDefault();
    
    const lostData = {
        id: Date.now(),
        type: 'lost',
        name: document.getElementById('lost-name').value,
        email: document.getElementById('lost-email').value,
        item: document.getElementById('lost-item').value,
        location: document.getElementById('lost-location').value,
        date: document.getElementById('lost-date').value,
        description: document.getElementById('lost-description').value,
        reporter: document.getElementById('lost-name').value,
        reportDate: new Date().toLocaleDateString()
    };
    
    saveLostFoundItem(lostData);
    this.reset();
    showModal('Your lost item report has been submitted successfully!');
    
    displayLostReports();
}

function handleFoundSubmit(e) {
    e.preventDefault();
    
    const foundData = {
        id: Date.now(),
        type: 'found',
        name: document.getElementById('found-name').value,
        email: document.getElementById('found-email').value,
        item: document.getElementById('found-item').value,
        location: document.getElementById('found-location').value,
        date: document.getElementById('found-date').value,
        description: document.getElementById('found-description').value,
        reporter: document.getElementById('found-name').value,
        reportDate: new Date().toLocaleDateString()
    };
    
    saveLostFoundItem(foundData);
    this.reset();
    showModal('Your found item report has been submitted successfully!');
}

function saveLostFoundItem(itemData) {
    const items = JSON.parse(localStorage.getItem('campusLostFound') || '[]');
    items.push(itemData);
    localStorage.setItem('campusLostFound', JSON.stringify(items));
}

function loadLostFoundItems() {
    return JSON.parse(localStorage.getItem('campusLostFound') || '[]');
}

function handleAnonymousSubmit(e) {
    e.preventDefault();
    
    const issueData = {
        id: Date.now(),
        type: 'anonymous',
        issueType: document.getElementById('anonymous-issue-type').value,
        description: document.getElementById('anonymous-description').value,
        reporter: 'Anonymous',
        date: new Date().toLocaleDateString()
    };
    
    saveIssue(issueData);
    this.reset();
    showModal('Your anonymous report has been submitted successfully!');
}

function handlePersonalSubmit(e) {
    e.preventDefault();
    
    const issueData = {
        id: Date.now(),
        type: 'personal',
        name: document.getElementById('personal-name').value,
        email: document.getElementById('personal-email').value,
        issueType: document.getElementById('personal-issue-type').value,
        description: document.getElementById('personal-description').value,
        reporter: document.getElementById('personal-name').value,
        date: new Date().toLocaleDateString()
    };
    
    saveIssue(issueData);
    this.reset();
    showModal('Your personal report has been submitted successfully! We will follow up with you.');
}

function saveIssue(issueData) {
    const issues = JSON.parse(localStorage.getItem('campusIssues') || '[]');
    issues.push(issueData);
    localStorage.setItem('campusIssues', JSON.stringify(issues));
}

function loadIssuesFromStorage() {
    return JSON.parse(localStorage.getItem('campusIssues') || '[]');
}

// Admin Dashboard functions
function setupAdminDashboard() {
    const adminLoginForm = document.getElementById('admin-login-form');
    adminLoginForm.addEventListener('submit', handleAdminLogin);
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    // Hardcoded credentials (in production, use proper authentication)
    if (username === 'Admin' && password === 'Admin@123') {
        navigateToPage('admin-dashboard');
        loadAdminDashboard();
    } else {
        showModal('Invalid credentials. Please try again.');
    }
}

function loadAdminDashboard() {
    const issues = loadIssuesFromStorage();
    const lostFoundItems = loadLostFoundItems();
    const hobbies = JSON.parse(localStorage.getItem('hobbies') || '[]');
    
    // Update statistics
    const totalIssues = issues.length;
    const totalLostFound = lostFoundItems.length;
    const totalHobbies = hobbies.length;
    
    document.getElementById('total-issues').textContent = totalIssues + totalLostFound;
    document.getElementById('anonymous-issues').textContent = issues.filter(i => i.type === 'anonymous').length;
    document.getElementById('personal-issues').textContent = issues.filter(i => i.type === 'personal').length;
    document.getElementById('total-hobbies').textContent = totalHobbies;
    
    // Update hobbies statistics
    const totalComments = hobbies.reduce((sum, hobby) => sum + (hobby.comments ? hobby.comments.length : 0), 0);
    const totalLikes = hobbies.reduce((sum, hobby) => sum + (hobby.likes || 0), 0);
    
    document.getElementById('total-hobbies-uploaded').textContent = totalHobbies;
    document.getElementById('total-comments').textContent = totalComments;
    document.getElementById('total-likes').textContent = totalLikes;
    
    // Populate issues table
    populateIssuesTable(issues, lostFoundItems);
    
    // Populate hobbies table
    populateHobbiesTable(hobbies);
}

function populateIssuesTable(issues, lostFoundItems) {
    const tbody = document.getElementById('issues-tbody');
    tbody.innerHTML = '';
    
    const allItems = [...issues, ...lostFoundItems];
    
    if (allItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No reports found</td></tr>';
        return;
    }
    
    allItems.forEach(item => {
        const row = document.createElement('tr');
        if (item.type === 'lost' || item.type === 'found') {
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.type}</td>
                <td>${item.item}</td>
                <td>${item.reporter}</td>
                <td>${item.description.substring(0, 50)}${item.description.length > 50 ? '...' : ''}</td>
                <td>${item.reportDate}</td>
                <td>
                    <select class="status-select" data-id="${item.id}" data-type="${item.type}">
                        <option value="Not Found" ${item.status === 'Not Found' ? 'selected' : ''}>Not Found</option>
                        <option value="Found" ${item.status === 'Found' ? 'selected' : ''}>Found</option>
                        <option value="Resolved" ${item.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteReport(${item.id}, '${item.type}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
        } else {
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.type}</td>
                <td>${item.issueType}</td>
                <td>${item.reporter}</td>
                <td>${item.description.substring(0, 50)}${item.description.length > 50 ? '...' : ''}</td>
                <td>${item.date}</td>
                <td>
                    <select class="status-select" data-id="${item.id}" data-type="issue">
                        <option value="Not Found" ${item.status === 'Not Found' ? 'selected' : ''}>Not Found</option>
                        <option value="Found" ${item.status === 'Found' ? 'selected' : ''}>Found</option>
                        <option value="Resolved" ${item.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteReport(${item.id}, 'issue')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
        }
        tbody.appendChild(row);
    });
    
    // Add event listeners for status updates
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', function() {
            const id = this.dataset.id;
            const type = this.dataset.type;
            const newStatus = this.value;
            updateReportStatus(id, type, newStatus);
        });
    });
}

function populateHobbiesTable(hobbies) {
    const tbody = document.getElementById('hobbies-admin-tbody');
    tbody.innerHTML = '';
    
    if (hobbies.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No hobbies found</td></tr>';
        return;
    }
    
    hobbies.forEach(hobby => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${hobby.id}</td>
            <td>${hobby.title}</td>
            <td>${hobby.category || 'Other'}</td>
            <td>${hobby.uploader || 'Anonymous'}</td>
            <td>${hobby.likes || 0}</td>
            <td>${hobby.comments ? hobby.comments.length : 0}</td>
            <td>${new Date(parseInt(hobby.id)).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewHobbyDetail('${hobby.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteHobby('${hobby.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function switchAdminTab(tabName) {
    const tabs = document.querySelectorAll('.admin-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[onclick="switchAdminTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function deleteHobby(id) {
    if (confirm('Are you sure you want to delete this hobby? This action cannot be undone.')) {
        const hobbies = JSON.parse(localStorage.getItem('hobbies') || '[]');
        const updatedHobbies = hobbies.filter(hobby => hobby.id !== id);
        localStorage.setItem('hobbies', JSON.stringify(updatedHobbies));
        
        showModal('Hobby deleted successfully!');
        loadAdminDashboard();
    }
}

function deleteAllHobbies() {
    if (confirm('Are you sure you want to delete ALL hobbies? This action cannot be undone.')) {
        localStorage.setItem('hobbies', JSON.stringify([]));
        showModal('All hobbies deleted successfully!');
        loadAdminDashboard();
    }
}

function viewHobbyDetail(id) {
    const hobbies = JSON.parse(localStorage.getItem('hobbies') || '[]');
    const hobby = hobbies.find(h => h.id === id);
    
    if (hobby) {
        const modal = document.getElementById('hobby-detail-modal');
        const content = document.getElementById('hobby-detail-content');
        
        content.innerHTML = `
            <div class="hobby-detail">
                <h4>${hobby.title}</h4>
                <p><strong>Category:</strong> ${hobby.category || 'Other'}</p>
                <p><strong>Uploader:</strong> ${hobby.uploader || 'Anonymous'}</p>
                <p><strong>Description:</strong> ${hobby.description}</p>
                <p><strong>Likes:</strong> ${hobby.likes || 0}</p>
                <p><strong>Comments:</strong> ${hobby.comments ? hobby.comments.length : 0}</p>
                
                <div class="media-preview">
                    ${hobby.mediaType.startsWith('video') ? 
                        `<video src="${hobby.media}" controls style="max-width: 100%; height: auto;"></video>` : 
                        `<audio src="${hobby.media}" controls style="width: 100%;"></audio>`
                    }
                </div>
                
                <div class="comments-section">
                    <h5>Comments:</h5>
                    ${hobby.comments ? hobby.comments.map((comment, index) => `
                        <div class="comment-item">
                            <p>${comment}</p>
                            <button class="btn btn-danger btn-sm" onclick="deleteComment('${id}', ${index})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    `).join('') : '<p>No comments</p>'}
                </div>
                
                <div class="actions">
                    <button class="btn btn-danger" onclick="deleteHobby('${id}')">
                        <i class="fas fa-trash"></i> Delete Hobby
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }
}

function closeHobbyDetailModal() {
    document.getElementById('hobby-detail-modal').classList.add('hidden');
}

function deleteComment(hobbyId, commentIndex) {
    if (confirm('Are you sure you want to delete this comment?')) {
        const hobbies = JSON.parse(localStorage.getItem('hobbies') || '[]');
        const hobby = hobbies.find(h => h.id === hobbyId);
        
        if (hobby && hobby.comments) {
            hobby.comments.splice(commentIndex, 1);
            localStorage.setItem('hobbies', JSON.stringify(hobbies));
            showModal('Comment deleted successfully!');
            viewHobbyDetail(hobbyId); // Refresh the detail view
        }
    }
}

function filterHobbiesAdmin() {
    const searchTerm = document.getElementById('search-hobbies-admin').value.toLowerCase();
    const categoryFilter = document.getElementById('filter-category-admin').value;
    
    const hobbies = JSON.parse(localStorage.getItem('hobbies') || '[]');
    
    let filteredHobbies = hobbies;
    
    // Filter by category
    if (categoryFilter !== 'all') {
        filteredHobbies = filteredHobbies.filter(hobby => 
            (hobby.category || 'other').toLowerCase() === categoryFilter.toLowerCase()
        );
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredHobbies = filteredHobbies.filter(hobby => 
            hobby.title.toLowerCase().includes(searchTerm) ||
            hobby.description.toLowerCase().includes(searchTerm) ||
            (hobby.uploader || '').toLowerCase().includes(searchTerm)
        );
    }
    
    populateHobbiesTable(filteredHobbies);
}

function updateReportStatus(id, type, newStatus) {
    if (type === 'issue') {
        const issues = loadIssuesFromStorage();
        const issueIndex = issues.findIndex(item => item.id === parseInt(id));
        if (issueIndex !== -1) {
            issues[issueIndex].status = newStatus;
            localStorage.setItem('campusIssues', JSON.stringify(issues));
        }
    } else {
        const items = loadLostFoundItems();
        const itemIndex = items.findIndex(item => item.id === parseInt(id));
        if (itemIndex !== -1) {
            items[itemIndex].status = newStatus;
            localStorage.setItem('campusLostFound', JSON.stringify(items));
        }
    }
    
    showModal(`Status updated to ${newStatus}`);
}

function deleteReport(id, type) {
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
        if (type === 'issue') {
            const issues = loadIssuesFromStorage();
            const updatedIssues = issues.filter(item => item.id !== id);
            localStorage.setItem('campusIssues', JSON.stringify(updatedIssues));
        } else {
            const items = loadLostFoundItems();
            const updatedItems = items.filter(item => item.id !== id);
            localStorage.setItem('campusLostFound', JSON.stringify(updatedItems));
        }
        
        showModal('Report deleted successfully!');
        loadAdminDashboard(); // Refresh the dashboard
    }
}

function logoutAdmin() {
    navigateToPage('home');
    document.getElementById('admin-login-form').reset();
}

// Modal functions
function showModal(message) {
    document.getElementById('success-message').textContent = message;
    document.getElementById('success-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('success-modal').classList.add('hidden');
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

// Handle window resize
window.addEventListener('resize', function() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
