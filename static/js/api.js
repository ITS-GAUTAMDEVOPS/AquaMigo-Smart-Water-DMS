// AquaMigo - API Module
// Handles all API calls to the backend

const API = {
    BASE_URL: 'http://127.0.0.1:5000/api',
    
    // Utility function for API calls
    async call(method, endpoint, data = null) {
        const url = `${this.BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'API Error');
            }
            
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // ==================== DASHBOARD ====================
    getDashboardStats() {
        return this.call('GET', '/dashboard/stats');
    },
    
    getRecentOrders() {
        return this.call('GET', '/dashboard/recent-orders');
    },
    
    getMonthlySales() {
        return this.call('GET', '/dashboard/monthly-sales');
    },
    
    // ==================== PRODUCTS ====================
    getAllProducts() {
        return this.call('GET', '/products');
    },
    
    getProduct(productId) {
        return this.call('GET', `/products/${productId}`);
    },
    
    // ==================== CART ====================
    getCart(customerId) {
        return this.call('GET', `/cart/${customerId}`);
    },
    
    addToCart(customerId, productId, quantity) {
        return this.call('POST', `/cart/${customerId}/add`, {
            product_id: productId,
            quantity: quantity
        });
    },
    
    removeFromCart(customerId, productId) {
        return this.call('DELETE', `/cart/${customerId}/remove/${productId}`);
    },
    
    updateCartItem(customerId, productId, quantity) {
        return this.call('PUT', `/cart/${customerId}/update`, {
            product_id: productId,
            quantity: quantity
        });
    },
    
    clearCart(customerId) {
        return this.call('DELETE', `/cart/${customerId}/clear`);
    },
    
    // ==================== ORDERS ====================
    createOrderFromCart(customerId, customerName, customerMobile, deliveryAddress, paymentMethod) {
        return this.call('POST', '/orders/create', {
            customer_id: customerId,
            customer_name: customerName,
            customer_mobile: customerMobile,
            delivery_address: deliveryAddress,
            payment_method: paymentMethod
        });
    },
    
    createDirectOrder(customerName, customerMobile, deliveryAddress, products, paymentMethod) {
        return this.call('POST', '/orders/buy-now', {
            customer_name: customerName,
            customer_mobile: customerMobile,
            delivery_address: deliveryAddress,
            products: products,
            payment_method: paymentMethod
        });
    },
    
    getOrder(orderId) {
        return this.call('GET', `/orders/${orderId}`);
    },

    deleteOrder(orderId) {
        return this.call('DELETE', `/orders/${orderId}`);
    },
    
    updateOrderStatus(orderId, status) {
        return this.call('PUT', `/orders/${orderId}/status`, {
            status: status
        });
    },
    
    getCustomerOrders(customerId) {
        return this.call('GET', `/orders/customer/${customerId}`);
    }
};

// ==================== UTILITY FUNCTIONS ====================

// Toast Notification
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Modal Control
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// Format currency
function formatCurrency(amount) {
    return `₹${parseFloat(amount).toFixed(2)}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get URL parameters
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate mobile number
function isValidMobile(mobile) {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
}

// Storage helper for session data
const Storage = {
    setCustomerId(id) {
        sessionStorage.setItem('customerId', id);
    },
    
    getCustomerId() {
        return sessionStorage.getItem('customerId') || 0;
    },
    
    clearCustomerId() {
        sessionStorage.removeItem('customerId');
    },
    
    setOrderId(id) {
        sessionStorage.setItem('currentOrderId', id);
    },
    
    getOrderId() {
        return sessionStorage.getItem('currentOrderId');
    },
    
    clearOrderId() {
        sessionStorage.removeItem('currentOrderId');
    }
};

// Navbar active state
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        
        const href = item.getAttribute('href');
        if (!href) return;
        
        const pageName = href.split('/').pop() || 'index';
        if (pageName === currentPage || (pageName === 'index' && currentPage === '') || 
            (pageName === '/' && currentPage === '')) {
            item.classList.add('active');
        }
    });
});
