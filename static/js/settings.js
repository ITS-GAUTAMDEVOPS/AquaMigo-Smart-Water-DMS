// AquaMigo - Settings Script

document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Form submissions
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
    
    const notificationsForm = document.getElementById('notificationsForm');
    if (notificationsForm) {
        notificationsForm.addEventListener('submit', handleNotificationsSubmit);
    }
    
    const preferencesForm = document.getElementById('preferencesForm');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', handlePreferencesSubmit);
    }
    
    // Load saved preferences
    loadPreferences();
});

function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Highlight selected button
    const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // Save active tab
    localStorage.setItem('activeSettingsTab', tabName);
}

function handleProfileSubmit(e) {
    e.preventDefault();
    
    const profileData = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        mobile: document.getElementById('profileMobile').value,
        city: document.getElementById('profileCity').value,
        address: document.getElementById('profileAddress').value,
        postal_code: document.getElementById('profilePostalCode').value
    };
    
    // Validate mobile
    if (profileData.mobile && !isValidMobile(profileData.mobile)) {
        showToast('Please enter a valid 10-digit mobile number', 'warning');
        return;
    }
    
    // Save to local storage (in real app, would send to backend)
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    showToast('Profile updated successfully', 'success');
}

function handleNotificationsSubmit(e) {
    e.preventDefault();
    
    const notifications = {
        orderPlaced: document.getElementById('orderPlaced').checked,
        orderConfirmed: document.getElementById('orderConfirmed').checked,
        outForDelivery: document.getElementById('outForDelivery').checked,
        delivered: document.getElementById('delivered').checked,
        promotions: document.getElementById('promotions').checked
    };
    
    // Save to local storage
    localStorage.setItem('notificationPrefs', JSON.stringify(notifications));
    showToast('Notification preferences saved', 'success');
}

function handlePreferencesSubmit(e) {
    e.preventDefault();
    
    const preferences = {
        defaultPayment: document.getElementById('defaultPayment').value,
        defaultLanguage: document.getElementById('defaultLanguage').value,
        theme: document.getElementById('theme').value
    };
    
    // Save to local storage
    localStorage.setItem('appPreferences', JSON.stringify(preferences));
    
    // Apply theme if changed
    applyTheme(preferences.theme);
    
    showToast('Preferences updated successfully', 'success');
}

function loadPreferences() {
    // Load profile
    const profile = localStorage.getItem('userProfile');
    if (profile) {
        try {
            const data = JSON.parse(profile);
            document.getElementById('profileName').value = data.name || '';
            document.getElementById('profileEmail').value = data.email || '';
            document.getElementById('profileMobile').value = data.mobile || '';
            document.getElementById('profileCity').value = data.city || '';
            document.getElementById('profileAddress').value = data.address || '';
            document.getElementById('profilePostalCode').value = data.postal_code || '';
        } catch (e) {
            console.error('Error loading profile:', e);
        }
    }
    
    // Load notifications
    const notifications = localStorage.getItem('notificationPrefs');
    if (notifications) {
        try {
            const data = JSON.parse(notifications);
            document.getElementById('orderPlaced').checked = data.orderPlaced !== false;
            document.getElementById('orderConfirmed').checked = data.orderConfirmed !== false;
            document.getElementById('outForDelivery').checked = data.outForDelivery !== false;
            document.getElementById('delivered').checked = data.delivered !== false;
            document.getElementById('promotions').checked = data.promotions !== false;
        } catch (e) {
            console.error('Error loading notifications:', e);
        }
    }
    
    // Load preferences
    const preferences = localStorage.getItem('appPreferences');
    if (preferences) {
        try {
            const data = JSON.parse(preferences);
            document.getElementById('defaultPayment').value = data.defaultPayment || '';
            document.getElementById('defaultLanguage').value = data.defaultLanguage || 'en';
            document.getElementById('theme').value = data.theme || 'light';
        } catch (e) {
            console.error('Error loading preferences:', e);
        }
    }
    
    // Load active tab
    const activeTab = localStorage.getItem('activeSettingsTab') || 'profile';
    switchTab(activeTab);
}

function applyTheme(theme) {
    const html = document.documentElement;
    
    if (theme === 'dark') {
        html.style.colorScheme = 'dark';
    } else if (theme === 'light') {
        html.style.colorScheme = 'light';
    } else {
        html.style.colorScheme = 'light dark';
    }
    
    // Store theme preference
    localStorage.setItem('theme', theme);
}
