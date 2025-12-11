// Admin Dashboard JavaScript

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadDashboardData();
    setupEventListeners();
});

// Check if user is authenticated
async function checkAuth() {
    try {
        const response = await fetch('/api/admin/auth/check');
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = '/admin/login';
            return;
        }
        
        // Set username
        if (data.user && data.user.username) {
            document.getElementById('adminUsername').textContent = data.user.username;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/admin/login';
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/admin/dashboard/stats');
        const data = await response.json();
        
        if (data.success) {
            updateDashboardStats(data.data);
        }
        
        // Load recent bookings
        await loadRecentBookings();
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    document.getElementById('totalBookings').textContent = stats.totalBookings || 0;
    document.getElementById('pendingBookings').textContent = stats.pendingBookings || 0;
    document.getElementById('todayBookings').textContent = stats.todayBookings || 0;
    document.getElementById('totalCustomers').textContent = stats.totalCustomers || 0;
    document.getElementById('unreadMessages').textContent = stats.unreadMessages || 0;
    document.getElementById('monthRevenue').textContent = `£${(stats.monthRevenue || 0).toFixed(2)}`;
}

// Load recent bookings
async function loadRecentBookings() {
    try {
        const response = await fetch('/api/admin/bookings/recent?limit=10');
        const data = await response.json();
        
        if (data.success) {
            displayRecentBookings(data.data);
        }
    } catch (error) {
        console.error('Failed to load recent bookings:', error);
    }
}

// Display recent bookings
function displayRecentBookings(bookings) {
    const container = document.getElementById('recentBookingsList');
    
    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<p>No recent bookings</p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-item">
            <div class="booking-header">
                <span class="booking-reference">${booking.booking_reference}</span>
                <span class="booking-status status-${booking.status}">${booking.status}</span>
            </div>
            <div class="booking-details">
                <div><strong>Customer:</strong> ${booking.full_name}</div>
                <div><strong>Date:</strong> ${formatDate(booking.pickup_date)}</div>
                <div><strong>Time:</strong> ${booking.pickup_time}</div>
                <div><strong>From:</strong> ${booking.pickup_location}</div>
                <div><strong>To:</strong> ${booking.dropoff_location}</div>
                <div><strong>Vehicle:</strong> ${formatVehicle(booking.vehicle_type)}</div>
            </div>
            <div class="booking-actions">
                <button class="btn-success" onclick="updateBookingStatus('${booking.id}', 'confirmed')">Confirm</button>
                <button class="btn-secondary" onclick="viewBookingDetails('${booking.id}')">View Details</button>
                <button class="btn-danger" onclick="updateBookingStatus('${booking.id}', 'cancelled')">Cancel</button>
            </div>
        </div>
    `).join('');
}

// Load all bookings
async function loadAllBookings() {
    const status = document.getElementById('bookingStatusFilter').value;
    const date = document.getElementById('bookingDateFilter').value;
    
    let url = '/api/bookings?limit=100';
    if (status) url += `&status=${status}`;
    if (date) url += `&date=${date}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayBookingsTable(data.data);
        }
    } catch (error) {
        console.error('Failed to load bookings:', error);
    }
}

// Display bookings table
function displayBookingsTable(bookings) {
    const container = document.getElementById('bookingsTable');
    
    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<p>No bookings found</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr>
                        <td>${booking.booking_reference}</td>
                        <td>${booking.full_name}<br><small>${booking.email}</small></td>
                        <td>${formatDate(booking.pickup_date)}</td>
                        <td>${booking.pickup_time}</td>
                        <td>${booking.pickup_location} → ${booking.dropoff_location}</td>
                        <td>${formatVehicle(booking.vehicle_type)}</td>
                        <td><span class="booking-status status-${booking.status}">${booking.status}</span></td>
                        <td>
                            <button class="btn-secondary" onclick="viewBookingDetails('${booking.id}')">View</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Load messages
async function loadMessages() {
    const status = document.getElementById('messageStatusFilter').value;
    
    let url = '/api/contact?limit=100';
    if (status) url += `&status=${status}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayMessagesTable(data.data);
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

// Display messages table
function displayMessagesTable(messages) {
    const container = document.getElementById('messagesTable');
    
    if (!messages || messages.length === 0) {
        container.innerHTML = '<p>No messages found</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${messages.map(msg => `
                    <tr>
                        <td>${formatDateTime(msg.created_at)}</td>
                        <td>${msg.name}</td>
                        <td>${msg.email}</td>
                        <td>${msg.subject || 'General Inquiry'}</td>
                        <td><span class="booking-status status-${msg.status}">${msg.status}</span></td>
                        <td>
                            <button class="btn-secondary" onclick="viewMessage('${msg.id}')">View</button>
                            <button class="btn-success" onclick="markMessageRead('${msg.id}')">Mark Read</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Update booking status
async function updateBookingStatus(bookingId, status) {
    if (!confirm(`Are you sure you want to ${status} this booking?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Booking status updated successfully');
            await loadRecentBookings();
            await loadDashboardData();
        } else {
            alert('Failed to update booking status');
        }
    } catch (error) {
        console.error('Failed to update booking status:', error);
        alert('An error occurred');
    }
}

// Mark message as read
async function markMessageRead(messageId) {
    try {
        const response = await fetch(`/api/contact/${messageId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'read' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadMessages();
            await loadDashboardData();
        }
    } catch (error) {
        console.error('Failed to mark message as read:', error);
    }
}

// View booking details
function viewBookingDetails(bookingId) {
    alert(`View booking details for ID: ${bookingId}\n\nThis feature will show full booking details in a modal.`);
}

// View message
function viewMessage(messageId) {
    alert(`View message ID: ${messageId}\n\nThis feature will show the full message in a modal.`);
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.admin-nav-menu a[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.dataset.section;
            switchSection(section);
        });
    });
    
    // Mobile menu toggle
    const mobileToggle = document.getElementById('adminMobileToggle');
    const navMenu = document.getElementById('adminNavMenu');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        await logout();
    });
    
    // Refresh buttons
    document.getElementById('refreshBookings')?.addEventListener('click', loadAllBookings);
    document.getElementById('refreshMessages')?.addEventListener('click', loadMessages);
    
    // Filters
    document.getElementById('bookingStatusFilter')?.addEventListener('change', loadAllBookings);
    document.getElementById('bookingDateFilter')?.addEventListener('change', loadAllBookings);
    document.getElementById('messageStatusFilter')?.addEventListener('change', loadMessages);
    
    // Change password form
    document.getElementById('changePasswordForm')?.addEventListener('submit', handlePasswordChange);
}

// Switch section
function switchSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.admin-nav-menu a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`)?.classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        bookings: 'Bookings Management',
        customers: 'Customer Management',
        messages: 'Messages',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName] || sectionName;
    
    // Load section data
    if (sectionName === 'bookings') {
        loadAllBookings();
    } else if (sectionName === 'messages') {
        loadMessages();
    }
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Password changed successfully');
            document.getElementById('changePasswordForm').reset();
        } else {
            alert(data.message || 'Failed to change password');
        }
    } catch (error) {
        console.error('Failed to change password:', error);
        alert('An error occurred');
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
    } catch (error) {
        console.error('Logout failed:', error);
        window.location.href = '/admin/login';
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatVehicle(vehicle) {
    const vehicles = {
        'e-class': 'Mercedes E-Class',
        's-class': 'Mercedes S-Class',
        'v-class': 'Mercedes V-Class'
    };
    return vehicles[vehicle] || vehicle;
}
