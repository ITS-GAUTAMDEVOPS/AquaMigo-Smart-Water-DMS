from database.connection import db
from models import Order, OrderItem, Payment, Delivery, Product, CartItem, Cart, Customer
from datetime import datetime, timedelta
import random
import logging

logger = logging.getLogger(__name__)

class OrderService:
    """Service for managing orders"""
    
    @staticmethod
    def generate_order_id():
        """Generate unique order ID"""
        timestamp = datetime.now().strftime("%Y%m%d")
        random_num = random.randint(10000, 99999)
        return f"ORD{timestamp}{random_num}"
    
    @staticmethod
    def create_order_from_cart(customer_id, customer_name, customer_mobile, delivery_address, payment_method):
        """Create order from cart items"""
        try:
            cart = Cart.query.filter_by(customer_id=customer_id).first()
            if not cart or not cart.items:
                return None, "Cart is empty"
            
            # Calculate total
            total_amount = sum(float(item.quantity * item.price) for item in cart.items)
            
            # Create order
            order = Order(
                order_id=OrderService.generate_order_id(),
                customer_id=customer_id,
                customer_name=customer_name,
                customer_mobile=customer_mobile,
                delivery_address=delivery_address,
                total_amount=total_amount,
                payment_method=payment_method,
                status='Placed',
                payment_status='Pending'
            )
            
            db.session.add(order)
            db.session.flush()  # Get order ID
            
            # Create order items from cart items
            total_bottles = 0
            for cart_item in cart.items:
                product = cart_item.product
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    product_name=product.name,
                    quantity=cart_item.quantity,
                    unit_price=product.price,
                    subtotal=float(product.price) * cart_item.quantity
                )
                db.session.add(order_item)
                total_bottles += cart_item.quantity
            
            # Create payment record
            payment = Payment(
                order_id=order.id,
                amount=total_amount,
                payment_method=payment_method,
                payment_status='Completed'
            )
            db.session.add(payment)
            
            # Create delivery record
            estimated_delivery = datetime.now() + timedelta(days=2)
            delivery = Delivery(
                order_id=order.id,
                delivery_address=delivery_address,
                estimated_delivery_date=estimated_delivery.date(),
                delivery_status='Pending',
                notes='Order confirmed, awaiting shipment'
            )
            db.session.add(delivery)
            
            # Update order payment status
            order.payment_status = 'Completed'
            
            # Clear cart
            CartItem.query.filter_by(cart_id=cart.id).delete()
            
            db.session.commit()
            return order.to_dict(), "Order created successfully"
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating order from cart: {str(e)}")
            return None, f"Error: {str(e)}"
    
    @staticmethod
    def create_direct_order(customer_name, customer_mobile, delivery_address, products, payment_method):
        """Create direct order (Buy Now)"""
        try:
            total_amount = 0
            total_bottles = 0
            
            # Validate products and calculate total
            product_details = []
            for product_id, quantity in products.items():
                product = Product.query.get(product_id)
                if not product:
                    return None, f"Product {product_id} not found"
                if product.stock_quantity < quantity:
                    return None, f"Insufficient stock for {product.name}"
                
                product_details.append({
                    'product': product,
                    'quantity': quantity
                })
                total_amount += float(product.price) * quantity
                total_bottles += quantity
            
            default_customer = Customer.query.first()
            if not default_customer:
                default_customer = Customer(
                    name='Demo Customer',
                    email='demo@aquamigo.com',
                    mobile='9999999999',
                    address='123 Main St',
                    city='Demo City',
                    postal_code='123456'
                )
                db.session.add(default_customer)
                db.session.flush()

            # Assign direct orders to the default customer so they appear in history immediately.
            order = Order(
                order_id=OrderService.generate_order_id(),
                customer_id=default_customer.id,
                customer_name=customer_name,
                customer_mobile=customer_mobile,
                delivery_address=delivery_address,
                total_amount=total_amount,
                payment_method=payment_method,
                status='Placed',
                payment_status='Completed'
            )
            
            db.session.add(order)
            db.session.flush()
            
            # Create order items
            for item in product_details:
                product = item['product']
                quantity = item['quantity']
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    product_name=product.name,
                    quantity=quantity,
                    unit_price=product.price,
                    subtotal=float(product.price) * quantity
                )
                db.session.add(order_item)
            
            # Create payment record
            payment = Payment(
                order_id=order.id,
                amount=total_amount,
                payment_method=payment_method,
                payment_status='Completed'
            )
            db.session.add(payment)
            
            # Create delivery record
            estimated_delivery = datetime.now() + timedelta(days=2)
            delivery = Delivery(
                order_id=order.id,
                delivery_address=delivery_address,
                estimated_delivery_date=estimated_delivery.date(),
                delivery_status='Pending',
                notes='Order confirmed, awaiting shipment'
            )
            db.session.add(delivery)
            
            db.session.commit()
            return order.to_dict(), "Order created successfully"
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating direct order: {str(e)}")
            return None, f"Error: {str(e)}"
    
    @staticmethod
    def get_order_by_id(order_id):
        """Get order details by order ID"""
        try:
            order = Order.query.filter_by(order_id=order_id).first()
            if not order:
                return None, "Order not found"
            return order.to_dict(), "Order retrieved successfully"
        except Exception as e:
            logger.error(f"Error getting order: {str(e)}")
            return None, f"Error: {str(e)}"
    
    @staticmethod
    def update_order_status(order_id, status):
        """Update order status"""
        try:
            order = Order.query.filter_by(order_id=order_id).first()
            if not order:
                return None, "Order not found"
            
            valid_statuses = ['Placed', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled']
            if status not in valid_statuses:
                return None, f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            
            order.status = status
            
            # Update delivery status accordingly
            if order.delivery:
                if status == 'Placed':
                    order.delivery.delivery_status = 'Pending'
                elif status == 'Confirmed':
                    order.delivery.delivery_status = 'Pending'
                elif status == 'Out for Delivery':
                    order.delivery.delivery_status = 'Out for Delivery'
                    order.delivery.notes = 'Package out for delivery'
                elif status == 'Delivered':
                    order.delivery.delivery_status = 'Delivered'
                    order.delivery.actual_delivery_date = datetime.now().date()
                    order.delivery.notes = 'Delivered successfully'
                elif status == 'Cancelled':
                    order.delivery.delivery_status = 'Cancelled'
                    order.delivery.notes = 'Order cancelled by customer'
            
            db.session.commit()
            return order.to_dict(), "Order status updated successfully"
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating order status: {str(e)}")
            return None, f"Error: {str(e)}"
    
    @staticmethod
    def get_customer_orders(customer_id):
        """Get all orders for a customer"""
        try:
            orders = Order.query.filter_by(customer_id=customer_id).order_by(Order.created_at.desc()).all()
            return [order.to_dict() for order in orders], "Orders retrieved successfully"
        except Exception as e:
            logger.error(f"Error getting customer orders: {str(e)}")
            return [], f"Error: {str(e)}"

    @staticmethod
    def delete_order(order_id):
        """Delete an order and its related items"""
        try:
            order = Order.query.filter_by(order_id=order_id).first()
            if not order:
                return None, "Order not found"

            db.session.delete(order)
            db.session.commit()
            return {'order_id': order_id}, "Order deleted successfully"
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting order: {str(e)}")
            return None, f"Error: {str(e)}"
