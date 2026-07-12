// API Configuration
const API_BASE_URL = window.location.origin + '/api';

function getApiBaseUrl() {
    return API_BASE_URL;
}

// Get token from localStorage (refresh on each request)
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const authToken = getAuthToken();
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        
        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            showToast('Session expired. Please login again.', 'warning');
            setTimeout(() => {
                window.location.href = '/dashboard/login.html';
            }, 2000);
            throw new Error('Unauthorized');
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        if (error.message !== 'Unauthorized') {
            showToast(error.message, 'error');
        }
        throw error;
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            
            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update active section
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(section).classList.add('active');
            
            // Update page title
            document.getElementById('pageTitle').textContent = item.querySelector('span').textContent;
            
            // Show/hide add button
            const addBtn = document.getElementById('addBtn');
            if (section === 'dashboard' || section === 'statistics' || section === 'family') {
                addBtn.style.display = 'none';
            } else {
                addBtn.style.display = 'flex';
                addBtn.onclick = () => openAddModal(section);
            }
            
            // Show/hide family nav item based on user role
            const userData = localStorage.getItem('user');
            const familyNavItem = document.getElementById('familyNavItem');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user.role === 'family') {
                        familyNavItem.style.display = 'flex';
                    } else {
                        familyNavItem.style.display = 'none';
                    }
                } catch (e) {
                    familyNavItem.style.display = 'none';
                }
            } else {
                familyNavItem.style.display = 'none';
            }
            
            // Load section data
            loadSectionData(section);
        });
    });
}

// Load Section Data
async function loadSectionData(section) {
    switch (section) {
        case 'dashboard':
            await loadDashboardStats();
            break;
        case 'levels':
            await loadLevels();
            break;
        case 'words':
            await loadWords();
            break;
        case 'activities':
            await loadActivities();
            break;
        case 'stories':
            await loadStories();
            break;
        case 'users':
            await loadUsers();
            break;
        case 'statistics':
            await loadStatistics();
            break;
        case 'family':
            await loadFamilyDashboard();
            break;
    }
}

// Dashboard Stats
async function loadDashboardStats() {
    try {
        const [levels, words, users, activities] = await Promise.all([
            apiRequest('/levels'),
            apiRequest('/words'),
            apiRequest('/users'),
            apiRequest('/activities/admin/all').catch(() => []),
        ]);
        
        document.getElementById('totalLevels').textContent = levels.length || 0;
        document.getElementById('totalWords').textContent = words.length || 0;
        document.getElementById('totalUsers').textContent = users.length || 0;
        document.getElementById('totalActivities').textContent = activities.length || 0;
        document.getElementById('totalProgress').textContent = activities.length + words.length;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load Levels
async function loadLevels() {
    try {
        const levels = await apiRequest('/levels');
        const tbody = document.getElementById('levelsTableBody');
        
        if (levels.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No levels found</td></tr>';
            return;
        }
        
        tbody.innerHTML = levels.map(level => `
            <tr>
                <td><strong>${level.name}</strong></td>
                <td>${level.levelNumber}</td>
                <td><span class="status-badge active">${level.language}</span></td>
                <td><span class="status-badge active">${level.levelType || 'speech'}</span></td>
                <td>${level.requiredPoints}</td>
                <td><span class="status-badge ${level.isActive ? 'active' : 'inactive'}">${level.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editLevel('${level._id || level.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-danger" onclick="deleteLevel('${level._id || level.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        document.getElementById('levelsTableBody').innerHTML = 
            '<tr><td colspan="6" class="loading">Error loading levels</td></tr>';
    }
}

// Load Words
async function loadWords() {
    try {
        const words = await apiRequest('/words');
        const tbody = document.getElementById('wordsTableBody');
        
        if (words.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No words found</td></tr>';
            return;
        }
        
        // Get levels for display
        const levels = await apiRequest('/levels');
        const levelMap = {};
        levels.forEach(level => {
            levelMap[level._id || level.id] = level.name;
        });
        
        tbody.innerHTML = words.map(word => {
            // Handle levelId - could be string ID or populated object
            let levelName = 'N/A';
            if (word.levelId) {
                if (typeof word.levelId === 'object' && word.levelId !== null) {
                    // If levelId is populated object, use its name directly
                    levelName = word.levelId.name || word.levelId._id || 'N/A';
                } else {
                    // If levelId is string, look it up in levelMap
                    levelName = levelMap[word.levelId] || word.levelId || 'N/A';
                }
            }
            
            return `
            <tr>
                <td><strong>${word.word}</strong></td>
                <td>${word.arabic}</td>
                <td>${levelName}</td>
                <td>${word.icon || '📝'}</td>
                <td><span class="status-badge ${word.isActive ? 'active' : 'inactive'}">${word.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editWord('${word._id || word.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-danger" onclick="deleteWord('${word._id || word.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    } catch (error) {
        console.error('Error loading words:', error);
        document.getElementById('wordsTableBody').innerHTML = 
            '<tr><td colspan="6" class="loading">Error loading words</td></tr>';
    }
}

// Load Activities (shapes & colors)
let allActivitiesCache = [];
let activityFilter = 'all';

async function loadActivities() {
    try {
        allActivitiesCache = await apiRequest('/activities/admin/all');
        renderActivitiesTable();
    } catch (error) {
        document.getElementById('activitiesTableBody').innerHTML =
            '<tr><td colspan="6" class="loading">Error loading activities</td></tr>';
    }
}

function filterActivities(type) {
    activityFilter = type;
    renderActivitiesTable();
}

async function renderActivitiesTable() {
    const tbody = document.getElementById('activitiesTableBody');
    const levels = await apiRequest('/levels');
    const levelMap = {};
    levels.forEach(l => { levelMap[l._id || l.id] = l.name; });

    let items = allActivitiesCache.filter(a => a.type !== 'story');
    if (activityFilter !== 'all') {
        items = items.filter(a => a.type === activityFilter);
    }

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No activities found. Run npm run seed:content</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(a => `
        <tr>
            <td><strong>${a.title}</strong><br><small>${a.titleAr || ''}</small></td>
            <td><span class="status-badge active">${a.type}</span></td>
            <td>${a.cognitiveCategory || '-'}</td>
            <td>${levelMap[a.levelId] || '-'}</td>
            <td>${a.points}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-danger" onclick="deleteActivity('${a._id || a.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load Stories
async function loadStories() {
    try {
        const all = await apiRequest('/activities/admin/all');
        const stories = all.filter(a => a.type === 'story');
        const tbody = document.getElementById('storiesTableBody');

        if (stories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No stories found. Run npm run seed:content</td></tr>';
            return;
        }

        tbody.innerHTML = stories.map(s => `
            <tr>
                <td><strong>${s.title}</strong><br><small>${s.titleAr || ''}</small></td>
                <td>${s.content?.pages?.length || 0} pages</td>
                <td>${s.content?.questions?.length || 0} questions</td>
                <td>${s.cognitiveCategory || 'comprehension'}</td>
                <td>${s.points}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-danger" onclick="deleteActivity('${s._id || s.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        document.getElementById('storiesTableBody').innerHTML =
            '<tr><td colspan="6" class="loading">Error loading stories</td></tr>';
    }
}

async function deleteActivity(id) {
    if (!confirm('Delete this activity?')) return;
    try {
        await apiRequest(`/activities/${id}`, { method: 'DELETE' });
        showToast('Activity deleted');
        loadActivities();
        loadStories();
    } catch (e) { /* handled */ }
}

// Load Statistics - Cognitive Profiles
async function loadStatistics() {
    const container = document.getElementById('statisticsContent');
    try {
        const users = await apiRequest('/users');
        const students = users.filter(u => u.role === 'student');

        if (students.length === 0) {
            container.innerHTML = '<div class="loading">No students found</div>';
            return;
        }

        let html = '<div class="students-grid">';

        for (const student of students) {
            const id = student._id || student.id;
            try {
                const profile = await apiRequest(`/statistics/student/${id}/cognitive-profile`);
                const weaknessColors = {
                    strong: '#4CAF50', mild: '#FF9800',
                    moderate: '#FF5722', needs_focus: '#D50000'
                };

                html += `
                    <div class="student-card" style="text-align:left;">
                        <div class="student-header">
                            <div class="student-avatar"><i class="fas fa-user-graduate"></i></div>
                            <div class="student-info">
                                <h3>${student.name}</h3>
                                <p>${student.email}</p>
                            </div>
                        </div>
                        <h4 style="margin:1rem 0 0.5rem;">Cognitive Profile</h4>
                        ${(profile.profile || []).map(p => `
                            <div style="display:flex;justify-content:space-between;align-items:center;margin:0.4rem 0;">
                                <span style="text-transform:capitalize;">${p.category}</span>
                                <span class="status-badge" style="background:${weaknessColors[p.level] || '#999'}">
                                    ${p.level.replace('_', ' ')} (${p.score})
                                </span>
                            </div>
                        `).join('')}
                        ${profile.primaryWeakness ? `
                            <p style="margin-top:0.8rem;color:var(--warning);font-weight:600;">
                                ⚠️ Primary focus: ${profile.primaryWeakness}
                            </p>
                        ` : '<p style="margin-top:0.8rem;color:var(--success);">✅ No major weaknesses yet</p>'}
                        <h4 style="margin:1rem 0 0.5rem;">Recommendations</h4>
                        <ul style="padding-left:1.2rem;color:var(--text-secondary);">
                            ${(profile.recommendations || []).map(r => `<li>${r}</li>`).join('')}
                        </ul>
                        <div style="margin-top:1rem;display:flex;gap:1rem;">
                            <div><strong>${profile.speechStats?.completedWords || 0}</strong> words done</div>
                            <div><strong>${profile.speechStats?.totalPoints || 0}</strong> points</div>
                        </div>
                    </div>
                `;
            } catch (e) {
                html += `<div class="student-card"><p>No data for ${student.name}</p></div>`;
            }
        }

        html += '</div>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<div class="loading">Error loading statistics</div>';
    }
}

// Load Users
async function loadUsers() {
    try {
        const users = await apiRequest('/users');
        const tbody = document.getElementById('usersTableBody');
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No users found</td></tr>';
            return;
        }
        
        // Get all users to find linked students
        const userMap = {};
        users.forEach(u => {
            userMap[u._id || u.id] = u;
        });
        
        tbody.innerHTML = users.map(user => {
            let linkedInfo = '<span style="color: var(--text-secondary);">-</span>';
            if (user.role === 'student' && user.linkedFamilyId) {
                const linkedFamily = userMap[user.linkedFamilyId];
                linkedInfo = linkedFamily ? `<span class="status-badge active">${linkedFamily.name}</span>` : '<span style="color: var(--text-secondary);">-</span>';
            } else if (user.role === 'family' && user.linkedStudentId) {
                const linkedStudent = userMap[user.linkedStudentId];
                linkedInfo = linkedStudent ? `<span class="status-badge active">${linkedStudent.name}</span>` : '<span style="color: var(--text-secondary);">-</span>';
            }
            return `
            <tr>
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td><span class="status-badge active">${user.role}</span></td>
                <td>${linkedInfo}</td>
                <td><span class="status-badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editUser('${user._id || user.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-danger" onclick="deleteUser('${user._id || user.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    } catch (error) {
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="6" class="loading">Error loading users</td></tr>';
    }
}

// Load Statistics - replaced below with cognitive profiles
// (see loadStatistics function after loadActivities)

// Load Family Dashboard
async function loadFamilyDashboard() {
    try {
        const userData = localStorage.getItem('user');
        if (!userData) {
            document.getElementById('familyContent').innerHTML = 
                '<div class="loading">Please login to view family dashboard</div>';
            return;
        }
        
        const user = JSON.parse(userData);
        
        if (user.role !== 'family') {
            document.getElementById('familyContent').innerHTML = 
                '<div class="loading">This section is only available for family accounts</div>';
            return;
        }
        
        // Get the family user ID (could be _id or id)
        const familyId = user._id || user.id;
        
        // Get all students linked to this family
        // Students have linkedFamilyId pointing to this family
        let students = [];
        try {
            // Use the API endpoint to get students for this family
            students = await apiRequest(`/users/family/${familyId}/students`);
        } catch (error) {
            console.error('Error fetching students from API:', error);
            // Fallback: Get all users and filter students with linkedFamilyId matching this family
            try {
                const allUsers = await apiRequest('/users');
                students = allUsers.filter(u => {
                    const studentFamilyId = u.linkedFamilyId?._id || u.linkedFamilyId?.id || u.linkedFamilyId;
                    return u.role === 'student' && studentFamilyId === familyId;
                });
            } catch (fallbackError) {
                console.error('Error in fallback method:', fallbackError);
                students = [];
            }
        }
        
        if (students.length === 0) {
            document.getElementById('familyContent').innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-users" style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">No Children Linked</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                        You don't have any children linked to your account yet.
                    </p>
                    <p style="color: var(--text-secondary);">
                        Contact an administrator to link student accounts to your family account.
                    </p>
                </div>
            `;
            return;
        }
        
        // Show header with children count
        let content = `
            <div style="margin-bottom: 2rem; padding: 1.5rem; background: var(--bg-white); border-radius: 15px; box-shadow: var(--shadow);">
                <h2 style="color: var(--text-primary); margin-bottom: 0.5rem;">
                    <i class="fas fa-users"></i> My Children (${students.length})
                </h2>
                <p style="color: var(--text-secondary);">View progress and statistics for each child</p>
            </div>
        `;
        
        // Add button to view all word history
        content += '<div style="margin-bottom: 1.5rem;">';
        content += '<button class="btn-primary" onclick="viewAllWordHistory()" style="width: 100%;">';
        content += '<i class="fas fa-history"></i> View All Word History';
        content += '</button>';
        content += '</div>';
        
        // Load statistics for each student
        content += '<div class="students-grid">';
        
        for (const student of students) {
            try {
                const studentId = student._id || student.id;
                const stats = await apiRequest(`/statistics/student/${studentId}`);
                
                // Calculate progress percentage
                const progressPercentage = stats.totalWords > 0 
                    ? Math.round((stats.completedWords / stats.totalWords) * 100) 
                    : 0;
                
                content += `
                    <div class="student-card">
                        <div class="student-header">
                            <div class="student-avatar">
                                <i class="fas fa-user-graduate"></i>
                            </div>
                            <div class="student-info">
                                <h3>${student.name}</h3>
                                <p>${student.email}</p>
                            </div>
                        </div>
                        <div class="student-stats">
                            <div class="stat-item">
                                <div class="stat-value" style="color: var(--primary); font-size: 2rem; font-weight: bold;">${stats.totalPoints || 0}</div>
                                <div class="stat-label">Total Points</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${stats.completedWords || 0}/${stats.totalWords || 0}</div>
                                <div class="stat-label">Words Completed</div>
                                <div style="margin-top: 0.5rem; width: 100%; height: 6px; background: var(--bg-light); border-radius: 3px; overflow: hidden;">
                                    <div style="width: ${progressPercentage}%; height: 100%; background: var(--success); transition: width 0.3s ease;"></div>
                                </div>
                                <small style="color: var(--text-secondary); font-size: 0.85rem;">${progressPercentage}% complete</small>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${Math.round((stats.averageAccuracy || 0) * 100)}%</div>
                                <div class="stat-label">Average Accuracy</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${stats.totalAttempts || 0}</div>
                                <div class="stat-label">Total Attempts</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                            <button class="btn-primary" onclick="viewStudentDetails('${studentId}')" style="flex: 1;">
                                <i class="fas fa-chart-line"></i> View Progress
                            </button>
                            <button class="btn-edit" onclick="viewStudentWordHistory('${studentId}')" style="flex: 1;">
                                <i class="fas fa-history"></i> Word History
                            </button>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error(`Error loading stats for student ${student.name}:`, error);
                content += `
                    <div class="student-card">
                        <div class="student-header">
                            <div class="student-avatar">
                                <i class="fas fa-user-graduate"></i>
                            </div>
                            <div class="student-info">
                                <h3>${student.name}</h3>
                                <p>${student.email}</p>
                            </div>
                        </div>
                        <p style="color: var(--text-secondary); padding: 1rem; text-align: center;">
                            <i class="fas fa-exclamation-triangle"></i> Unable to load statistics
                        </p>
                    </div>
                `;
            }
        }
        
        content += '</div>';
        document.getElementById('familyContent').innerHTML = content;
        
    } catch (error) {
        console.error('Error loading family dashboard:', error);
        document.getElementById('familyContent').innerHTML = 
            '<div class="loading">Error loading family dashboard. Please try again.</div>';
    }
}

async function viewStudentDetails(studentId) {
    try {
        // Get detailed statistics for this student
        const stats = await apiRequest(`/statistics/student/${studentId}`);
        
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Student Statistics';
        
        let statsHtml = '<div style="padding: 1rem;">';
        statsHtml += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">';
        statsHtml += `<div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px;"><strong>Total Points</strong><br><span style="font-size: 1.5rem; color: var(--primary);">${stats.totalPoints || 0}</span></div>`;
        statsHtml += `<div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px;"><strong>Completed Words</strong><br><span style="font-size: 1.5rem; color: var(--primary);">${stats.completedWords || 0}</span></div>`;
        statsHtml += `<div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px;"><strong>Total Attempts</strong><br><span style="font-size: 1.5rem; color: var(--primary);">${stats.totalAttempts || 0}</span></div>`;
        statsHtml += `<div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px;"><strong>Avg Accuracy</strong><br><span style="font-size: 1.5rem; color: var(--primary);">${((stats.averageAccuracy || 0) * 100).toFixed(1)}%</span></div>`;
        statsHtml += '</div>';
        
        if (stats.byLevel && stats.byLevel.length > 0) {
            statsHtml += '<h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">Progress by Level</h3>';
            statsHtml += '<div style="max-height: 40vh; overflow-y: auto;">';
            stats.byLevel.forEach(level => {
                statsHtml += `<div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem;">`;
                statsHtml += `<strong>${level.levelId?.name || 'Level'}</strong><br>`;
                statsHtml += `<small>Words: ${level.completedWords || 0}/${level.totalWords || 0} | Points: ${level.totalPoints || 0} | Accuracy: ${((level.averageAccuracy || 0) * 100).toFixed(1)}%</small>`;
                statsHtml += `</div>`;
            });
            statsHtml += '</div>';
        }
        
        statsHtml += '<div class="form-actions" style="margin-top: 1rem;">';
        statsHtml += '<button type="button" class="btn-secondary" onclick="closeModal()">Close</button>';
        statsHtml += '</div>';
        statsHtml += '</div>';
        
        modalBody.innerHTML = statsHtml;
        modal.classList.add('active');
    } catch (error) {
        console.error('Error loading student details:', error);
        showToast('Error loading student details', 'error');
    }
}

async function viewStudentWordHistory(studentId) {
    try {
        // Get word history for this student
        const wordHistory = await apiRequest(`/statistics/student/${studentId}/word-history`);
        
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Word Practice History';
        
        if (wordHistory.length === 0) {
            modalBody.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">No word practice history yet.</p><div class="form-actions"><button type="button" class="btn-secondary" onclick="closeModal()">Close</button></div>';
        } else {
            let historyHtml = '<div style="max-height: 60vh; overflow-y: auto;">';
            historyHtml += '<table style="width: 100%; border-collapse: collapse;">';
            historyHtml += '<thead><tr style="background: var(--bg-secondary);">';
            historyHtml += '<th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--border-color);">Word</th>';
            historyHtml += '<th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--border-color);">Level</th>';
            historyHtml += '<th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--border-color);">Accuracy</th>';
            historyHtml += '<th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--border-color);">Points</th>';
            historyHtml += '<th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--border-color);">Attempts</th>';
            historyHtml += '<th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--border-color);">Status</th>';
            historyHtml += '<th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--border-color);">Date</th>';
            historyHtml += '</tr></thead><tbody>';
            
            wordHistory.forEach(item => {
                const word = item.word || {};
                const level = item.level || {};
                const accuracy = (item.accuracy * 100).toFixed(1);
                const date = new Date(item.createdAt || item.updatedAt).toLocaleDateString();
                const statusBadge = item.isCompleted 
                    ? '<span class="status-badge active">Completed</span>'
                    : '<span class="status-badge inactive">In Progress</span>';
                
                historyHtml += '<tr style="border-bottom: 1px solid var(--border-color);">';
                historyHtml += `<td style="padding: 0.75rem;"><strong>${word.word || 'N/A'}</strong><br><small style="color: var(--text-secondary);">${word.arabic || ''}</small></td>`;
                historyHtml += `<td style="padding: 0.75rem;">${level.name || 'N/A'}</td>`;
                historyHtml += `<td style="padding: 0.75rem; text-align: center;">${accuracy}%</td>`;
                historyHtml += `<td style="padding: 0.75rem; text-align: center;"><strong>${item.pointsEarned || 0}</strong></td>`;
                historyHtml += `<td style="padding: 0.75rem; text-align: center;">${item.attempts || 0}</td>`;
                historyHtml += `<td style="padding: 0.75rem; text-align: center;">${statusBadge}</td>`;
                historyHtml += `<td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.9rem;">${date}</td>`;
                historyHtml += '</tr>';
            });
            
            historyHtml += '</tbody></table></div>';
            historyHtml += '<div class="form-actions" style="margin-top: 1rem;">';
            historyHtml += '<button type="button" class="btn-secondary" onclick="closeModal()">Close</button>';
            historyHtml += '</div>';
            
            modalBody.innerHTML = historyHtml;
        }
        
        modal.classList.add('active');
    } catch (error) {
        console.error('Error loading word history:', error);
        showToast('Error loading word history', 'error');
    }
}

async function viewAllWordHistory() {
    try {
        // Get word history for all students in the family
        const wordHistory = await apiRequest('/statistics/family/word-history');
        
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'All Word Practice History';
        
        if (wordHistory.length === 0) {
            modalBody.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">No word practice history yet.</p><div class="form-actions"><button type="button" class="btn-secondary" onclick="closeModal()">Close</button></div>';
        } else {
            let historyHtml = '<div style="max-height: 60vh; overflow-y: auto;">';
            historyHtml += '<table style="width: 100%; border-collapse: collapse;">';
            historyHtml += '<thead><tr style="background: var(--bg-secondary);">';
            historyHtml += '<th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--border-color);">Student</th>';
            historyHtml += '<th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--border-color);">Word</th>';
            historyHtml += '<th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--border-color);">Level</th>';
            historyHtml += '<th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--border-color);">Accuracy</th>';
            historyHtml += '<th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--border-color);">Points</th>';
            historyHtml += '<th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--border-color);">Attempts</th>';
            historyHtml += '<th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--border-color);">Status</th>';
            historyHtml += '<th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--border-color);">Date</th>';
            historyHtml += '</tr></thead><tbody>';
            
            wordHistory.forEach(item => {
                const student = item.student || {};
                const word = item.word || {};
                const level = item.level || {};
                const accuracy = (item.accuracy * 100).toFixed(1);
                const date = new Date(item.createdAt || item.updatedAt).toLocaleDateString();
                const statusBadge = item.isCompleted 
                    ? '<span class="status-badge active">Completed</span>'
                    : '<span class="status-badge inactive">In Progress</span>';
                
                historyHtml += '<tr style="border-bottom: 1px solid var(--border-color);">';
                historyHtml += `<td style="padding: 0.75rem;"><strong>${student.name || 'Unknown'}</strong></td>`;
                historyHtml += `<td style="padding: 0.75rem;"><strong>${word.word || 'N/A'}</strong><br><small style="color: var(--text-secondary);">${word.arabic || ''}</small></td>`;
                historyHtml += `<td style="padding: 0.75rem;">${level.name || 'N/A'}</td>`;
                historyHtml += `<td style="padding: 0.75rem; text-align: center;">${accuracy}%</td>`;
                historyHtml += `<td style="padding: 0.75rem; text-align: center;"><strong>${item.pointsEarned || 0}</strong></td>`;
                historyHtml += `<td style="padding: 0.75rem; text-align: center;">${item.attempts || 0}</td>`;
                historyHtml += `<td style="padding: 0.75rem; text-align: center;">${statusBadge}</td>`;
                historyHtml += `<td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.9rem;">${date}</td>`;
                historyHtml += '</tr>';
            });
            
            historyHtml += '</tbody></table></div>';
            historyHtml += '<div class="form-actions" style="margin-top: 1rem;">';
            historyHtml += '<button type="button" class="btn-secondary" onclick="closeModal()">Close</button>';
            historyHtml += '</div>';
            
            modalBody.innerHTML = historyHtml;
        }
        
        modal.classList.add('active');
    } catch (error) {
        console.error('Error loading all word history:', error);
        showToast('Error loading word history', 'error');
    }
}

// Modal Functions
async function openAddModal(section) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `Add New ${section.charAt(0).toUpperCase() + section.slice(1).slice(0, -1)}`;
    
    switch (section) {
        case 'levels':
            modalBody.innerHTML = getLevelForm();
            break;
        case 'words':
            modalBody.innerHTML = getWordForm();
            // Load levels for select
            try {
                const levels = await apiRequest('/levels');
                const select = document.getElementById('levelSelect');
                if (select) {
                    select.innerHTML = '<option value="">Select Level</option>';
                    levels.forEach(level => {
                        const option = document.createElement('option');
                        option.value = level._id || level.id;
                        option.textContent = level.name;
                        select.appendChild(option);
                    });
                }
            } catch (error) {
                console.error('Error loading levels:', error);
            }
            break;
        case 'users':
            modalBody.innerHTML = getUserForm();
            setTimeout(() => {
                const roleSelect = document.getElementById('userRoleSelect');
                const linkedFamilyGroup = document.getElementById('linkedFamilyGroup');
                const linkedStudentGroup = document.getElementById('linkedStudentGroup');
                
                if (roleSelect) {
                    // Ensure student is selected (default for new users)
                    if (!roleSelect.value) {
                        roleSelect.value = 'student';
                    }
                    
                    // Only show "Link to Family" if student role is selected
                    if (roleSelect.value === 'student') {
                        if (linkedFamilyGroup) linkedFamilyGroup.style.display = 'block';
                        if (linkedStudentGroup) linkedStudentGroup.style.display = 'none';
                        // Trigger handleRoleChange to load families
                        if (window.handleRoleChange) {
                            window.handleRoleChange();
                        } else {
                            // Fallback: manually load families
                            const linkedFamilySelect = document.getElementById('linkedFamilySelect');
                            if (linkedFamilySelect) {
                                apiRequest('/users').then(users => {
                                    const families = users.filter(u => u.role === 'family');
                                    linkedFamilySelect.innerHTML = '<option value="">No family linked</option>';
                                    families.forEach(family => {
                                        const option = document.createElement('option');
                                        option.value = family._id || family.id;
                                        option.textContent = family.name + ' (' + family.email + ')';
                                        linkedFamilySelect.appendChild(option);
                                    });
                                }).catch(err => console.error('Error loading families:', err));
                            }
                        }
                    } else {
                        // Hide "Link to Family" for all other roles
                        if (linkedFamilyGroup) linkedFamilyGroup.style.display = 'none';
                        if (linkedStudentGroup) linkedStudentGroup.style.display = 'none';
                    }
                }
            }, 300);
            break;
        case 'activities':
            modalBody.innerHTML = getActivityForm('shapes');
            await loadLevelsIntoSelect('activityLevelSelect');
            break;
        case 'stories':
            modalBody.innerHTML = getStoryForm();
            await loadLevelsIntoSelect('storyLevelSelect');
            break;
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// Form Templates
function getLevelForm(level = null) {
    return `
        <form id="levelForm" onsubmit="saveLevel(event, '${level?._id || level?.id || ''}')">
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" value="${level?.name || ''}" required>
            </div>
            <div class="form-group">
                <label>Description *</label>
                <textarea name="description" required>${level?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Level Number *</label>
                <input type="number" name="levelNumber" value="${level?.levelNumber || ''}" required>
            </div>
            <div class="form-group">
                <label>Required Points *</label>
                <input type="number" name="requiredPoints" value="${level?.requiredPoints || ''}" required>
            </div>
            <div class="form-group">
                <label>Icon (Emoji) *</label>
                <input type="text" name="icon" value="${level?.icon || '🎯'}" required>
            </div>
            <div class="form-group">
                <label>Color (Hex) *</label>
                <input type="color" name="color" value="${level?.color || '#9C27B0'}" required>
            </div>
            <div class="form-group">
                <label>Language *</label>
                <select name="language" required>
                    <option value="english" ${level?.language === 'english' ? 'selected' : ''}>English</option>
                    <option value="arabic" ${level?.language === 'arabic' ? 'selected' : ''}>Arabic</option>
                </select>
            </div>
            <div class="form-group">
                <label>Level Type *</label>
                <select name="levelType" required>
                    <option value="speech" ${!level?.levelType || level?.levelType === 'speech' ? 'selected' : ''}>Speech</option>
                    <option value="story" ${level?.levelType === 'story' ? 'selected' : ''}>Story</option>
                    <option value="shapes" ${level?.levelType === 'shapes' ? 'selected' : ''}>Shapes</option>
                    <option value="colors" ${level?.levelType === 'colors' ? 'selected' : ''}>Colors</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getWordForm(word = null) {
    // Popular emoji icons for words
    const iconOptions = [
        '🍎', '🍊', '🍌', '🍇', '🍓', '🍑', '🥝', '🍉',
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
        '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
        '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨',
        '📚', '✏️', '📝', '📖', '📗', '📘', '📙', '📕',
        '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
        '🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥞',
        '🌍', '🌎', '🌏', '🌐', '🗺️', '🧭', '🏔️', '⛰️',
        '⭐', '🌟', '💫', '✨', '🔥', '💧', '🌈', '☀️',
        '❤️', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎'
    ];
    
    const selectedIcon = word?.icon || '📝';
    const iconGrid = iconOptions.map(icon => 
        `<span class="icon-option ${icon === selectedIcon ? 'selected' : ''}" 
              onclick="selectIcon('${icon}')" 
              data-icon="${icon}">${icon}</span>`
    ).join('');
    
    return `
        <form id="wordForm" onsubmit="saveWord(event, '${word?._id || word?.id || ''}')" enctype="multipart/form-data">
            <div class="form-group">
                <label>Word (English) *</label>
                <input type="text" name="word" value="${word?.word || ''}" required>
            </div>
            <div class="form-group">
                <label>Arabic Translation *</label>
                <input type="text" name="arabic" value="${word?.arabic || ''}" required>
            </div>
            <div class="form-group">
                <label>Icon (Emoji) *</label>
                <input type="text" name="icon" id="iconInput" value="${selectedIcon}" required readonly>
                <div class="icon-picker-container">
                    <div class="icon-picker-grid" id="iconPickerGrid">
                        ${iconGrid}
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Level *</label>
                <select name="levelId" id="levelSelect" required>
                    <option value="">Loading levels...</option>
                </select>
            </div>
            <div class="form-group">
                <label>Image</label>
                <div class="image-upload-container">
                    ${word?.imageUrl ? `
                        <div class="current-image-preview">
                            <img src="${word.imageUrl.startsWith('http') ? word.imageUrl : window.location.origin + word.imageUrl}" 
                                 alt="Current image" 
                                 onerror="this.style.display='none'">
                            <button type="button" class="btn-remove-image" onclick="removeImagePreview()">Remove</button>
                        </div>
                    ` : ''}
                    <input type="file" 
                           name="image" 
                           id="imageInput" 
                           accept="image/*" 
                           onchange="previewImage(this)"
                           style="display: ${word?.imageUrl ? 'none' : 'block'}">
                    <div id="imagePreview" class="image-preview" style="display: none;">
                        <img id="previewImg" src="" alt="Preview">
                        <button type="button" class="btn-remove-image" onclick="removeImagePreview()">Remove</button>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Audio URL</label>
                <input type="url" name="audioUrl" value="${word?.audioUrl || ''}" placeholder="https://example.com/audio.mp3">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getUserForm(user = null) {
    return `
        <form id="userForm" onsubmit="saveUser(event, '${user?._id || user?.id || ''}')">
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" value="${user?.name || ''}" required>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" value="${user?.email || ''}" required>
            </div>
            ${!user ? `
            <div class="form-group">
                <label>Password *</label>
                <input type="password" name="password" required>
            </div>
            ` : ''}
            <div class="form-group">
                <label>Role *</label>
                <select name="role" id="userRoleSelect" required onchange="handleRoleChange()">
                    <option value="student" ${!user ? 'selected' : (user?.role === 'student' ? 'selected' : '')}>Student</option>
                    <option value="family" ${user?.role === 'family' ? 'selected' : ''}>Family</option>
                    <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
            </div>
            <div class="form-group" id="linkedFamilyGroup" style="display: none;">
                <label>Link to Family (Optional)</label>
                <select name="linkedFamilyId" id="linkedFamilySelect">
                    <option value="">No family linked</option>
                </select>
                <small style="color: var(--text-secondary); margin-top: 0.5rem; display: block;">
                    Select a family account to link this student to. The family will be able to view this student's progress.
                </small>
            </div>
            <div class="form-group" id="linkedStudentGroup" style="display: none;">
                <label>Link to Student (Optional)</label>
                <select name="linkedStudentId" id="linkedStudentSelect">
                    <option value="">No student linked</option>
                </select>
                <small style="color: var(--text-secondary); margin-top: 0.5rem; display: block;">
                    Select a student to link this family account to. The family will be able to view this student's progress.
                </small>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
        <script>
            // Load families/students for select and handle role change
            (async () => {
                const roleSelect = document.getElementById('userRoleSelect');
                const linkedFamilyGroup = document.getElementById('linkedFamilyGroup');
                const linkedFamilySelect = document.getElementById('linkedFamilySelect');
                const linkedStudentGroup = document.getElementById('linkedStudentGroup');
                const linkedStudentSelect = document.getElementById('linkedStudentSelect');
                
                // Show/hide linked fields based on role
                function handleRoleChange() {
                    if (!roleSelect) return;
                    const role = roleSelect.value;
                    
                    // Only show "Link to Family" when role is "student"
                    if (role === 'student') {
                        if (linkedFamilyGroup) linkedFamilyGroup.style.display = 'block';
                        if (linkedStudentGroup) linkedStudentGroup.style.display = 'none';
                        loadFamilies();
                    } else {
                        // Hide "Link to Family" for all other roles (family, admin, etc.)
                        if (linkedFamilyGroup) linkedFamilyGroup.style.display = 'none';
                        if (linkedStudentGroup) linkedStudentGroup.style.display = 'none';
                        // Only show student selection for family role
                        if (role === 'family' && linkedStudentGroup) {
                            linkedStudentGroup.style.display = 'block';
                            loadStudents();
                        }
                    }
                }
                
                // Make function global
                window.handleRoleChange = handleRoleChange;
                
                // Load families for student selection
                async function loadFamilies() {
                    try {
                        if (!linkedFamilySelect) return;
                        const users = await apiRequest('/users');
                        const families = users.filter(u => u.role === 'family');
                        
                        linkedFamilySelect.innerHTML = '<option value="">No family linked</option>';
                        families.forEach(family => {
                            const option = document.createElement('option');
                            option.value = family._id || family.id;
                            option.textContent = family.name + ' (' + family.email + ')';
                            ${user?.linkedFamilyId ? `if (option.value === '${user.linkedFamilyId}') option.selected = true;` : ''}
                            linkedFamilySelect.appendChild(option);
                        });
                    } catch (error) {
                        console.error('Error loading families:', error);
                    }
                }
                
                // Load students for family selection
                async function loadStudents() {
                    try {
                        if (!linkedStudentSelect) return;
                        const users = await apiRequest('/users');
                        const students = users.filter(u => u.role === 'student');
                        
                        linkedStudentSelect.innerHTML = '<option value="">No student linked</option>';
                        students.forEach(student => {
                            const option = document.createElement('option');
                            option.value = student._id || student.id;
                            option.textContent = student.name + ' (' + student.email + ')';
                            ${user?.linkedStudentId ? `if (option.value === '${user.linkedStudentId}') option.selected = true;` : ''}
                            linkedStudentSelect.appendChild(option);
                        });
                    } catch (error) {
                        console.error('Error loading students:', error);
                    }
                }
                
                // Initial setup - check role and show appropriate field
                if (roleSelect) {
                    // Wait a bit for DOM to be ready
                    setTimeout(() => {
                        const currentRole = roleSelect.value || 'student'; // Default to student for new users
                        // Only show "Link to Family" if role is student
                        if (currentRole === 'student') {
                            if (linkedFamilyGroup) linkedFamilyGroup.style.display = 'block';
                            if (linkedStudentGroup) linkedStudentGroup.style.display = 'none';
                            loadFamilies();
                        } else {
                            // Hide "Link to Family" for all other roles
                            if (linkedFamilyGroup) linkedFamilyGroup.style.display = 'none';
                            if (linkedStudentGroup) linkedStudentGroup.style.display = 'none';
                            // Only show student selection for family role
                            if (currentRole === 'family' && linkedStudentGroup) {
                                linkedStudentGroup.style.display = 'block';
                                loadStudents();
                            }
                        }
                    }, 150);
                }
            })();
        </script>
    `;
}

// Save Functions
async function saveLevel(event, id) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    data.levelNumber = parseInt(data.levelNumber);
    data.requiredPoints = parseInt(data.requiredPoints);
    
    try {
        if (id) {
            await apiRequest(`/levels/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
            showToast('Level updated successfully', 'success');
        } else {
            await apiRequest('/levels', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            showToast('Level created successfully', 'success');
        }
        closeModal();
        loadLevels();
    } catch (error) {
        showToast('Error saving level', 'error');
    }
}

// Icon selection function
function selectIcon(icon) {
    document.getElementById('iconInput').value = icon;
    // Update visual selection
    document.querySelectorAll('.icon-option').forEach(el => {
        el.classList.remove('selected');
    });
    document.querySelector(`[data-icon="${icon}"]`).classList.add('selected');
}

// Image preview function
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            previewImg.src = e.target.result;
            preview.style.display = 'block';
            input.style.display = 'none';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Remove image preview
function removeImagePreview() {
    const preview = document.getElementById('imagePreview');
    const input = document.getElementById('imageInput');
    if (preview) {
        preview.style.display = 'none';
        const previewImg = document.getElementById('previewImg');
        if (previewImg) previewImg.src = '';
    }
    if (input) {
        input.value = '';
        input.style.display = 'block';
    }
    // Remove current image preview if exists
    const currentImage = document.querySelector('.current-image-preview');
    if (currentImage) {
        currentImage.remove();
        if (input) input.style.display = 'block';
    }
}

async function saveWord(event, id) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const token = getAuthToken();
        if (!token) {
            showToast('Please login again', 'error');
            window.location.href = '/dashboard/login.html';
            return;
        }
        
        // Prepare headers - don't set Content-Type for FormData, browser will set it with boundary
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        
        if (id) {
            // For update, check if there's a new image
            const imageFile = formData.get('image');
            const existingImageUrl = formData.get('existingImageUrl');
            
            // Prepare FormData for update
            const updateFormData = new FormData();
            updateFormData.append('word', formData.get('word'));
            updateFormData.append('arabic', formData.get('arabic'));
            updateFormData.append('icon', formData.get('icon'));
            updateFormData.append('levelId', formData.get('levelId'));
            const audioUrl = formData.get('audioUrl');
            if (audioUrl) updateFormData.append('audioUrl', audioUrl);
            
            if (imageFile && imageFile.size > 0) {
                // New image selected
                updateFormData.append('image', imageFile);
            } else if (existingImageUrl && existingImageUrl !== 'null' && existingImageUrl !== '') {
                // Keep existing image
                updateFormData.append('imageUrl', existingImageUrl);
            } else {
                // Remove image
                updateFormData.append('imageUrl', '');
            }
            
            const response = await fetch(`${getApiBaseUrl()}/words/${id}`, {
                method: 'PATCH',
                headers: headers,
                body: updateFormData
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Update failed' }));
                throw new Error(error.message || 'Update failed');
            }
            
            showToast('Word updated successfully', 'success');
        } else {
            // Create new word with image upload
            const createFormData = new FormData();
            createFormData.append('word', formData.get('word'));
            createFormData.append('arabic', formData.get('arabic'));
            createFormData.append('icon', formData.get('icon'));
            createFormData.append('levelId', formData.get('levelId'));
            const audioUrl = formData.get('audioUrl');
            if (audioUrl) createFormData.append('audioUrl', audioUrl);
            
            const imageFile = formData.get('image');
            if (imageFile && imageFile.size > 0) {
                createFormData.append('image', imageFile);
            }
            
            const response = await fetch(`${getApiBaseUrl()}/words`, {
                method: 'POST',
                headers: headers,
                body: createFormData
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to create word' }));
                throw new Error(error.message || 'Failed to create word');
            }
            
            showToast('Word created successfully', 'success');
        }
        closeModal();
        loadWords();
    } catch (error) {
        console.error('Error saving word:', error);
        showToast(error.message || 'Error saving word', 'error');
    }
}

async function saveUser(event, id) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Handle linkedFamilyId - set to null if empty
    if (data.linkedFamilyId === '' || data.linkedFamilyId === 'null') {
        data.linkedFamilyId = null;
    }
    
    // Handle linkedStudentId - set to null if empty
    if (data.linkedStudentId === '' || data.linkedStudentId === 'null') {
        data.linkedStudentId = null;
    }
    
    // Remove linkedFamilyId if role is not student
    if (data.role !== 'student') {
        delete data.linkedFamilyId;
    }
    
    // Remove linkedStudentId if role is not family
    if (data.role !== 'family') {
        delete data.linkedStudentId;
    }
    
    try {
        if (id) {
            // Remove password if not changing
            if (!data.password || data.password === '') delete data.password;
            await apiRequest(`/users/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
            showToast('User updated successfully', 'success');
        } else {
            await apiRequest('/users', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            showToast('User created successfully', 'success');
        }
        closeModal();
        loadUsers();
    } catch (error) {
        showToast('Error saving user', 'error');
    }
}

// Edit Functions
async function editLevel(id) {
    try {
        const level = await apiRequest(`/levels/${id}`);
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Edit Level';
        modalBody.innerHTML = getLevelForm(level);
        modal.classList.add('active');
    } catch (error) {
        showToast('Error loading level', 'error');
    }
}

async function editWord(id) {
    try {
        const word = await apiRequest(`/words/${id}`);
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Edit Word';
        modalBody.innerHTML = getWordForm(word);
        modal.classList.add('active');
        
        // Load levels after form is inserted
        try {
            const levels = await apiRequest('/levels');
            const select = document.getElementById('levelSelect');
            if (select) {
                select.innerHTML = '<option value="">Select Level</option>';
                
                // Get the levelId value - handle both object and string
                let currentLevelId = word.levelId;
                if (typeof word.levelId === 'object' && word.levelId !== null) {
                    currentLevelId = word.levelId._id || word.levelId.id;
                }
                
                levels.forEach(level => {
                    const option = document.createElement('option');
                    option.value = level._id || level.id;
                    option.textContent = level.name;
                    if (option.value === currentLevelId) option.selected = true;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading levels:', error);
        }
    } catch (error) {
        showToast('Error loading word', 'error');
    }
}

async function editUser(id) {
    try {
        const user = await apiRequest(`/users/${id}`);
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Edit User';
        modalBody.innerHTML = getUserForm(user);
        modal.classList.add('active');
        
        // Load families/students after form is inserted
        setTimeout(async () => {
            const roleSelect = document.getElementById('userRoleSelect');
            const linkedFamilyGroup = document.getElementById('linkedFamilyGroup');
            const linkedFamilySelect = document.getElementById('linkedFamilySelect');
            const linkedStudentGroup = document.getElementById('linkedStudentGroup');
            const linkedStudentSelect = document.getElementById('linkedStudentSelect');
            
            if (roleSelect) {
                // Show/hide linked fields based on role
                function handleRoleChange() {
                    if (!roleSelect) return;
                    const role = roleSelect.value;
                    
                    // Only show "Link to Family" when role is "student"
                    if (role === 'student') {
                        if (linkedFamilyGroup) linkedFamilyGroup.style.display = 'block';
                        if (linkedStudentGroup) linkedStudentGroup.style.display = 'none';
                        loadFamilies();
                    } else {
                        // Hide "Link to Family" for all other roles (family, admin, etc.)
                        if (linkedFamilyGroup) linkedFamilyGroup.style.display = 'none';
                        if (linkedStudentGroup) linkedStudentGroup.style.display = 'none';
                        // Only show student selection for family role
                        if (role === 'family' && linkedStudentGroup) {
                            linkedStudentGroup.style.display = 'block';
                            loadStudents();
                        }
                    }
                }
                
                window.handleRoleChange = handleRoleChange;
                
                // Load families for student selection
                async function loadFamilies() {
                    try {
                        const users = await apiRequest('/users');
                        const families = users.filter(u => u.role === 'family');
                        
                        if (linkedFamilySelect) {
                            linkedFamilySelect.innerHTML = '<option value="">No family linked</option>';
                            families.forEach(family => {
                                const option = document.createElement('option');
                                option.value = family._id || family.id;
                                option.textContent = family.name + ' (' + family.email + ')';
                                if (option.value === user.linkedFamilyId) option.selected = true;
                                linkedFamilySelect.appendChild(option);
                            });
                        }
                    } catch (error) {
                        console.error('Error loading families:', error);
                    }
                }
                
                // Load students for family selection
                async function loadStudents() {
                    try {
                        const users = await apiRequest('/users');
                        const students = users.filter(u => u.role === 'student');
                        
                        if (linkedStudentSelect) {
                            linkedStudentSelect.innerHTML = '<option value="">No student linked</option>';
                            students.forEach(student => {
                                const option = document.createElement('option');
                                option.value = student._id || student.id;
                                option.textContent = student.name + ' (' + student.email + ')';
                                if (option.value === user.linkedStudentId) option.selected = true;
                                linkedStudentSelect.appendChild(option);
                            });
                        }
                    } catch (error) {
                        console.error('Error loading students:', error);
                    }
                }
                
                // Initial setup - only show "Link to Family" if role is student
                const currentRole = roleSelect.value;
                if (currentRole === 'student') {
                    handleRoleChange();
                } else {
                    // Hide "Link to Family" for all other roles
                    if (linkedFamilyGroup) linkedFamilyGroup.style.display = 'none';
                    if (linkedStudentGroup) linkedStudentGroup.style.display = 'none';
                    // Only show student selection for family role
                    if (currentRole === 'family') {
                        handleRoleChange();
                    }
                }
            }
        }, 100);
    } catch (error) {
        showToast('Error loading user', 'error');
    }
}

// Delete Functions
async function deleteLevel(id) {
    if (!confirm('Are you sure you want to delete this level?')) return;
    
    try {
        await apiRequest(`/levels/${id}`, { method: 'DELETE' });
        showToast('Level deleted successfully', 'success');
        loadLevels();
    } catch (error) {
        showToast('Error deleting level', 'error');
    }
}

async function deleteWord(id) {
    if (!confirm('Are you sure you want to delete this word?')) return;
    
    try {
        await apiRequest(`/words/${id}`, { method: 'DELETE' });
        showToast('Word deleted successfully', 'success');
        loadWords();
    } catch (error) {
        showToast('Error deleting word', 'error');
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        await apiRequest(`/users/${id}`, { method: 'DELETE' });
        showToast('User deleted successfully', 'success');
        loadUsers();
    } catch (error) {
        showToast('Error deleting user', 'error');
    }
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/dashboard/login.html';
});

// Close modal on outside click
document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
        closeModal();
    }
});

document.getElementById('closeModal').addEventListener('click', closeModal);

// Initialize
async function loadLevelsIntoSelect(selectId) {
    try {
        const levels = await apiRequest('/levels');
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Level</option>';
            levels.forEach(level => {
                const option = document.createElement('option');
                option.value = level._id || level.id;
                option.textContent = level.name;
                select.appendChild(option);
            });
        }
    } catch (e) { console.error(e); }
}

function getActivityForm(defaultType = 'shapes') {
    return `
        <form id="activityForm" onsubmit="saveActivity(event)">
            <div class="form-group">
                <label>Type *</label>
                <select name="type" required>
                    <option value="shapes" ${defaultType === 'shapes' ? 'selected' : ''}>Shapes</option>
                    <option value="colors" ${defaultType === 'colors' ? 'selected' : ''}>Colors</option>
                </select>
            </div>
            <div class="form-group"><label>Title (English) *</label><input type="text" name="title" required></div>
            <div class="form-group"><label>Title (Arabic)</label><input type="text" name="titleAr"></div>
            <div class="form-group"><label>Level</label><select name="levelId" id="activityLevelSelect"></select></div>
            <div class="form-group"><label>Prompt *</label><input type="text" name="prompt" required></div>
            <div class="form-group"><label>Correct Answer *</label><input type="text" name="correctAnswer" required></div>
            <div class="form-group"><label>Options (comma-separated) *</label><input type="text" name="options" required></div>
            <div class="form-group"><label>Icons (emoji or #hex, comma-separated) *</label><input type="text" name="optionIcons" required></div>
            <div class="form-group"><label>Labels (comma-separated) *</label><input type="text" name="optionLabels" required></div>
            <div class="form-group"><label>Points</label><input type="number" name="points" value="10"></div>
            <div class="form-group">
                <label>Category</label>
                <select name="cognitiveCategory">
                    <option value="visual">Visual</option>
                    <option value="memory">Memory</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getStoryForm() {
    return `
        <form id="storyForm" onsubmit="saveStory(event)">
            <div class="form-group"><label>Title *</label><input type="text" name="title" required></div>
            <div class="form-group"><label>Title (Arabic)</label><input type="text" name="titleAr"></div>
            <div class="form-group"><label>Level</label><select name="levelId" id="storyLevelSelect"></select></div>
            <div class="form-group"><label>Pages (one per line) *</label><textarea name="pages" rows="4" required></textarea></div>
            <div class="form-group"><label>Questions JSON *</label>
                <textarea name="questionsJson" rows="5" required>[{"prompt":"Question?","options":["A","B"],"correctIndex":0}]</textarea>
            </div>
            <div class="form-group"><label>Points</label><input type="number" name="points" value="15"></div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;
}

async function saveActivity(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const body = {
        type: fd.get('type'),
        title: fd.get('title'),
        titleAr: fd.get('titleAr') || undefined,
        levelId: fd.get('levelId') || undefined,
        language: 'english',
        points: parseInt(fd.get('points')) || 10,
        cognitiveCategory: fd.get('cognitiveCategory') || 'visual',
        content: {
            prompt: fd.get('prompt'),
            correctAnswer: fd.get('correctAnswer'),
            options: fd.get('options').split(',').map(s => s.trim()),
            optionIcons: fd.get('optionIcons').split(',').map(s => s.trim()),
            optionLabels: fd.get('optionLabels').split(',').map(s => s.trim()),
        },
    };
    try {
        await apiRequest('/activities', { method: 'POST', body: JSON.stringify(body) });
        showToast('Activity created!');
        closeModal();
        loadActivities();
    } catch (e) { /* handled */ }
}

async function saveStory(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    let questions;
    try { questions = JSON.parse(fd.get('questionsJson')); }
    catch (e) { showToast('Invalid JSON', 'error'); return; }

    const body = {
        type: 'story',
        title: fd.get('title'),
        titleAr: fd.get('titleAr') || undefined,
        levelId: fd.get('levelId') || undefined,
        language: 'english',
        points: parseInt(fd.get('points')) || 15,
        cognitiveCategory: 'comprehension',
        content: {
            pages: fd.get('pages').split('\n').map(s => s.trim()).filter(Boolean),
            questions,
        },
    };
    try {
        await apiRequest('/activities', { method: 'POST', body: JSON.stringify(body) });
        showToast('Story created!');
        closeModal();
        loadStories();
    } catch (e) { /* handled */ }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const authToken = getAuthToken();
    if (!authToken) {
        // Redirect to login page
        window.location.href = '/dashboard/login.html';
        return;
    }
    
    // Load user info and check role
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            document.getElementById('userName').textContent = user.name || 'Admin';
            document.getElementById('userRole').textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator';
            
            // If family user, show only family section
            if (user.role === 'family') {
                // Hide all sections except family
                document.querySelectorAll('.content-section').forEach(section => {
                    section.style.display = 'none';
                    section.classList.remove('active');
                });
                const familySection = document.getElementById('family');
                if (familySection) {
                    familySection.style.display = 'block';
                    familySection.classList.add('active');
                }
                // Hide all nav items except family
                document.querySelectorAll('.nav-item').forEach(item => {
                    if (item.dataset.section !== 'family') {
                        item.style.display = 'none';
                    } else {
                        item.classList.add('active');
                    }
                });
                // Update page title
                document.getElementById('pageTitle').textContent = 'My Children';
                // Hide add button for family
                document.getElementById('addBtn').style.display = 'none';
                // Load family dashboard
                loadFamilyDashboard();
            } else {
                // Admin sees all sections
                initNavigation();
                loadDashboardStats();
                
                // Set initial add button handler
                document.getElementById('addBtn').onclick = () => {
                    const activeSection = document.querySelector('.content-section.active')?.id;
                    if (activeSection) {
                        openAddModal(activeSection);
                    }
                };
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
            initNavigation();
            loadDashboardStats();
        }
    } else {
        initNavigation();
        loadDashboardStats();
    }
});

