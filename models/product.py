from database.connection import db
from datetime import datetime

class Product(db.Model):
    """
    Represents a water bottle product in AquaMigo system.
    Stores product details including size, price, stock, and image information.
    """
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    bottle_size_liters = db.Column(db.Numeric(5, 2), nullable=False)
    bottle_size_ml = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text)
    # Path to product image file
    image_path = db.Column(db.String(200), default='/static/images/products/default-bottle.png')
    stock_quantity = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cart_items = db.relationship('CartItem', backref='product', lazy=True, cascade='all, delete-orphan')
    order_items = db.relationship('OrderItem', backref='product', lazy=True)
    
    def to_dict(self):
        """Convert product object to dictionary format for API responses"""
        # Safely get image_path with fallback
        image = getattr(self, 'image_path', None) or '/static/images/logos/1-L-Bottle-image.png'
        return {
            'id': self.id,
            'name': self.name,
            'bottle_size_liters': float(self.bottle_size_liters),
            'bottle_size_ml': self.bottle_size_ml,
            'price': float(self.price),
            'description': self.description,
            'image_path': image,
            'stock_quantity': self.stock_quantity,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Product {self.name}>'
