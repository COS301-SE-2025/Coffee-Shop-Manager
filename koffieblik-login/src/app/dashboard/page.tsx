'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type OrderStatus = 'Completed' | 'Pending' | 'Cancelled';

interface Order {
    id: string;
    customer: string;
    items: string[]; // Changed from item: string
    total: string;
    status: OrderStatus;
    date: string;
}



interface Metric {
    label: string;
    value: string;
    color: string;
}

export default function DashboardPage() {
    const [selectedTab, setSelectedTab] = useState('Dashboard');
    const [filter, setFilter] = useState('Today');
    const [apiMessage, setApiMessage] = useState('Click Me!');
    const router = useRouter();
    const [username, setUsername] = useState('Guest');


    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const isLoggedIn = localStorage.getItem('isLoggedIn');

        // if (!isLoggedIn) {
        //     router.push('/login'); // Redirect to login if not authenticated
        // }

        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, [router]);


    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        router.push('/login');
    };


    const dateInputStyle = 'p-2 border rounded text-sm text-amber-900';

    const metrics: Metric[] = [
        { label: 'Total Sales Today', value: 'R1,540', color: 'text-amber-600' },
        { label: 'Orders Completed', value: '42', color: 'text-amber-600' },
        { label: 'Top-Selling Item', value: 'Cappuccino', color: 'text-amber-600' },
        { label: 'Stock Alerts', value: 'Milk Low', color: 'text-red-600' },
    ];

    const orders: Order[] = [
        { id: '#1001', customer: 'Thando M.', items: ['Latte x2'], total: 'R70', status: 'Completed', date: '2025-05-26' },
        { id: '#1002', customer: 'Nomsa L.', items: ['Espresso'], total: 'R25', status: 'Pending', date: '2025-05-26' },
        { id: '#1003', customer: 'Sipho D.', items: ['Cappuccino x2'], total: 'R80', status: 'Completed', date: '2025-05-25' },
        { id: '#1004', customer: 'Lerato B.', items: ['Flat White'], total: 'R35', status: 'Cancelled', date: '2025-05-25' },
        { id: '#1005', customer: 'Kabelo T.', items: ['Mocha'], total: 'R40', status: 'Pending', date: '2025-05-24' },
        { id: '#1006', customer: 'Zanele K.', items: ['Americano x2'], total: 'R50', status: 'Completed', date: '2025-05-24' },
        { id: '#1007', customer: 'Nandi R.', items: ['Chai Latte', 'Brownie'], total: 'R60', status: 'Completed', date: '2025-05-24' },
        { id: '#1008', customer: 'Tshepo N.', items: ['Cortado'], total: 'R28', status: 'Cancelled', date: '2025-05-23' },
        { id: '#1009', customer: 'Ayanda S.', items: ['Latte', 'Muffin'], total: 'R55', status: 'Completed', date: '2025-05-23' },
        { id: '#1010', customer: 'Boitumelo J.', items: ['Iced Coffee', 'Croissant'], total: 'R65', status: 'Pending', date: '2025-05-22' },
        { id: '#1011', customer: 'Dineo M.', items: ['Macchiato'], total: 'R29', status: 'Completed', date: '2025-05-22' },
        { id: '#1012', customer: 'Sizwe H.', items: ['Cappuccino x3'], total: 'R120', status: 'Pending', date: '2025-05-21' },
        { id: '#1013', customer: 'Naledi F.', items: ['Mocha', 'Croissant'], total: 'R60', status: 'Completed', date: '2025-05-21' },
        { id: '#1014', customer: 'Bongani P.', items: ['Flat White x2'], total: 'R70', status: 'Cancelled', date: '2025-05-20' },
        { id: '#1015', customer: 'Lelethu D.', items: ['Espresso x2'], total: 'R50', status: 'Completed', date: '2025-05-20' },
        {
            id: '#1000',
            customer: 'Big John',
            items: [
                'Latte', 'Espresso', 'Cappuccino', 'Flat White', 'Mocha',
                'Americano', 'Chai Latte', 'Macchiato', 'Iced Coffee', 'Croissant'
            ],
            total: 'R320',
            status: 'Completed',
            date: '2025-05-26'
        },

    ];



    const getStatusStyle = (status: OrderStatus) => {
        switch (status) {
            case 'Completed': return 'text-green-700';
            case 'Pending': return 'text-yellow-600';
            case 'Cancelled': return 'text-red-600';
            default: return 'text-amber-900';
        }
    };

    const tabs = ['Dashboard', 'Inventory', 'Reports', 'logout', username];

    return (
        <main className="min-h-screen bg-amber-100">
            {/* Tab Ribbon */}
            <nav className="sticky top-0 z-50 bg-white border-b border-amber-200 px-8 py-4 flex gap-4">

                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`text-sm font-semibold px-4 py-2 rounded-full transition ${selectedTab === tab
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                            }`}
                        onClick={() => {
                            if (tab === 'logout') {
                                handleLogout();
                            } else {
                                setSelectedTab(tab);
                            }
                        }}

                    >
                        {tab}
                    </button>
                ))}
            </nav>

            {/* Page Content */}
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-8 text-amber-900">☕ {selectedTab}</h1>

                {selectedTab === 'Dashboard' && (
                    <>
                        <div className="mb-6">
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/orders');
                                        const data = await res.json();
                                        setApiMessage(data.message);
                                    } catch (error) {
                                        console.error('Error:', error);
                                        setApiMessage('Failed to fetch');
                                    }
                                }}
                                className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition"
                            >
                                {apiMessage}
                            </button>
                        </div>

                        {/* Metrics Section */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {metrics.map((metric, index) => (
                                <div key={index} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
                                    <h2 className="text-sm text-amber-900 mb-1">{metric.label}</h2>
                                    <p className={`text-2xl font-semibold ${metric.color}`}>{metric.value}</p>
                                </div>
                            ))}
                        </section>

                        {/* Orders Section */}
                        <section className="bg-white rounded-2xl shadow p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <h2 className="text-xl font-bold text-amber-900">Recent Orders</h2>

                                <div className="flex flex-wrap gap-2">
                                    <select
                                        className={dateInputStyle}
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
                                            <input type="date" className={dateInputStyle} />
                                            <span className={dateInputStyle}>to</span>
                                            <input type="date" className={dateInputStyle} />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-amber-800">
                                    <thead className="bg-amber-200 text-amber-900">
                                        <tr>
                                            <th className="text-left px-4 py-2">Order #</th>
                                            <th className="text-left px-4 py-2">Customer</th>
                                            <th className="text-left px-4 py-2">Item</th>
                                            <th className="text-left px-4 py-2">Total</th>
                                            <th className="text-left px-4 py-2">Status</th>
                                            <th className="text-left px-4 py-2">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-amber-50 border-b transition">
                                                <td className="px-4 py-2">{order.id}</td>
                                                <td className="px-4 py-2">{order.customer}</td>
                                                <td className="px-4 py-2">
                                                    {order.items.map((item, index) => {
                                                        const isLast = index === order.items.length - 1;
                                                        const isLineBreak = (index + 1) % 4 === 0;

                                                        return (
                                                            <span key={index}>
                                                                {item}
                                                                {!isLast && !isLineBreak && ', '}
                                                                {isLineBreak && !isLast && <br />}
                                                            </span>
                                                        );
                                                    })}
                                                </td>



                                                <td className="px-4 py-2">{order.total}</td>
                                                <td className="px-4 py-2 font-medium">
                                                    <span className={getStatusStyle(order.status)}>{order.status}</span>
                                                </td>
                                                <td className="px-4 py-2">{order.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}

                {selectedTab === 'Inventory' && (
                    <div className="text-amber-900">
                        <p className="text-lg">📦 Inventory management will go here.</p>
                    </div>
                )}

                {selectedTab === 'Reports' && (
                    <div className="text-amber-900">
                        <p className="text-lg">📊 Reports dashboard coming soon.</p>
                    </div>
                )}

                {selectedTab === username && (
                    <div className="text-amber-900 max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold mb-4">Change Username</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const newUsername = (e.target as any).newUsername.value;

                                const email = localStorage.getItem('email'); // Ensure email is saved on login
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
                                        location.reload(); // Reload to reflect new username
                                    } else {
                                        alert(result.message || 'Failed to update username.');
                                    }
                                } catch (error) {
                                    console.error(error);
                                    alert('Something went wrong.');
                                }
                            }}
                        >
                            <label className="block mb-2 font-medium">New Username:</label>
                            <input
                                type="text"
                                name="newUsername"
                                required
                                className="w-full p-2 border border-amber-300 rounded mb-4"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-amber-600 text-white font-semibold rounded hover:bg-amber-700 transition"
                            >
                                Update Username
                            </button>
                        </form>
                    </div>
                )}




            </div>
        </main>
    );
}
