// AquaMigo - Order Tracking Script

document.addEventListener('DOMContentLoaded', () => {
    // Check if order ID is in URL
    const urlOrderId = getUrlParam('orderId');
    if (urlOrderId) {
        document.getElementById('orderIdInput').value = urlOrderId;
        searchOrder(urlOrderId);
    }
    
    // Form submission
    const trackForm = document.getElementById('trackForm');
    if (trackForm) {
        trackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const orderId = document.getElementById('orderIdInput').value.trim();
            if (orderId) {
                searchOrder(orderId);
            }
        });
    }
    
    // Track another button
    const trackAnotherBtn = document.getElementById('trackAnotherBtn');
    if (trackAnotherBtn) {
        trackAnotherBtn.addEventListener('click', () => {
            document.getElementById('orderIdInput').value = '';
            document.getElementById('trackResultSection').style.display = 'none';
            document.getElementById('noResultSection').style.display = 'none';
            document.getElementById('orderIdInput').focus();
        });
    }
    
    // Go home button
    const goHomeBtn = document.getElementById('goHomeBtn');
    if (goHomeBtn) {
        goHomeBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
});

async function searchOrder(orderId) {
    try {
        const response = await API.getOrder(orderId);
        const order = response.data;
        
        displayOrderTracking(order);
        
    } catch (error) {
        console.error('Error fetching order:', error);
        showToast('Order not found', 'error');
        
        // Show no result section
        document.getElementById('trackResultSection').style.display = 'none';
        document.getElementById('noResultSection').style.display = 'block';
    }
}

function displayOrderTracking(order) {
    // Show result section
    document.getElementById('trackResultSection').style.display = 'block';
    document.getElementById('noResultSection').style.display = 'none';
    
    // Update stepper status
    updateStepper(order.status);
    
    // Update dates
    document.getElementById('date-placed').textContent = formatDate(order.created_at) || 'In progress';
    
    // Set dates based on status
    const createdDate = new Date(order.created_at);
    const confirmedDate = new Date(createdDate);
    confirmedDate.setDate(confirmedDate.getDate() + 1);
    const deliveryDate = new Date(confirmedDate);
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    
    document.getElementById('date-confirmed').textContent = 
        order.status !== 'Placed' ? confirmedDate.toLocaleDateString('en-IN') : '-';
    document.getElementById('date-delivery').textContent = 
        order.status === 'Out for Delivery' || order.status === 'Delivered' ? 
        deliveryDate.toLocaleDateString('en-IN') : '-';
    document.getElementById('date-delivered').textContent = 
        order.status === 'Delivered' ? deliveryDate.toLocaleDateString('en-IN') : '-';
    
    // Update order details
    document.getElementById('customerNameDisplay').textContent = order.customer_name;
    document.getElementById('customerMobileDisplay').textContent = order.customer_mobile;
    document.getElementById('deliveryAddressDisplay').textContent = order.delivery_address;
    document.getElementById('orderIdDisplay').textContent = order.order_id;
    document.getElementById('orderDateDisplay').textContent = formatDate(order.created_at);
    document.getElementById('totalAmountDisplay').textContent = formatCurrency(order.total_amount);
    document.getElementById('paymentStatusDisplay').textContent = order.payment_status;
    
    // Get delivery info if available
    const deliveryDate2 = new Date(order.created_at);
    deliveryDate2.setDate(deliveryDate2.getDate() + 2);
    document.getElementById('estimatedDeliveryDisplay').textContent = 
        deliveryDate2.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Update order items
    const itemsBody = document.getElementById('orderItemsBody');
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
}

function updateStepper(status) {
    const steps = document.querySelectorAll('.stepper-step');
    const statusMap = {
        'Placed': 0,
        'Confirmed': 1,
        'Out for Delivery': 2,
        'Delivered': 3
    };
    
    const currentStep = statusMap[status] || 0;
    
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        
        if (index < currentStep) {
            step.classList.add('completed');
        } else if (index === currentStep) {
            step.classList.add('active');
        }
    });
}
