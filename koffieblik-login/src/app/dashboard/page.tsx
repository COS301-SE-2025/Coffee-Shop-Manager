'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type OrderStatus = 'Completed' | 'Pending' | 'Cancelled';

interface Order {
    id: string;
    customer: string;
    items: string[];
    total: string;
    status: OrderStatus;
    date: string;
}

interface Metric {
    label: string;
    value: string;
    color: string;
    icon: string;
}

export default function DashboardPage() {
    const [selectedTab, setSelectedTab] = useState('Dashboard');
    const [filter, setFilter] = useState('Today');
    const [apiMessage, setApiMessage] = useState('Refresh Data');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const [username, setUsername] = useState('Guest');

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const isLoggedIn = localStorage.getItem('isLoggedIn');

        if (!isLoggedIn) {
            router.push('/login');
        }

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

    const handleApiCall = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setApiMessage('Data Updated!');
            setTimeout(() => setApiMessage('Refresh Data'), 2000);
        } catch (error) {
            console.error('Error:', error);
            setApiMessage('Failed to fetch');
            setTimeout(() => setApiMessage('Refresh Data'), 2000);
        }
        setIsLoading(false);
    };

    const metrics: Metric[] = [
        { label: 'Total Sales Today', value: 'R1,540', color: 'text-green-600', icon: '💰' },
        { label: 'Orders Completed', value: '42', color: 'text-blue-600', icon: '✅' },
        { label: 'Top-Selling Item', value: 'Cappuccino', color: 'text-purple-600', icon: '🏆' },
        { label: 'Stock Alerts', value: 'Milk Low', color: 'text-red-600', icon: '⚠️' },
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
            case 'Completed': return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold';
            case 'Cancelled': return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold';
            default: return 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold';
        }
    };

    const getTabIcon = (tab: string) => {
        switch (tab) {
            case 'Dashboard': return '📊';
            case 'Inventory': return '📦';
            case 'Reports': return '📈';
            case 'logout': return '🚪';
            default: return '👤';
        }
    };

    // Removed tabs array since we now handle navigation differently

    return (
        <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            {/* Enhanced Navigation */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-amber-200 shadow-lg">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left side - Logo and Brand */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                ☕
                            </div>
                            <h1 className="text-xl font-bold text-amber-900">Coffee Shop Manager</h1>
                        </div>

                        {/* Center - Main Navigation Tabs */}
                        <div className="hidden md:flex items-center gap-2">
                            {['Dashboard', 'Inventory', 'Reports'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-xl transition-all duration-200 ${
                                        selectedTab === tab
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transform scale-105'
                                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200 hover:shadow-md hover:scale-102'
                                    }`}
                                    onClick={() => setSelectedTab(tab)}
                                >
                                    <span className="text-base">{getTabIcon(tab)}</span>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Right side - User Menu and Logout */}
                        <div className="flex items-center gap-3">
                            {/* User Profile Button */}
                            <button
                                className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 ${
                                    selectedTab === username
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200 hover:shadow-md'
                                }`}
                                onClick={() => setSelectedTab(username)}
                            >
                                <span className="text-base">👤</span>
                                <span className="hidden sm:inline">{username}</span>
                            </button>

                            {/* Logout Button */}
                            <button
                                className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-red-100 text-red-800 hover:bg-red-200 hover:shadow-md transition-all duration-200"
                                onClick={handleLogout}
                            >
                                <span className="text-base">🚪</span>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation - Shows on smaller screens */}
                    <div className="md:hidden mt-4 flex flex-wrap gap-2">
                        {['Dashboard', 'Inventory', 'Reports'].map((tab) => (
                            <button
                                key={tab}
                                className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 ${
                                    selectedTab === tab
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200 hover:shadow-md'
                                }`}
                                onClick={() => setSelectedTab(tab)}
                            >
                                <span className="text-base">{getTabIcon(tab)}</span>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Enhanced Page Content */}
            <div className="p-6 lg:p-8">
                {selectedTab === 'Dashboard' && (
                    <>
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-amber-900 mb-2">Dashboard Overview</h2>
                                    <p className="text-amber-700">Track your coffee shop's performance in real-time</p>
                                </div>
                                <button
                                    onClick={handleApiCall}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <span>🔄</span>
                                            {apiMessage}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Enhanced Metrics Section */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {metrics.map((metric, index) => (
                                <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-100 hover:border-amber-200 group">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                                            {metric.icon}
                                        </div>
                                        <div className="w-2 h-2 bg-amber-400 rounded-full opacity-60"></div>
                                    </div>
                                    <h3 className="text-sm font-medium text-amber-800 mb-2">{metric.label}</h3>
                                    <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                                </div>
                            ))}
                        </section>

                        {/* Enhanced Orders Section */}
                        <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-100">
                            <div className="p-6 border-b border-amber-100">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-amber-900 mb-1">Recent Orders</h2>
                                        <p className="text-amber-700 text-sm">Monitor and manage your customer orders</p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <select
                                            className="px-4 py-2.5 border border-amber-200 rounded-xl text-sm text-amber-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                        >
                                            <option>Today</option>
                                            <option>This Week</option>
                                            <option>This Month</option>
                                            <option>Custom Range</option>
                                        </select>

                                        {filter === 'Custom Range' && (
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="date" 
                                                    className="px-3 py-2 border border-amber-200 rounded-xl text-sm text-amber-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                />
                                                <span className="text-amber-600 font-medium">to</span>
                                                <input 
                                                    type="date" 
                                                    className="px-3 py-2 border border-amber-200 rounded-xl text-sm text-amber-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gradient-to-r from-amber-100 to-orange-100">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-amber-900">Order #</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-amber-900">Customer</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-amber-900">Items</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-amber-900">Total</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-amber-900">Status</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-amber-900">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-amber-100">
                                        {orders.map((order, index) => (
                                            <tr key={order.id} className="hover:bg-amber-50/50 transition-colors duration-150">
                                                <td className="px-6 py-4 text-sm font-medium text-amber-900">{order.id}</td>
                                                <td className="px-6 py-4 text-sm text-amber-800">{order.customer}</td>
                                                <td className="px-6 py-4 text-sm text-amber-800 max-w-xs">
                                                    <div className="flex flex-wrap gap-1">
                                                        {order.items.map((item, itemIndex) => (
                                                            <span 
                                                                key={itemIndex}
                                                                className="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded-lg text-xs"
                                                            >
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-amber-900">{order.total}</td>
                                                <td className="px-6 py-4">
                                                    <span className={getStatusStyle(order.status)}>{order.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-amber-700">{order.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}

                {selectedTab === 'Inventory' && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h2 className="text-2xl font-bold text-amber-900 mb-2">Inventory Management</h2>
                        <p className="text-amber-700">Your inventory management system will be available here soon.</p>
                    </div>
                )}

                {selectedTab === 'Reports' && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
                        <div className="text-6xl mb-4">📈</div>
                        <h2 className="text-2xl font-bold text-amber-900 mb-2">Reports Dashboard</h2>
                        <p className="text-amber-700">Comprehensive reports and analytics coming soon.</p>
                    </div>
                )}

                {selectedTab === username && (
                    <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-100">
                        <div className="p-6 border-b border-amber-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xl">
                                    👤
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-amber-900">Profile Settings</h2>
                                    <p className="text-sm text-amber-700">Update your account information</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const newUsername = (e.target as any).newUsername.value;

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
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-amber-900 mb-2">
                                        New Username
                                    </label>
                                    <input
                                        type="text"
                                        name="newUsername"
                                        required
                                        className="w-full p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                        placeholder="Enter new username"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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