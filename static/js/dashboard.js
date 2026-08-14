// AquaMigo - Dashboard Script

let salesChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<span>⟳</span> <b>Refreshing...</b>';
            showToast('Refreshing data...', 'info');
            try {
                await refreshDashboard();
                showToast('Dashboard updated successfully', 'success');
            } catch (error) {
                showToast('Unable to refresh dashboard', 'error');
            } finally {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<span>⟳</span> <b>Refresh</b>';
            }
        });
    }

    try {
        await refreshDashboard();
    } catch (error) {
        console.error('Dashboard bootstrap failed:', error);
        showToast('Dashboard failed to load data', 'error');
    }
});

async function refreshDashboard() {
    await Promise.all([
        loadDashboardStats(),
        loadRecentOrders(),
        loadMonthlySalesChart()
    ]);
    updateLastUpdated();
}

function updateLastUpdated() {
    const label = document.getElementById('lastUpdated');
    if (!label) return;
    const now = new Date();
    label.textContent = `Updated ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
}

async function loadDashboardStats() {
    try {
        const response = await API.getDashboardStats();
        const stats = response.data;
        
        const animateMetric = (id, value) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = value;
            el.style.transform = 'scale(1.05)';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
            }, 180);
        };

        animateMetric('totalCustomers', stats.total_customers);
        animateMetric('totalBottles', stats.total_bottles_sold);
        animateMetric('totalOrders', stats.total_orders);
        animateMetric('totalRevenue', formatCurrency(stats.total_revenue));
        animateMetric('deliveredOrders', stats.delivered_orders);
        animateMetric('pendingOrders', stats.pending_orders);
        animateMetric('lowStockAlerts', stats.low_stock_alerts);
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        const fallbackValues = { total_customers: 0, total_bottles_sold: 0, total_orders: 0, total_revenue: 0, delivered_orders: 0, pending_orders: 0, low_stock_alerts: 0 };
        document.getElementById('totalCustomers').textContent = fallbackValues.total_customers;
        document.getElementById('totalBottles').textContent = fallbackValues.total_bottles_sold;
        document.getElementById('totalOrders').textContent = fallbackValues.total_orders;
        document.getElementById('totalRevenue').textContent = formatCurrency(fallbackValues.total_revenue);
        document.getElementById('deliveredOrders').textContent = fallbackValues.delivered_orders;
        document.getElementById('pendingOrders').textContent = fallbackValues.pending_orders;
        document.getElementById('lowStockAlerts').textContent = fallbackValues.low_stock_alerts;
    }
}

async function loadRecentOrders() {
    try {
        const response = await API.getRecentOrders();
        const orders = response.data || [];
        
        const tbody = document.getElementById('recentOrdersBody');
        if (!tbody) return;
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 20px;">No orders yet. Start selling water bottles!</td></tr>';
            return;
        }
        
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.order_id}</td>
                <td>${order.customer_name}</td>
                <td>${formatCurrency(order.total_amount)}</td>
                <td>
                    <span class="status-badge ${order.status.toLowerCase().replace(/ /g, '-')}">
                        ${order.status}
                    </span>
                </td>
                <td>${formatDate(order.created_at)}</td>
                <td>
                    <button class="remove-order-btn" data-order-id="${order.order_id}" type="button" title="Remove order">Remove</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.remove-order-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                event.stopPropagation();
                const orderId = button.dataset.orderId;
                if (!orderId) return;

                const confirmed = window.confirm('Remove this recent order?');
                if (!confirmed) return;

                try {
                    await API.deleteOrder(orderId);
                    showToast('Order removed from recent list', 'success');
                    await refreshDashboard();
                } catch (error) {
                    console.error('Error removing order:', error);
                    showToast(error.message || 'Unable to remove order', 'error');
                }
            });
        });
        
    } catch (error) {
        console.error('Error loading recent orders:', error);
        const tbody = document.getElementById('recentOrdersBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 20px;">No orders available</td></tr>';
        }
    }
}

async function loadMonthlySalesChart() {
    try {
        const response = await API.getMonthlySales();
        const salesData = response.data;
        
        // Prepare chart data
        const labels = salesData.map(item => item.month);
        const orderData = salesData.map(item => item.orders);
        const revenueData = salesData.map(item => item.revenue);
        
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (salesChart) {
            salesChart.destroy();
        }
        
        // Create new chart
        salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Orders',
                        data: orderData,
                        backgroundColor: 'rgba(21, 87, 215, 0.78)',
                        borderColor: 'rgba(21, 87, 215, 1)',
                        borderRadius: 8,
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Revenue (₹)',
                        data: revenueData,
                        backgroundColor: 'rgba(16, 185, 129, 0.75)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderRadius: 8,
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Orders'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.15)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue (₹)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    },
                    title: {
                        display: false
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading monthly sales chart:', error);
        showToast('Error loading chart data', 'error');
    }
}
