from flask import Flask, render_template, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from config import config
from database.connection import db, init_db
from models import Customer, Product, Order, Cart

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__, 
            template_folder='templates',
            static_folder='static')

# Configuration
env = os.getenv('FLASK_ENV', 'development')
app.config.from_object(config[env])

# Initialize extensions
CORS(app)
init_db(app)

# Create database tables automatically if they don't exist
with app.app_context():
    try:
        db.create_all()
        print("[OK] Database initialized")

        if Product.query.count() == 0:
            demo_products = [
                Product(
                    name='1L Premium Mineral Water',
                    bottle_size_liters=1.0,
                    bottle_size_ml=1000,
                    price=25.00,
                    description='Pure mineral water from natural springs',
                    image_path='/static/images/logos/1-L-MINERAL.png',
                    stock_quantity=500,
                    is_active=True
                ),
                Product(
                    name='1L Alkaline Water',
                    bottle_size_liters=1.0,
                    bottle_size_ml=1000,
                    price=35.00,
                    description='pH-balanced alkaline water for health',
                    image_path='/static/images/logos/1-L-MINERAL.png',
                    stock_quantity=350,
                    is_active=True
                ),
                Product(
                    name='1L Spring Water',
                    bottle_size_liters=1.0,
                    bottle_size_ml=1000,
                    price=40.00,
                    description='Natural spring water from pristine mountains',
                    image_path='/static/images/logos/1-L-SPRINKLE-WATER.png',
                    stock_quantity=400,
                    is_active=True
                ),
                Product(
                    name='5L Mineral Water',
                    bottle_size_liters=5.0,
                    bottle_size_ml=5000,
                    price=100.00,
                    description='Large bulk water for offices and families',
                    image_path='/static/images/logos/5-L-MINERAL.png',
                    stock_quantity=200,
                    is_active=True
                ),
                Product(
                    name='5L Spring Water',
                    bottle_size_liters=5.0,
                    bottle_size_ml=5000,
                    price=199.00,
                    description='Bulk natural spring water',
                    image_path='/static/images/logos/5-L-SPRING.png',
                    stock_quantity=180,
                    is_active=True
                ),
                Product(
                    name='5L Sprinkle Water',
                    bottle_size_liters=5.0,
                    bottle_size_ml=5000,
                    price=120.00,
                    description='Pure sprinkle water with enhanced filtration',
                    image_path='/static/images/logos/5-L-SPRINKLE WATER.png',
                    stock_quantity=250,
                    is_active=True
                ),
            ]
            db.session.add_all(demo_products)

        if Customer.query.count() == 0:
            demo_customer = Customer(
                name='Demo Customer',
                email='demo@aquamigo.com',
                mobile='9999999999',
                address='123 Main St',
                city='Demo City',
                postal_code='123456'
            )
            db.session.add(demo_customer)

        db.session.commit()
        print("[OK] Database seeded with demo data if needed")

    except Exception as e:
        print(f"[ERROR] Database initialization: {str(e)}")
        db.session.rollback()
        try:
            db.create_all()
        except Exception:
            pass

# ===================== ROUTES =====================

# API Endpoints for Dashboard
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        total_customers = Customer.query.count()
        total_products = Product.query.count()
        total_orders = Order.query.count()
        total_revenue = db.session.query(db.func.sum(Order.total_amount)).filter(
            Order.payment_status == 'Completed'
        ).scalar() or 0
        delivered_orders = Order.query.filter_by(status='Delivered').count()
        pending_orders = Order.query.filter_by(status='Placed').count()
        
        # Calculate total bottles sold
        from models import OrderItem
        total_bottles = db.session.query(db.func.sum(OrderItem.quantity)).scalar() or 0
        
        # Low stock products
        low_stock_products = Product.query.filter(Product.stock_quantity <= 100).count()
        
        return jsonify({
            'status': 'success',
            'data': {
                'total_customers': total_customers,
                'total_products': total_products,
                'total_orders': total_orders,
                'total_revenue': float(total_revenue),
                'total_bottles_sold': total_bottles,
                'delivered_orders': delivered_orders,
                'pending_orders': pending_orders,
                'low_stock_alerts': low_stock_products
            }
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/dashboard/recent-orders', methods=['GET'])
def get_recent_orders():
    """Get recent orders"""
    try:
        recent_orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()
        return jsonify({
            'status': 'success',
            'data': [order.to_dict() for order in recent_orders]
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/dashboard/monthly-sales', methods=['GET'])
def get_monthly_sales():
    """Get monthly sales data"""
    try:
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        # Get last 12 months data
        # Using strftime for SQLite compatibility
        sales_data = db.session.query(
            func.strftime('%Y-%m', Order.created_at).label('month'),
            func.count(Order.id).label('orders'),
            func.sum(Order.total_amount).label('revenue')
        ).filter(
            Order.payment_status == 'Completed'
        ).group_by(
            func.strftime('%Y-%m', Order.created_at)
        ).all()
        
        monthly_stats = []
        for month, orders, revenue in sales_data:
            monthly_stats.append({
                'month': month,  # Already in YYYY-MM format
                'orders': orders,
                'revenue': float(revenue) if revenue else 0
            })
        
        return jsonify({
            'status': 'success',
            'data': monthly_stats
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# API Endpoints for Products
@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products"""
    try:
        products = Product.query.filter_by(is_active=True).all()
        return jsonify({
            'status': 'success',
            'data': [product.to_dict() for product in products]
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product"""
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'status': 'error', 'message': 'Product not found'}), 404
        
        return jsonify({
            'status': 'success',
            'data': product.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# API Endpoints for Cart
@app.route('/api/cart/<int:customer_id>', methods=['GET'])
def get_cart(customer_id):
    """Get cart"""
    try:
        from services.cart_service import CartService
        cart, message = CartService.get_cart(customer_id)
        if cart:
            return jsonify({
                'status': 'success',
                'data': cart,
                'message': message
            }), 200
        else:
            # Return empty cart
            cart_obj = Cart.query.filter_by(customer_id=customer_id).first()
            if not cart_obj:
                cart_obj = Cart(customer_id=customer_id)
                db.session.add(cart_obj)
                db.session.commit()
            return jsonify({
                'status': 'success',
                'data': cart_obj.to_dict(),
                'message': 'Empty cart'
            }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/cart/<int:customer_id>/add', methods=['POST'])
def add_to_cart(customer_id):
    """Add to cart"""
    try:
        from flask import request
        from services.cart_service import CartService
        
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        if not product_id:
            return jsonify({'status': 'error', 'message': 'Product ID required'}), 400
        
        cart, message = CartService.add_to_cart(customer_id, product_id, quantity)
        if cart:
            return jsonify({
                'status': 'success',
                'data': cart,
                'message': message
            }), 200
        else:
            return jsonify({'status': 'error', 'message': message}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/cart/<int:customer_id>/remove/<int:product_id>', methods=['DELETE'])
def remove_from_cart(customer_id, product_id):
    """Remove from cart"""
    try:
        from services.cart_service import CartService
        
        cart, message = CartService.remove_from_cart(customer_id, product_id)
        if cart is not None:
            return jsonify({
                'status': 'success',
                'data': cart,
                'message': message
            }), 200
        else:
            return jsonify({'status': 'error', 'message': message}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/cart/<int:customer_id>/update', methods=['PUT'])
def update_cart(customer_id):
    """Update cart item quantity"""
    try:
        from flask import request
        from services.cart_service import CartService
        
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        if not product_id:
            return jsonify({'status': 'error', 'message': 'Product ID required'}), 400
        
        cart, message = CartService.update_cart_item_quantity(customer_id, product_id, quantity)
        if cart is not None:
            return jsonify({
                'status': 'success',
                'data': cart,
                'message': message
            }), 200
        else:
            return jsonify({'status': 'error', 'message': message}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/cart/<int:customer_id>/clear', methods=['DELETE'])
def clear_cart(customer_id):
    """Clear cart"""
    try:
        from services.cart_service import CartService
        
        cart, message = CartService.clear_cart(customer_id)
        if cart is not None:
            return jsonify({
                'status': 'success',
                'data': cart,
                'message': message
            }), 200
        else:
            return jsonify({'status': 'error', 'message': message}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# API Endpoints for Orders
@app.route('/api/orders/create', methods=['POST'])
def create_order():
    """Create order from cart"""
    try:
        from flask import request
        from services.order_service import OrderService
        from services.cart_service import CartService
        
        data = request.get_json()
        customer_id = data.get('customer_id')
        customer_name = data.get('customer_name')
        customer_mobile = data.get('customer_mobile')
        delivery_address = data.get('delivery_address')
        payment_method = data.get('payment_method', 'Credit Card')
        
        if not all([customer_id, customer_name, customer_mobile, delivery_address]):
            return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400
        
        order, message = OrderService.create_order_from_cart(
            customer_id, customer_name, customer_mobile, delivery_address, payment_method
        )
        
        if order:
            return jsonify({
                'status': 'success',
                'data': order,
                'message': message
            }), 201
        else:
            return jsonify({'status': 'error', 'message': message}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/orders/buy-now', methods=['POST'])
def buy_now():
    """Create direct order"""
    try:
        from flask import request
        from services.order_service import OrderService
        
        data = request.get_json()
        customer_name = data.get('customer_name')
        customer_mobile = data.get('customer_mobile')
        delivery_address = data.get('delivery_address')
        products = data.get('products', {})  # {product_id: quantity}
        payment_method = data.get('payment_method', 'Credit Card')
        
        if not all([customer_name, customer_mobile, delivery_address, products]):
            return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400
        
        # Convert product IDs to integers
        products = {int(k): int(v) for k, v in products.items()}
        
        order, message = OrderService.create_direct_order(
            customer_name, customer_mobile, delivery_address, products, payment_method
        )
        
        if order:
            return jsonify({
                'status': 'success',
                'data': order,
                'message': message
            }), 201
        else:
            return jsonify({'status': 'error', 'message': message}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    """Get order details"""
    try:
        from services.order_service import OrderService
        
        order, message = OrderService.get_order_by_id(order_id)
        if order:
            return jsonify({
                'status': 'success',
                'data': order,
                'message': message
            }), 200
        else:
            return jsonify({'status': 'error', 'message': message}), 404
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/orders/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    """Delete an order"""
    try:
        from services.order_service import OrderService

        deleted, message = OrderService.delete_order(order_id)
        if deleted:
            return jsonify({
                'status': 'success',
                'data': deleted,
                'message': message
            }), 200
        else:
            return jsonify({'status': 'error', 'message': message}), 404
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Update order status"""
    try:
        from flask import request
        from services.order_service import OrderService
        
        data = request.get_json()
        status = data.get('status')
        
        if not status:
            return jsonify({'status': 'error', 'message': 'Status required'}), 400
        
        order, message = OrderService.update_order_status(order_id, status)
        if order:
            return jsonify({
                'status': 'success',
                'data': order,
                'message': message
            }), 200
        else:
            return jsonify({'status': 'error', 'message': message}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/orders/customer/<int:customer_id>', methods=['GET'])
def get_customer_orders(customer_id):
    """Get customer orders"""
    try:
        from services.order_service import OrderService
        
        orders, message = OrderService.get_customer_orders(customer_id)
        return jsonify({
            'status': 'success',
            'data': orders,
            'message': message
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Page Routes
@app.route('/', methods=['GET'])
def index():
    """Dashboard page"""
    return render_template('index.html')

@app.route('/dashboard', methods=['GET'])
def dashboard():
    """Dashboard page"""
    return render_template('dashboard.html')

@app.route('/cart', methods=['GET'])
def cart():
    """Cart page"""
    return render_template('cart.html')

@app.route('/buy-now', methods=['GET'])
def buy_now_page():
    """Buy Now page"""
    return render_template('buy-now.html')

@app.route('/track', methods=['GET'])
def track():
    """Track order page"""
    return render_template('track.html')

@app.route('/history', methods=['GET'])
def history():
    """Order history page"""
    return render_template('history.html')

@app.route('/settings', methods=['GET'])
def settings():
    """Settings page"""
    return render_template('settings.html')

@app.errorhandler(404)
def not_found(error):
    return jsonify({'status': 'error', 'message': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'status': 'error', 'message': 'Internal server error'}), 500


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
