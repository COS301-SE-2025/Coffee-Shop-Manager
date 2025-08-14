'use client';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTabs } from '@/constants/tabs';




interface Order {
    id: string;
    number: number;
    status: string;
    total_price: number;
    created_at: string;
    order_products: {
        quantity: number;
        price: number;
        products: {
            name: string;
            price: number;
            description: string;
        };
    }[];
}




export default function DashboardPage() {
    const [selectedTab, setSelectedTab] = useState('Dashboard');
    const [filter, setFilter] = useState('Today');
    const router = useRouter();
    const [username, setUsername] = useState('Guest');
    const [orders, setOrders] = useState<Order[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'admin') {
            router.replace('/login');
        }
    }, [router]);

   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    useEffect(() => {
        async function fetchOrders() {
            try {
                const response = await fetch(`${API_BASE_URL}/get_orders`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                const data = await response.json();

                if (response.ok) {
                    // console.log('Orders fetched:', data.orders);
                    setOrders(data.orders);
                    // console.log(orders);
                } else {
                    console.warn('⚠️ Failed to fetch orders:', data.error || 'Unknown error');
                }
            } catch (error) {
                console.error('❌ Network or server error:', error);
            }
        }

        fetchOrders();
    }, []);




    // Route to inventory
    useEffect(() => {
        if (selectedTab === 'Inventory') {
            router.push('/inventory');
        }
    }, [selectedTab, router]);

    useEffect(() => {
        if (selectedTab === 'pos') {
            router.push('/pos');
        }
    }, [selectedTab, router]);

    useEffect(() => {
        if (selectedTab === 'manage') {
            router.push('/manage');
        }
    }, [selectedTab, router]);

    useEffect(() => {
        if (selectedTab === 'Reports') {
            router.push('/reports');
        }
    }, [selectedTab, router]);

    useEffect(() => {
        if (selectedTab === 'Help') {
            router.push('/help');

        }
    }, [selectedTab, router]);


    const dateInputStyle =
        'p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200';

    type Metric = {
        label: string;
        value: string;
        color?: string;
    };

    const now = new Date();
    let filteredOrders = orders;

    if (filter === 'Today') {
        filteredOrders = orders.filter(order =>
            new Date(order.created_at).toDateString() === now.toDateString()
        );
    } else if (filter === 'This Week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        filteredOrders = orders.filter(order =>
            new Date(order.created_at) >= startOfWeek
        );
    } else if (filter === 'This Month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredOrders = orders.filter(order =>
            new Date(order.created_at) >= startOfMonth
        );
    } else if (filter === 'Custom Range' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= start && orderDate <= end;
        });
    }

    const totalSales = filteredOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.total_price, 0);

    const ordersCompleted = filteredOrders.filter(order => order.status === 'completed').length;

    const topSelling = (() => {
        const productCountMap: Record<string, number> = {};

        for (const order of orders) {
            for (const op of order.order_products) {
                const name = op.products.name;
                productCountMap[name] = (productCountMap[name] || 0) + op.quantity;
            }
        }

        return Object.entries(productCountMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    })();

    const stockAlerts = 'Milk Low';

    const metrics: Metric[] = [
        {
            label: 'Total Sales Today',
            value: `R${totalSales.toFixed(2)}`,
            color: 'var(--primary-3)',
        },
        {
            label: 'Orders Completed',
            value: ordersCompleted.toString(),
            color: 'var(--primary-3)',
        },
        {
            label: 'Top-Selling Item',
            value: topSelling,
            color: 'var(--primary-3)',
        },
        {
            label: 'Stock Alerts',
            value: stockAlerts,
            color: '#dc2626',
        },
    ];




    // const orders: Order[] = [
    //     { id: '#1001', customer: 'Thando M.', items: ['Latte x2'], total: 'R70', status: 'Completed', date: '2025-05-26' },
    //     { id: '#1002', customer: 'Nomsa L.', items: ['Espresso'], total: 'R25', status: 'Pending', date: '2025-05-26' },
    //     { id: '#1003', customer: 'Sipho D.', items: ['Cappuccino x2'], total: 'R80', status: 'Completed', date: '2025-05-25' },
    //     { id: '#1004', customer: 'Lerato B.', items: ['Flat White'], total: 'R35', status: 'Cancelled', date: '2025-05-25' },
    //     { id: '#1005', customer: 'Kabelo T.', items: ['Mocha'], total: 'R40', status: 'Pending', date: '2025-05-24' },
    //     { id: '#1006', customer: 'Zanele K.', items: ['Americano x2'], total: 'R50', status: 'Completed', date: '2025-05-24' },
    //     { id: '#1007', customer: 'Nandi R.', items: ['Chai Latte', 'Brownie'], total: 'R60', status: 'Completed', date: '2025-05-24' },
    //     { id: '#1008', customer: 'Tshepo N.', items: ['Cortado'], total: 'R28', status: 'Cancelled', date: '2025-05-23' },
    //     { id: '#1009', customer: 'Ayanda S.', items: ['Latte', 'Muffin'], total: 'R55', status: 'Completed', date: '2025-05-23' },
    //     { id: '#1010', customer: 'Boitumelo J.', items: ['Iced Coffee', 'Croissant'], total: 'R65', status: 'Pending', date: '2025-05-22' },
    //     { id: '#1011', customer: 'Dineo M.', items: ['Macchiato'], total: 'R29', status: 'Completed', date: '2025-05-22' },
    //     { id: '#1012', customer: 'Sizwe H.', items: ['Cappuccino x3'], total: 'R120', status: 'Pending', date: '2025-05-21' },
    //     { id: '#1013', customer: 'Naledi F.', items: ['Mocha', 'Croissant'], total: 'R60', status: 'Completed', date: '2025-05-21' },
    //     { id: '#1014', customer: 'Bongani P.', items: ['Flat White x2'], total: 'R70', status: 'Cancelled', date: '2025-05-20' },
    //     { id: '#1015', customer: 'Lelethu D.', items: ['Espresso x2'], total: 'R50', status: 'Completed', date: '2025-05-20' },
    //     {
    //         id: '#1000',
    //         customer: 'Big John',
    //         items: [
    //             'Latte', 'Espresso', 'Cappuccino', 'Flat White', 'Mocha',
    //             'Americano', 'Chai Latte', 'Macchiato', 'Iced Coffee', 'Croissant'
    //         ],
    //         total: 'R320',
    //         status: 'Completed',
    //         date: '2025-05-26'
    //     },
    // ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed': return 'text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium';
            case 'Pending': return 'text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium';
            case 'Cancelled': return 'text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium';
            default: return 'text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium';
        }
    };

    const getTabIcon = (tab: string) => {
        switch (tab) {
            case 'Dashboard': return '📊';
            case 'Inventory': return '📦';
            case 'Reports': return '📈';
            case 'pos': return '🛒';
            case 'manage': return '⚙️';
            case 'Help': return '❓';
            case 'Logout': return '🚪';
            default: return '👤';
        }
    };

    const tabs = username ? getTabs(username) : [];

    return (
        <main className="relative min-h-full bg-transparent">

            {/* Page Content */}
            <div className="p-8">
                {selectedTab === 'Dashboard' && (
                    <>
                        {/* Metrics Section */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {metrics.map((metric, index) => (
                                <div
                                    key={index}
                                    className="bg-black/45 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-[var(--primary-4)]"
                                >
                                    <h2
                                        className="text-sm mb-2 font-medium text-[var(--primary-2)]"
                                    >
                                        {metric.label}
                                    </h2>

                                    <p className="text-3xl font-bold" style={{ color: metric.color }}>
                                        {metric.value}
                                    </p>

                                    <div
                                        className="mt-3 h-1 rounded-full"
                                        style={{ backgroundColor: 'var(--primary-4)' }}
                                    ></div>
                                </div>
                            ))}
                        </section>


                        {/* Orders Section */}
                        <section
                            className="backdrop-blur-sm bg-black/45 border border-[var(--primary-4)] rounded-2xl shadow-xl"
                        >
                            <div
                                className="p-6 border-b"
                                style={{ borderColor: 'var(--primary-3)' }}
                            >

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: 'var(--primary-3)' }}
                                        >
                                            <span className="text-sm" style={{ color: 'var(--primary-3)' }}>📋</span>
                                        </div>

                                        <h2
                                            className="text-xl font-bold"
                                            style={{ color: 'var(--primary-2)' }}
                                        >
                                            Recent Orders
                                        </h2>

                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <select
                                            className={`${dateInputStyle} backdrop-blur-md text-[var(--primary-2)]`}
                                            style={{
                                                backgroundColor: 'var(--primary-3)',
                                                borderColor: 'var(--primary-3)',
                                                boxShadow: '0 0 0 0 transparent',
                                            }}
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                        >
                                            <option>Today</option>
                                            <option>This Week</option>
                                            <option>This Month</option>
                                            <option>Custom Range</option>
                                        </select>
                                        {filter === 'Custom Range' && (
                                            <>
                                                <input
                                                    type="date"
                                                    className={dateInputStyle}
                                                    value={startDate}
                                                    onChange={e => setStartDate(e.target.value)}
                                                    style={{
                                                        borderColor: 'var(--primary-4)',
                                                        color: 'var(--primary-2)',
                                                        boxShadow: '0 0 0 0 transparent',
                                                    }}
                                                />
                                                <span
                                                    className="flex items-center font-medium"
                                                    style={{ color: 'var(--primary-2)' }}
                                                >
                                                    to
                                                </span>
                                                <input
                                                    type="date"
                                                    className={dateInputStyle}
                                                    value={endDate}
                                                    onChange={e => setEndDate(e.target.value)}
                                                    style={{
                                                        borderColor: 'var(--primary-4)',
                                                        color: 'var(--primary-2)',
                                                        boxShadow: '0 0 0 0 transparent',
                                                    }}
                                                />
                                            </>

                                        )}

                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead style={{ backgroundColor: 'var(--primary-3)' }}>
                                        <tr>
                                            <th className="text-left px-6 py-4 font-semibold" style={{ color: 'var(--primary-2)' }}>Order #</th>
                                            {/* <th className="text-left px-6 py-4 font-semibold" style={{ color: 'var(--primary-2)' }}>Customer</th> */}
                                            <th className="text-left px-6 py-4 font-semibold" style={{ color: 'var(--primary-2)' }}>Items</th>
                                            <th className="text-left px-6 py-4 font-semibold" style={{ color: 'var(--primary-2)' }}>Total</th>
                                            <th className="text-left px-6 py-4 font-semibold" style={{ color: 'var(--primary-2)' }}>Status</th>
                                            <th className="text-left px-6 py-4 font-semibold" style={{ color: 'var(--primary-2)' }}>Date</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y text-[var(--primary-2)]" style={{ borderColor: 'var(--primary-3)' }}>
                                        {filteredOrders.map((order) => (

                                            <tr key={order.id}>
                                                <td className="px-6 py-4 font-medium">{order.number}</td>
                                                {/* <td className="px-6 py-4">Customer</td> */}
                                                <td className="px-6 py-4">
                                                    {order.order_products.map(p => `${p.products.name} x${p.quantity}`).join(', ')}
                                                </td>
                                                <td className="px-6 py-4 font-semibold">R{order.total_price}</td>
                                                <td className="px-6 py-4">
                                                    <span className={getStatusStyle(order.status)}>{order.status}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {new Date(order.created_at).toLocaleDateString('en-ZA')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                            </div>
                        </section>
                    </>
                )}

                {selectedTab === username && (
                    <div className="max-w-md mx-auto">
                        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                                    <span className="text-white text-lg">👤</span>
                                </div>
                                <h2 className="text-2xl font-bold text-amber-900">Update Profile</h2>
                            </div>

                            <form
                                onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const newUsername = formData.get('newUsername') as string;
                                    const email = localStorage.getItem('email');

                                    if (!email) {
                                        alert("Missing email. Please log out and log in again.");
                                        return;
                                    }

                                    try {
                                        const response = await fetch('/api/API', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                action: 'change_Username',
                                                email: localStorage.getItem('email'),
                                                username: newUsername,
                                            }),
                                        });
                                        const result = await response.json();
                                        if (result.success) {
                                            alert('Username updated successfully!');
                                            localStorage.setItem('username', result.user.username);
                                            location.reload();
                                        } else {
                                            alert(result.message || 'Failed to update username.');
                                        }
                                    } catch (error) {
                                        console.error(error);
                                        alert('Something went wrong.');
                                    }
                                }}
                            >
                                <label className="block mb-3 font-semibold text-amber-900">New Username:</label>
                                <input
                                    type="text"
                                    name="newUsername"
                                    required
                                    className="w-full p-4 border border-amber-300 rounded-xl mb-6 focus:outline-none focus:ring-3 focus:ring-amber-300 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your new username"
                                />
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                >
                                    Update Username
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}