# AquaMigo — Smart Water Distribution Management System

A full-stack web application for managing water bottle products, customers, orders, deliveries, payments, and order history.

## Overview

AquaMigo provides a centralized system for managing daily water distribution operations, including:

- Customer and product management
- Cart and order management
- Order tracking and history
- Payment and delivery records
- Dashboard analytics and sales reports

## Key Features

### Dashboard
- Customer, order, bottle sales, and revenue statistics
- Pending and delivered order overview
- Low-stock alerts
- Recent orders
- Monthly sales graph

### Orders
- Browse available water bottles
- Add and manage cart items
- Quick checkout and direct purchase
- Order confirmation
- Order status tracking

### Order History
- View previous orders
- Search by Order ID
- Filter orders by status
- View order date, amount, and status

### Settings
- Customer profile management
- Notification preferences
- Payment and application preferences

## Technology Stack

**Frontend**
- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js

**Backend**
- Python 3.8+
- Flask
- Flask-CORS
- Flask-SQLAlchemy

**Database**
- MySQL
- PyMySQL
- SQLAlchemy

## Project Structure

```text
AquaMigo-Smart-Water-Distribution-Management-System
├── app.py
├── config.py
├── requirements.txt
├── .env
├── README.md
├── database/
│   ├── connection.py
│   ├── schema.sql
│   └── seed.sql
├── models/
│   ├── customer.py
│   ├── product.py
│   ├── cart.py
│   ├── order.py
│   ├── payment.py
│   └── delivery.py
├── services/
│   ├── cart_service.py
│   ├── order_service.py
│   ├── payment_service.py
│   └── delivery_service.py
├── templates/
│   ├── index.html
│   ├── cart.html
│   ├── buy-now.html
│   ├── track.html
│   ├── history.html
│   └── settings.html
└── static/
    ├── css/
    ├── js/
    └── assets/
```

## Installation & Setup

### Requirements

- Python 3.8+
- MySQL 5.7+
- Modern web browser

### 1. Create Virtual Environment

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure MySQL

Create the database:

```sql
CREATE DATABASE aquamigo_db;
```

Load the database schema and sample data:

```bash
mysql -u root -p aquamigo_db < database/schema.sql
mysql -u root -p aquamigo_db < database/seed.sql
```

### 4. Configure Environment

Set the required database and Flask variables in `.env`:

```env
FLASK_ENV=development
FLASK_APP=app.py
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aquamigo_db
DB_PORT=3306
```

### 5. Run the Application

```bash
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

## API Overview

### Dashboard
- `GET /api/dashboard/stats`
- `GET /api/dashboard/recent-orders`
- `GET /api/dashboard/monthly-sales`

### Products
- `GET /api/products`
- `GET /api/products/<id>`

### Cart
- `GET /api/cart/<customer_id>`
- `POST /api/cart/<customer_id>/add`
- `PUT /api/cart/<customer_id>/update`
- `DELETE /api/cart/<customer_id>/remove/<product_id>`
- `DELETE /api/cart/<customer_id>/clear`

### Orders
- `POST /api/orders/create`
- `POST /api/orders/buy-now`
- `GET /api/orders/<order_id>`
- `PUT /api/orders/<order_id>/status`
- `GET /api/orders/customer/<customer_id>`

## Database

Core tables:

- `customers`
- `products`
- `cart`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `deliveries`
- `order_history`
- `settings`

The database uses primary keys, foreign keys, indexes, and timestamps for structured data management.

## UI/UX

- Professional blue and white theme
- Responsive layout
- Dashboard metric cards
- Product and order interfaces
- Order status indicators
- Data tables and form validation
- Sales analytics graph
- Indian Rupee (₹) currency
- Indian date format (DD-MM-YYYY)

## Security

- Server-side and client-side validation
- SQL injection protection through SQLAlchemy ORM
- Environment variables for sensitive configuration
- CORS configuration
- Secure password handling requirements

## Project Status

**Version:** 1.0.0  
**Last Updated:** August 2026  
**Status:** Production Ready

## Project By:
**GAUTAM KUMAR**
**GIT HUB: ITS-GAUTAMDEVOPS**
**Gmail: gautam.kumar.devops@gmail.com**