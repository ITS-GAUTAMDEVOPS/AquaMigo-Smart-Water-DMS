from database.connection import db
from models import Cart, CartItem, Product
from sqlalchemy import func
import logging

logger = logging.getLogger(__name__)

class CartService:
    """Service for managing shopping cart operations"""
    
    @staticmethod
    def get_or_create_cart(customer_id):
        """Get existing cart or create new one"""
        try:
            cart = Cart.query.filter_by(customer_id=customer_id).first()
            if not cart:
                cart = Cart(customer_id=customer_id)
                db.session.add(cart)
                db.session.commit()
            return cart
        except Exception as e:
            logger.error(f"Error getting/creating cart: {str(e)}")
            return None
    
    @staticmethod
    def add_to_cart(customer_id, product_id, quantity):
        """Add product to cart"""
        try:
            cart = CartService.get_or_create_cart(customer_id)
            if not cart:
                return None, "Failed to get or create cart"
            
            product = Product.query.get(product_id)
            if not product:
                return None, "Product not found"
            
            if product.stock_quantity < quantity:
                return None, f"Insufficient stock. Available: {product.stock_quantity}"
            
            # Check if product already in cart
            cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
            if cart_item:
                cart_item.quantity += quantity
                cart_item.price = product.price
            else:
                cart_item = CartItem(
                    cart_id=cart.id,
                    product_id=product_id,
                    quantity=quantity,
                    price=product.price
                )
                db.session.add(cart_item)
            
            db.session.commit()
            return cart.to_dict(), "Product added to cart successfully"
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error adding to cart: {str(e)}")
            return None, f"Error: {str(e)}"
    
    @staticmethod
    def remove_from_cart(customer_id, product_id):
        """Remove product from cart"""
        try:
            cart = Cart.query.filter_by(customer_id=customer_id).first()
            if not cart:
                return None, "Cart not found"
            
            cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
            if cart_item:
                db.session.delete(cart_item)
                db.session.commit()
                return cart.to_dict(), "Product removed from cart"
            return None, "Product not in cart"
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error removing from cart: {str(e)}")
            return None, f"Error: {str(e)}"
    
    @staticmethod
    def update_cart_item_quantity(customer_id, product_id, quantity):
        """Update quantity of product in cart"""
        try:
            if quantity <= 0:
                return CartService.remove_from_cart(customer_id, product_id)
            
            cart = Cart.query.filter_by(customer_id=customer_id).first()
            if not cart:
                return None, "Cart not found"
            
            product = Product.query.get(product_id)
            if not product:
                return None, "Product not found"
            
            if product.stock_quantity < quantity:
                return None, f"Insufficient stock. Available: {product.stock_quantity}"
            
            cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
            if cart_item:
                cart_item.quantity = quantity
                db.session.commit()
                return cart.to_dict(), "Cart updated successfully"
            return None, "Product not in cart"
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating cart: {str(e)}")
            return None, f"Error: {str(e)}"
    
    @staticmethod
    def clear_cart(customer_id):
        """Clear all items from cart"""
        try:
            cart = Cart.query.filter_by(customer_id=customer_id).first()
            if not cart:
                return None, "Cart not found"
            
            CartItem.query.filter_by(cart_id=cart.id).delete()
            db.session.commit()
            return cart.to_dict(), "Cart cleared successfully"
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error clearing cart: {str(e)}")
            return None, f"Error: {str(e)}"
    
    @staticmethod
    def get_cart(customer_id):
        """Get cart details"""
        try:
            cart = Cart.query.filter_by(customer_id=customer_id).first()
            if not cart:
                return None, "Cart not found"
            
            return cart.to_dict(), "Cart retrieved successfully"
        except Exception as e:
            logger.error(f"Error getting cart: {str(e)}")
            return None, f"Error: {str(e)}"
    
    @staticmethod
    def get_cart_total(customer_id):
        """Calculate cart total"""
        try:
            cart = Cart.query.filter_by(customer_id=customer_id).first()
            if not cart:
                return 0
            
            total = db.session.query(func.sum(CartItem.quantity * CartItem.price)).filter_by(cart_id=cart.id).scalar()
            return float(total) if total else 0
        except Exception as e:
            logger.error(f"Error calculating cart total: {str(e)}")
            return 0
