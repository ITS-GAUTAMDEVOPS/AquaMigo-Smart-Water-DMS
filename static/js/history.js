// AquaMigo - Order History Script

let currentCustomerId = 1; // Default customer ID
let allOrders = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Load order history
    await loadOrderHistory();
    
    // Event listeners
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            await loadOrderHistory();
            showToast('History refreshed', 'success');
        });
    }
    
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', filterOrders);
    }
    
    const searchOrder = document.getElementById('searchOrder');
    if (searchOrder) {
        searchOrder.addEventListener('input', filterOrders);
    }
    
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeOrderDetailsModal);
    }
    
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeOrderDetailsModal);
    }
    
    const trackOrderFromHistory = document.getElementById('trackOrderFromHistory');
    if (trackOrderFromHistory) {
        trackOrderFromHistory.addEventListener('click', () => {
            const orderId = document.getElementById('modalOrderId').textContent;
            window.location.href = `/track?orderId=${orderId}`;
        });
    }

    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', async () => {
            const orderId = document.getElementById('modalOrderId').textContent.trim();
            if (!orderId || orderId === '-') return;

            const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
            if (!confirmCancel) return;

            try {
                const response = await API.updateOrderStatus(orderId, 'Cancelled');
                if (response && response.data) {
                    showToast('Order cancelled successfully', 'success');
                    closeOrderDetailsModal();
                    await loadOrderHistory();
                }
            } catch (error) {
                console.error('Error cancelling order:', error);
                showToast(error.message || 'Unable to cancel order', 'error');
            }
        });
    }
});

async function loadOrderHistory() {
    try {
        const response = await API.getCustomerOrders(currentCustomerId);
        allOrders = response.data;
        
        if (allOrders.length === 0) {
            document.getElementById('ordersContainer').style.display = 'none';
            document.getElementById('emptyState').style.display = 'block';
            return;
        }
        
        document.getElementById('ordersContainer').style.display = 'block';
        document.getElementById('emptyState').style.display = 'none';
        
        displayOrders(allOrders);
        
    } catch (error) {
        console.error('Error loading order history:', error);
        showToast('Error loading order history', 'error');
    }
}

function displayOrders(orders) {
    const container = document.getElementById('ordersContainer');
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem;">No orders found</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => {
        const statusColor = getStatusColor(order.status);
        
        return `
            <div class="order-history-item" onclick="showOrderDetails('${order.order_id}')">
                <div class="order-header">
                    <div>
                        <div class="order-id">${order.order_id}</div>
                        <div class="order-date">${formatDate(order.created_at)}</div>
                    </div>
                    <span class="badge ${statusColor}">${order.status}</span>
                </div>
                <div class="order-summary">
                    <div class="summary-item">
                        <span class="summary-label">Amount</span>
                        <span class="summary-value">${formatCurrency(order.total_amount)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Items</span>
                        <span class="summary-value">${getItemCount(order.items)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Status</span>
                        <span class="summary-value">${order.status}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Payment</span>
                        <span class="summary-value">${order.payment_status}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterOrders() {
    const statusFilter = document.getElementById('filterStatus').value;
    const searchTerm = document.getElementById('searchOrder').value.toLowerCase();
    
    let filtered = allOrders;
    
    if (statusFilter) {
        filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(order => 
            order.order_id.toLowerCase().includes(searchTerm)
        );
    }
    
    displayOrders(filtered);
}

async function showOrderDetails(orderId) {
    try {
        const response = await API.getOrder(orderId);
        const order = response.data;
        
        // Populate modal with order details
        document.getElementById('modalOrderId').textContent = order.order_id;
        document.getElementById('modalOrderDate').textContent = formatDate(order.created_at);
        document.getElementById('modalTotalAmount').textContent = formatCurrency(order.total_amount);
        document.getElementById('modalStatus').textContent = order.status;
        document.getElementById('modalStatus').className = `value badge ${getStatusColor(order.status)}`;
        
        // Populate items
        const itemsBody = document.getElementById('modalItemsBody');
        if (order.items && order.items.length > 0) {
            itemsBody.innerHTML = order.items.map(item => `
                <tr>
                    <td>${item.product_name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.unit_price)}</td>
                    <td>${formatCurrency(item.subtotal)}</td>
                </tr>
            `).join('');
        }
        
        // Show modal
        openModal('orderDetailsModal');
        
    } catch (error) {
        console.error('Error loading order details:', error);
        showToast('Error loading order details', 'error');
    }
}

function closeOrderDetailsModal() {
    closeModal('orderDetailsModal');
}

function getStatusColor(status) {
    const colorMap = {
        'Placed': 'badge-info',
        'Confirmed': 'badge-warning',
        'Out for Delivery': 'badge-warning',
        'Delivered': 'badge-success',
        'Cancelled': 'badge-danger'
    };
    return colorMap[status] || 'badge-info';
}

function getItemCount(items) {
    if (!items || items.length === 0) return '0 items';
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return count === 1 ? '1 item' : `${count} items`;
}
