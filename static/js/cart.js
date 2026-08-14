// AquaMigo - Shopping Cart Script

let currentCustomerId = 1; // Default customer ID (in real app, would be from login)

document.addEventListener('DOMContentLoaded', async () => {
    // Load products
    await loadProducts();
    
    // Load cart
    await loadCart();
    
    // Event listeners
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', openCheckoutModal);
    }
    
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
    
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeCheckoutModal);
    }
    
    const cancelCheckout = document.getElementById('cancelCheckout');
    if (cancelCheckout) {
        cancelCheckout.addEventListener('click', closeCheckoutModal);
    }
    
    const continueShopping = document.getElementById('continueShopping');
    if (continueShopping) {
        continueShopping.addEventListener('click', () => window.location.href = '/cart');
    }
});

async function loadProducts() {
    try {
        const response = await API.getAllProducts();
        const products = response.data || [];
        
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        if (products.length === 0) {
            // Show demo products if database is empty
            productsGrid.innerHTML = generateDemoProducts();
            attachAddToCartListeners();
            return;
        }
        
        // Use actual products from database
        productsGrid.innerHTML = products.map(product => {
            const stock = product.stock_quantity;
            const stockStatus = stock > 100 ? 'in-stock' : stock > 0 ? 'low-stock' : 'out-of-stock';
            const stockLabel = stock > 100 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock';
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
                        <div class="product-actions">
                            <div class="quantity-selector">
                                <button class="qty-btn" onclick="decreaseQty(this)">−</button>
                                <input type="number" class="quantity-input" value="1" min="1" max="${stock}" data-product-id="${product.id}" readonly>
                                <button class="qty-btn" onclick="increaseQty(this)">+</button>
                            </div>
                            <button class="btn btn-primary btn-small add-to-cart-btn" data-product-id="${product.id}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        attachAddToCartListeners();
        
    } catch (error) {
        console.error('Error loading products:', error);
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = generateDemoProducts();
            attachAddToCartListeners();
        }
    }
}

// Generate demo products if database is empty
function generateDemoProducts() {
    const demoProducts = [
        {
            id: 1,
            name: '1L Premium Mineral Water',
            size: '1L / 1000ML',
            description: 'Pure mineral water from natural springs',
            price: 25,
            image: '/static/images/logos/1-L-MINERAL.png',
            stock: 500
        },
        {
            id: 2,
            name: '1L Alkaline Water',
            size: '1L / 1000ML',
            description: 'pH-balanced alkaline water for health',
            price: 35,
            image: '/static/images/logos/1-L-MINERAL.png',
            stock: 350
        },
        {
            id: 3,
            name: '1L Spring Water',
            size: '1L / 1000ML',
            description: 'Natural spring water from pristine mountains',
            price: 40,
            image: '/static/images/logos/1-L-SPRINKLE-WATER.png',
            stock: 400
        },
        {
            id: 4,
            name: '5L Mineral Water',
            size: '5L / 5000ML',
            description: 'Large bulk water for offices and families',
            price: 100,
            image: '/static/images/logos/5-L-MINERAL.png',
            stock: 200
        },
        {
            id: 5,
            name: '5L Spring Water',
            size: '5L / 5000ML',
            description: 'Bulk natural spring water',
            price: 199,
            image: '/static/images/logos/5-L-SPRING.png',
            stock: 180
        },
        {
            id: 6,
            name: '5L Sprinkle Water',
            size: '5L / 5000ML',
            description: 'Pure sprinkle water with enhanced filtration',
            price: 120,
            image: '/static/images/logos/5-L-SPRINKLE WATER.png',
            stock: 250
        }
    ];
    
    return demoProducts.map(product => `
        <div class="product-card">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     onerror="this.src='/static/images/logos/1-L-Bottle-image.png'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-size">${product.size}</p>
                <p class="product-description">${product.description}</p>
                <p class="product-stock">
                    <span class="stock-indicator in-stock">In Stock</span>
                </p>
                <p class="product-price"><strong>${formatCurrency(product.price)}</strong></p>
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="qty-btn" onclick="decreaseQty(this)">−</button>
                        <input type="number" class="quantity-input" value="1" min="1" max="${product.stock}" data-product-id="${product.id}" readonly>
                        <button class="qty-btn" onclick="increaseQty(this)">+</button>
                    </div>
                    <button class="btn btn-primary btn-small add-to-cart-btn" data-product-id="${product.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper functions for quantity adjustment
function increaseQty(btn) {
    const input = btn.parentElement.querySelector('.quantity-input');
    const max = parseInt(input.max);
    const current = parseInt(input.value);
    if (current < max) {
        input.value = current + 1;
    }
}

function decreaseQty(btn) {
    const input = btn.parentElement.querySelector('.quantity-input');
    const current = parseInt(input.value);
    if (current > 1) {
        input.value = current - 1;
    }
}

function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            addToCartClick(productId, this);
        });
    });
}

async function addToCartClick(productId, button) {
    try {
        // Get button if not provided
        if (!button) {
            button = document.querySelector(`.add-to-cart-btn[data-product-id="${productId}"]`);
        }
        
        // Find the quantity input in the same product card
        const card = button.closest('.product-card');
        const quantityInput = card.querySelector('.quantity-input');
        const quantity = parseInt(quantityInput.value);
        
        if (quantity <= 0) {
            showToast('Please select a valid quantity', 'warning');
            return;
        }
        
        // Disable button
        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = 'Adding...';
        
        const response = await API.addToCart(currentCustomerId, productId, quantity);
        
        showToast('Product added to cart successfully', 'success');
        
        // Reset quantity
        quantityInput.value = 1;
        
        // Reload cart
        await loadCart();
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast(error.message || 'Error adding to cart', 'error');
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = 'Add to Cart';
        }
    }
}

async function loadCart() {
    try {
        const response = await API.getCart(currentCustomerId);
        const cart = response.data;
        
        const cartContainer = document.getElementById('cartItemsContainer');
        if (!cartContainer) return;
        
        if (!cart.items || cart.items.length === 0) {
            cartContainer.innerHTML = '<p class="empty-message">Your cart is empty</p>';
            document.getElementById('subtotal').textContent = '₹0';
            document.getElementById('cartTotal').textContent = '₹50';
            return;
        }
        
        let subtotal = 0;
        cartContainer.innerHTML = cart.items.map(item => {
            const itemTotal = item.quantity * item.price;
            subtotal += itemTotal;
            
            return `
                <div class="cart-item">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.product_name}</div>
                        <div class="cart-item-price">${formatCurrency(item.price)}</div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn" onclick="updateQuantity(${item.product_id}, ${item.quantity - 1})">−</button>
                            <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${item.product_id}, ${item.quantity + 1})">+</button>
                            <button class="qty-btn" style="background-color: #fee2e2; color: #991b1b;" onclick="removeFromCart(${item.product_id})">🗑</button>
                        </div>
                    </div>
                    <div style="text-align: right; font-weight: 600;">
                        ${formatCurrency(itemTotal)}
                    </div>
                </div>
            `;
        }).join('');
        
        const shipping = 50;
        const total = subtotal + shipping;
        
        document.getElementById('subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('cartTotal').textContent = formatCurrency(total);
        
    } catch (error) {
        console.error('Error loading cart:', error);
        // Show empty cart message instead of error
        const cartContainer = document.getElementById('cartItemsContainer');
        if (cartContainer) {
            cartContainer.innerHTML = '<p class="empty-message">Your cart is empty</p>';
        }
        document.getElementById('subtotal').textContent = '₹0';
        document.getElementById('cartTotal').textContent = '₹50';
    }
}

async function updateQuantity(productId, newQuantity) {
    try {
        if (newQuantity <= 0) {
            await removeFromCart(productId);
            return;
        }
        
        await API.updateCartItem(currentCustomerId, productId, newQuantity);
        await loadCart();
    } catch (error) {
        console.error('Error updating quantity:', error);
        showToast(error.message || 'Error updating quantity', 'error');
    }
}

async function removeFromCart(productId) {
    try {
        if (confirm('Are you sure you want to remove this item?')) {
            await API.removeFromCart(currentCustomerId, productId);
            showToast('Item removed from cart', 'success');
            await loadCart();
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showToast('Error removing item', 'error');
    }
}

function openCheckoutModal() {
    const cart = document.getElementById('cartItemsContainer').textContent;
    if (cart.includes('empty')) {
        showToast('Your cart is empty', 'warning');
        return;
    }
    openModal('checkoutModal');
}

function closeCheckoutModal() {
    closeModal('checkoutModal');
}

async function handleCheckout(e) {
    e.preventDefault();
    
    try {
        const form = e.target;
        const customerName = document.getElementById('customerName').value.trim();
        const customerMobile = document.getElementById('customerMobile').value.trim();
        const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
        const paymentMethod = document.getElementById('paymentMethod').value;
        
        // Validate form
        if (!customerName || !customerMobile || !deliveryAddress || !paymentMethod) {
            showToast('Please fill all required fields', 'warning');
            return;
        }
        
        if (!isValidMobile(customerMobile)) {
            showToast('Please enter a valid 10-digit mobile number', 'warning');
            return;
        }
        
        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Order...';
        
        // Create order
        const response = await API.createOrderFromCart(
            currentCustomerId,
            customerName,
            customerMobile,
            deliveryAddress,
            paymentMethod
        );
        
        if (response.status === 'success') {
            showToast('Order created successfully!', 'success');
            
            // Store order ID and redirect after a short delay
            Storage.setOrderId(response.data.order_id);
            
            setTimeout(() => {
                window.location.href = `/track?orderId=${response.data.order_id}`;
            }, 1500);
        }
        
    } catch (error) {
        console.error('Error creating order:', error);
        showToast(error.message || 'Error creating order', 'error');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order';
    }
}
