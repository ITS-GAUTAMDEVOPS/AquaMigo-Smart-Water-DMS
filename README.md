# AquaMigo - Premium Water Bottle Distribution Management System

A complete full-stack web application for managing water bottle orders, customers, deliveries, payments, and order history.

## 🎯 Overview

AquaMigo is a modern, premium water bottle distribution management system built with cutting-edge web technologies. It provides a complete solution for:
- Product browsing and management
- Shopping cart functionality
- Direct purchase capability
- Real-time order tracking
- Order history and analytics
- Customer profile management
- Comprehensive admin dashboard with analytics

## ✨ Features

### Dashboard
- **Real-time Analytics**: Total customers, bottles sold, orders, and revenue
- **Order Status Overview**: Delivered vs pending orders
- **Low Stock Alerts**: Monitor product availability
- **Recent Orders**: View latest transactions
- **Monthly Sales Graph**: Visual representation of sales trends

### Shopping Cart
- Browse all available water bottle products
- Add products to cart with quantity selection
- Manage cart items (add, remove, update quantity)
- Real-time price calculation
- Checkout with customer details
- Order confirmation

### Buy Now
- Direct purchase without cart
- Multiple product selection
- Quick checkout process
- Order confirmation with details

### Order Tracking
- Search orders by Order ID
- Visual order status stepper
  - Order Placed
  - Order Confirmed
  - Out for Delivery
  - Delivered
- Customer and order details display
- Item breakdown
- Estimated delivery date

### Order History
- View all previous orders
- Filter by status (Placed, Confirmed, Out for Delivery, Delivered)
- Search by Order ID
- View detailed order information
- Order date, amount, and status at a glance

### Settings
- **Profile Management**: Edit customer details
- **Notification Preferences**: Control notification types
- **Application Preferences**: Set default payment method and theme
- **About Section**: Application information and features

## 🏗️ Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with variables, flexbox, grid
- **Vanilla JavaScript**: No frameworks, pure JS with ES6+
- **Chart.js**: For sales analytics graphs

### Backend
- **Python 3.8+**: Programming language
- **Flask 2.3.0**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Flask-SQLAlchemy**: ORM for database operations

### Database
- **MySQL**: Relational database
- **PyMySQL**: MySQL driver for Python
- **SQLAlchemy**: ORM

### Development
- **python-dotenv**: Environment variable management

## 📁 Project Structure

```
AquaMigo/
├── app.py                          # Flask application entry point
├── config.py                       # Configuration management
├── requirements.txt                # Python dependencies
├── .env                           # Environment variables
├── README.md                      # This file
│
├── database/
│   ├── connection.py              # Database connection setup
│   ├── schema.sql                 # MySQL table structure
│   └── seed.sql                   # Sample data
│
├── models/
│   ├── __init__.py               # Package initialization
│   ├── customer.py               # Customer model
│   ├── product.py                # Product model
│   ├── cart.py                   # Cart models (Cart, CartItem)
│   ├── order.py                  # Order models (Order, OrderItem)
│   ├── payment.py                # Payment model
│   └── delivery.py               # Delivery model
│
├── services/
│   ├── cart_service.py           # Cart business logic
│   ├── order_service.py          # Order business logic
│   ├── payment_service.py        # Payment business logic
│   └── delivery_service.py       # Delivery business logic
│
├── templates/
│   ├── index.html                # Dashboard page
│   ├── cart.html                 # Shopping cart page
│   ├── buy-now.html              # Direct purchase page
│   ├── track.html                # Order tracking page
│   ├── history.html              # Order history page
│   └── settings.html             # Settings page
│
└── static/
    ├── css/
    │   ├── style.css             # Main stylesheet
    │   ├── dashboard.css         # Dashboard specific styles
    │   ├── components.css        # Reusable components
    │   └── responsive.css        # Mobile responsive styles
    │
    ├── js/
    │   ├── api.js                # API client and utilities
    │   ├── dashboard.js          # Dashboard functionality
    │   ├── cart.js               # Cart functionality
    │   ├── buy-now.js            # Buy now functionality
    │   ├── track.js              # Order tracking
    │   ├── history.js            # Order history
    │   └── settings.js           # Settings management
    │
    └── assets/
        └── (images and static assets)
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- MySQL 5.7 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
```bash
cd path/to/AquaMigo
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure database**
   - Create a MySQL database:
   ```sql
   CREATE DATABASE aquamigo_db;
   ```
   
   - Load schema:
   ```bash
   mysql -u root -p aquamigo_db < database/schema.sql
   ```
   
   - Load sample data:
   ```bash
   mysql -u root -p aquamigo_db < database/seed.sql
   ```

5. **Configure environment variables**
   - Edit `.env` file with your settings:
   ```
   FLASK_ENV=development
   FLASK_APP=app.py
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=aquamigo_db
   ```

6. **Run the application**
```bash
python app.py
```

7. **Access the application**
   - Open your browser and navigate to: `http://127.0.0.1:5000`

## 📊 API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-orders` - Get recent orders
- `GET /api/dashboard/monthly-sales` - Get monthly sales data

### Products
- `GET /api/products` - Get all products
- `GET /api/products/<id>` - Get product details

### Cart
- `GET /api/cart/<customer_id>` - Get cart items
- `POST /api/cart/<customer_id>/add` - Add to cart
- `PUT /api/cart/<customer_id>/update` - Update cart item
- `DELETE /api/cart/<customer_id>/remove/<product_id>` - Remove from cart
- `DELETE /api/cart/<customer_id>/clear` - Clear cart

### Orders
- `POST /api/orders/create` - Create order from cart
- `POST /api/orders/buy-now` - Create direct order
- `GET /api/orders/<order_id>` - Get order details
- `PUT /api/orders/<order_id>/status` - Update order status
- `GET /api/orders/customer/<customer_id>` - Get customer orders

## 🗄️ Database Structure

### Tables
- **customers**: Customer information
- **products**: Product catalog
- **cart**: Shopping cart per customer
- **cart_items**: Items in cart
- **orders**: Order records
- **order_items**: Items in orders
- **payments**: Payment transactions
- **deliveries**: Delivery tracking
- **order_history**: Historical order data
- **settings**: Application settings

All tables include proper:
- Primary keys
- Foreign keys
- Indexes for performance
- Timestamps (created_at, updated_at)

## 🎨 UI/UX Features

### Design
- **Material Design Inspired**: Clean, modern interface
- **Color Scheme**: Professional blue and white theme
- **Premium Feel**: Rounded cards, soft shadows, proper spacing
- **Typography**: Clear hierarchy and readability

### Components
- Responsive navigation sidebar
- Dashboard metric cards
- Product cards with images
- Shopping cart with real-time updates
- Order status stepper with visual indicators
- Toast notifications for user feedback
- Modal dialogs for forms
- Data tables with sorting
- Form validations

### Responsive Design
- Desktop (1024px+): Full layout
- Tablet (768px - 1023px): Optimized columns
- Mobile (480px - 767px): Single column, touch-friendly
- Extra small (< 480px): Minimal layout

## 💰 Currency & Localization

- **Currency**: Indian Rupees (₹)
- **Date Format**: Indian format (DD-MM-YYYY)
- **Language**: English (Hindi support ready)

## 🔒 Security Features

- CORS enabled for API safety
- Form validation (client and server-side)
- Password protection (passwords should be handled securely in production)
- SQL injection prevention (via SQLAlchemy ORM)
- Environment variables for sensitive data

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚦 Sample Data

The application comes with pre-loaded sample data including:
- 8 sample customers
- 8 water bottle products
- 10 sample orders with various statuses
- Sample payments and deliveries

This allows you to test the application immediately without manual data entry.

## 🔧 Configuration

### Environment Variables (.env)

```
FLASK_ENV=development          # development or production
FLASK_APP=app.py
FLASK_DEBUG=True               # Enable debug mode
SECRET_KEY=your-secret-key     # Flask secret key

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=aquamigo_db
DB_PORT=3306
```

## 📈 Sample Order Flow

1. **Browse Products**: View all available water bottles
2. **Add to Cart**: Select quantity and add to cart
3. **Checkout**: Enter customer details and payment method
4. **Order Confirmation**: Receive order ID
5. **Track Order**: Use order ID to track status
6. **View History**: Access past orders

## 🐛 Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Verify database credentials in .env
- Check if database `aquamigo_db` exists

### Port Already in Use
- Flask runs on port 5000 by default
- Change port in app.py: `app.run(port=5001)`

### Module Not Found
- Ensure virtual environment is activated
- Run: `pip install -r requirements.txt`

### Static Files Not Loading
- Clear browser cache
- Check if Flask static folder is configured correctly

## 🚀 Deployment

For production deployment:

1. Set `FLASK_ENV=production`
2. Use a production WSGI server (Gunicorn, Waitress)
3. Enable HTTPS/SSL
4. Use strong SECRET_KEY
5. Configure proper database backups
6. Set up error logging
7. Use environment variables for all sensitive data

### Sample Production Command
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📚 Dependencies

See `requirements.txt` for complete list of dependencies with versions.

Main dependencies:
- Flask: Web framework
- Flask-SQLAlchemy: Database ORM
- PyMySQL: MySQL connection
- python-dotenv: Environment management

## 🎓 Learning Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 📝 License

This project is created for educational purposes.

## 👨‍💻 Development Team

AquaMigo - Premium Water Distribution System

## 🤝 Contributing

For bug reports and feature requests, please create issues or pull requests.

## 📞 Support

For technical support or questions, refer to the documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: August 2026  
**Status**: Production Ready ✅


