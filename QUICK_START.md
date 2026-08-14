## AquaMigo - Quick Start Guide

### 🚀 Get Up and Running in 5 Minutes

#### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

#### Step 2: Create Database
```bash
# Open MySQL CLI
mysql -u root -p

# Create database
CREATE DATABASE aquamigo_db;
exit;
```

#### Step 3: Load Database Schema
```bash
mysql -u root -p aquamigo_db < database/schema.sql
```

#### Step 4: Load Sample Data
```bash
mysql -u root -p aquamigo_db < database/seed.sql
```

#### Step 5: Configure Environment
Edit `.env` file:
```
FLASK_ENV=development
FLASK_DEBUG=True
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=aquamigo_db
```

#### Step 6: Run Application
```bash
python app.py
```

#### Step 7: Open in Browser
```
http://127.0.0.1:5000
```

---

### 📋 WHAT YOU CAN DO IMMEDIATELY

✅ **View Dashboard**
- See metrics: Total Customers, Bottles Sold, Orders, Revenue
- View recent orders in table
- See monthly sales chart

✅ **Browse Products**
- All products displayed with images and prices
- 8 sample products ready to add to cart
- Stock status visible

✅ **Shop with Cart**
1. Add products to cart
2. Update quantities
3. Enter customer details
4. Complete checkout
5. Receive order ID

✅ **Buy Now (Direct Purchase)**
1. Select multiple products
2. Enter delivery address
3. Receive immediate order confirmation

✅ **Track Order**
1. Enter any Order ID
2. See order status progression
3. View delivery timeline
4. See order items and details

✅ **View Order History**
1. See all past orders
2. Filter by status
3. Search by Order ID
4. View detailed order info

✅ **Manage Settings**
1. Edit profile
2. Set notifications
3. Configure preferences
4. View about page

---

### 🆘 TROUBLESHOOTING

**Database Connection Failed**
- Check MySQL is running
- Verify database credentials in .env
- Run: `mysql -u root -p -e "SHOW DATABASES;"`

**Port 5000 Already in Use**
- Edit app.py last line: `app.run(debug=True, port=5001)`
- Or kill process: `lsof -ti:5000 | xargs kill -9` (Linux/Mac)

**Module Import Error**
- Ensure virtual environment is activated
- Run: `pip install -r requirements.txt` again

**Static Files Not Loading (CSS/JS)**
- Clear browser cache (Ctrl+Shift+Delete)
- Check Flask is serving static folder correctly

---

### 📊 SAMPLE DATA PROVIDED

**Customers (8)**
- Customer IDs: 1-8
- Default customer ID in app: 1

**Products (8)**
- 1L and 5L water bottles
- Prices: ₹99 to ₹499
- Stock quantities: 100-500 units

**Orders (10)**
- Various statuses: Placed, Confirmed, Out for Delivery, Delivered
- Order amounts: ₹500-₹5000
- Dates spanning multiple days

---

### 🔧 DEVELOPMENT COMMANDS

**Run with Auto-reload**
```bash
FLASK_ENV=development python app.py
```

**Access MySQL Database**
```bash
mysql -u root -p aquamigo_db
```

**Reset Database**
```bash
mysql -u root -p aquamigo_db < database/schema.sql
mysql -u root -p aquamigo_db < database/seed.sql
```

---

### 📱 TESTING CHECKLIST

- [ ] Dashboard loads with metrics
- [ ] Products display correctly
- [ ] Add to cart works
- [ ] Cart updates in real-time
- [ ] Checkout creates order
- [ ] Order tracking shows status
- [ ] Order history displays
- [ ] Settings save preferences
- [ ] Responsive design works on mobile

---

### 💡 TIPS

1. **Sample Orders**: Try using Order IDs from sample data (check database/seed.sql)
2. **Customer ID**: Default is 1, modify in api.js to change default customer
3. **Mobile Testing**: Resize browser to test responsive design
4. **Chart Data**: Monthly sales chart pulls real data from database
5. **Local Storage**: User preferences saved in browser local storage

---

### 📚 FULL DOCUMENTATION

For comprehensive documentation, see:
- `README.md` - Complete project documentation
- `PROJECT_SUMMARY.md` - Detailed feature and code breakdown

---

### 🎉 YOU'RE READY!

Your AquaMigo application is now ready to use. Start by viewing the dashboard and exploring all features.

Need help? Check the README.md or troubleshooting section above.

Happy water distribution! 💧
