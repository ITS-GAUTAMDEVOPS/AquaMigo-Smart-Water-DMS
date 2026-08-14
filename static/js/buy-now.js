// ==========================================
// AquaMigo Buy Now - Product Ordering Module
// ==========================================
// This module handles product selection, 
// order form management, and checkout process

let selectedProducts = {};

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize page by loading available products
    await loadBuyNowProducts();
    
    // Attach form submission handler
    const buyNowForm = document.getElementById('buyNowForm');
    if (buyNowForm) {
        buyNowForm.addEventListener('submit', handleBuyNowSubmit);
    }
    
    // Setup order tracking button
    const trackOrderBtn = document.getElementById('trackOrderBtn');
    if (trackOrderBtn) {
        trackOrderBtn.addEventListener('click', () => {
            const orderId = document.getElementById('confirmedOrderId').textContent;
            window.location.href = `/track?orderId=${orderId}`;
        });
    }
    
    // Setup continue shopping button
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            window.location.href = '/buy-now';
        });
    }
});

/**
 * Load all available products and display them in two sections:
 * 1. Product showcase with images
 * 2. Product selection form with checkboxes
 */
async function loadBuyNowProducts() {
    try {
        // Fetch products from API
        const response = await API.getAllProducts();
        const products = response.data;
        
        // ===== Section 1: Product Showcase =====
        const productsList = document.getElementById('productsList');
        if (productsList) {
            productsList.innerHTML = products.map(product => {
                // Determine stock status for display
                const stock = product.stock_quantity;
                const stockStatus = stock > 100 ? 'in-stock' : stock > 0 ? 'low-stock' : 'out-of-stock';
                const stockLabel = stock > 100 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock';
                
                // Use product image or fallback to default bottle image
                const imagePath = product.image_path || '/static/images/logos/1-L-Bottle-image.png';
                
                return `
                    <div class="product-card">
                        <div class="product-image-container">
                            <img src="${imagePath}" alt="${product.name}" class="product-image" 
                                 onerror="this.src='/static/images/logos/1-L-Bottle-image.png'">
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-size">${product.bottle_size_liters}L / ${product.bottle_size_ml}ML</p>
                            <p class="product-description">${product.description || 'Premium water bottle'}</p>
                            <p class="product-stock">
                                <span class="stock-indicator ${stockStatus}">${stockLabel}</span>
                            </p>
                            <p class="product-price"><strong>${formatCurrency(product.price)}</strong></p>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // ===== Section 2: Product Selection Form =====
        const productSelection = document.getElementById('productSelection');
        if (productSelection) {
            productSelection.innerHTML = products.map(product => {
                return `
                    <div class="product-select-item">
                        <label style="display: flex; align-items: center; gap: 10px; flex: 1;">
                            <input type="checkbox" value="${product.id}" class="product-checkbox" 
                                   onchange="updateProductSelection()">
                            <span style="flex: 1;"><strong>${product.name}</strong> (${product.bottle_size_liters}L)</span>
                            <span style="color: var(--text-secondary);">${formatCurrency(product.price)}</span>
                        </label>
                        <input type="number" class="quantity-input" value="1" min="1" max="${product.stock_quantity}" 
                               data-product-id="${product.id}" onchange="updateProductSelection()" style="display: none;">
                    </div>
                `;
            }).join('');
            
            // Add interactive handlers to product checkboxes
            document.querySelectorAll('.product-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    const item = e.target.parentElement.parentElement;
                    const quantityInput = item.querySelector('.quantity-input');
                    
                    // Show/hide quantity input based on checkbox state
                    if (e.target.checked) {
                        quantityInput.style.display = 'block';
                    } else {
                        quantityInput.style.display = 'none';
                    }
                    updateProductSelection();
                });
            });
        }
        
    } catch (error) {
        console.error('Error loading products:', error);
        const productsList = document.getElementById('productsList');
        if (productsList) {
            productsList.innerHTML = '<p style=\"padding: 20px; text-align: center;\">No products available</p>';
        }
    }
}

/**
 * Update total price based on selected products and quantities
 * Recalculates price summary in real-time
 */
function updateProductSelection() {
    selectedProducts = {};
    let totalPrice = 0;
    
    // Iterate through all checked products
    document.querySelectorAll('.product-checkbox:checked').forEach(checkbox => {
        const productId = parseInt(checkbox.value);
        const item = checkbox.parentElement.parentElement;
        const quantityInput = item.querySelector('.quantity-input');
        const quantity = parseInt(quantityInput.value) || 1;
        
        // Store selected products with their quantities
        selectedProducts[productId] = quantity;
        
        // Calculate price for this product
        const priceText = item.querySelector('span:last-child').textContent;
        const price = parseFloat(priceText.replace('₹', ''));
        totalPrice += price * quantity;
    });
    
    // Calculate final total with shipping charges
    const shipping = 50;
    const total = totalPrice + shipping;
    
    // Update display
    document.getElementById('productPrice').textContent = formatCurrency(totalPrice);
    document.getElementById('totalAmount').textContent = formatCurrency(total);
}

/**
 * Handle form submission - validate and place order
 */
async function handleBuyNowSubmit(e) {
    e.preventDefault();
    
    try {
        // Collect form data
        const customerName = document.getElementById('customerName').value.trim();
        const customerMobile = document.getElementById('customerMobile').value.trim();
        const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
        const paymentMethod = document.getElementById('paymentMethod').value;
        
        // Validate all fields are filled
        if (!customerName || !customerMobile || !deliveryAddress || !paymentMethod) {
            showToast('Please fill all required fields', 'warning');
            return;
        }
        
        // Validate mobile number format
        if (!isValidMobile(customerMobile)) {
            showToast('Please enter a valid 10-digit mobile number', 'warning');
            return;
        }
        
        // Ensure at least one product is selected
        if (Object.keys(selectedProducts).length === 0) {
            showToast('Please select at least one product', 'warning');
            return;
        }
        
        // Disable submit button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Order...';
        
        // Create order
        const response = await API.createDirectOrder(
            customerName,
            customerMobile,
            deliveryAddress,
            selectedProducts,
            paymentMethod
        );
        
        if (response.status === 'success') {
            const order = response.data;
            
            // Show confirmation modal
            showConfirmation(order);
        }
        
    } catch (error) {
        console.error('Error creating order:', error);
        showToast(error.message || 'Error creating order', 'error');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order';
    }
}

function showConfirmation(order) {
    // Populate confirmation details
    document.getElementById('confirmedOrderId').textContent = order.order_id;
    document.getElementById('confirmedAmount').textContent = formatCurrency(order.total_amount);
    
    // Calculate estimated delivery date
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 2);
    document.getElementById('estimatedDelivery').textContent = 
        deliveryDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Hide form and show confirmation
    document.getElementById('buyNowForm').style.display = 'none';
    
    // Show confirmation modal
    openModal('confirmationModal');
}
