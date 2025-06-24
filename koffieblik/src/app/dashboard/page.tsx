'use client';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTabs } from '@/constants/tabs';

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
}

export default function DashboardPage() {
    const [selectedTab, setSelectedTab] = useState('Dashboard');
    const [filter, setFilter] = useState('Today');
    const router = useRouter();
    const [username, setUsername] = useState('Guest');

    // useEffect(() => {
    //     const storedUsername = localStorage.getItem('username');
    //     const isLoggedIn = localStorage.getItem('isLoggedIn');
    //     if (!isLoggedIn) {
    //         router.push('/login'); 
    //     }
    //     if (storedUsername) {
    //         setUsername(storedUsername);
    //     }
    // }, [router]);

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

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        router.push('/login');
    };

    const dateInputStyle = 'p-3 border border-amber-300 rounded-lg text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200';

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
            case 'Completed': return 'text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium';
            case 'Pending': return 'text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium';
            case 'Cancelled': return 'text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium';
            default: return 'text-amber-900 bg-amber-100 px-2 py-1 rounded-full text-xs font-medium';
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
        <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            {/* Enhanced Tab Navigation */}
            {/* <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-amber-200 shadow-lg">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">☕</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-amber-900">Coffee Shop Dashboard</h1>
                                <p className="text-sm text-amber-600">Welcome back, {username}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-amber-700 font-medium">
                                {new Date().toLocaleDateString('en-ZA', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                            <p className="text-xs text-amber-600">
                                {new Date().toLocaleTimeString('en-ZA', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => {
                            const isActive = selectedTab === tab;
                            const isLogout = tab === 'Logout';
                            
                            return (
                                <button
                                    key={tab}
                                    className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200'
                                            : isLogout
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200'
                                    }`}
                                    onClick={() => {
                                        if (tab === 'Logout') {
                                            handleLogout();
                                        } else {
                                            setSelectedTab(tab);
                                        }
                                    }}
                                >
                                    <span className="text-lg">{getTabIcon(tab)}</span>
                                    <span className="capitalize">
                                        {tab === 'pos' ? 'POS' : tab === 'manage' ? 'Manage' : tab}
                                    </span>
                                    {isActive && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav> */}

            {/* Page Content */}
            <div className="p-8">
                {selectedTab === 'Dashboard' && (
                    <>
                        {/* Metrics Section */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {metrics.map((metric, index) => (
                                <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50">
                                    <h2 className="text-sm text-amber-700 mb-2 font-medium">{metric.label}</h2>
                                    <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
                                    <div className="mt-3 h-1 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full"></div>
                                </div>
                            ))}
                        </section>

                        {/* Orders Section */}
                        <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
                            <div className="p-6 border-b border-amber-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-sm">📋</span>
                                        </div>
                                        <h2 className="text-xl font-bold text-amber-900">Recent Orders</h2>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
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
                                                <span className="flex items-center text-amber-700 font-medium">to</span>
                                                <input type="date" className={dateInputStyle} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gradient-to-r from-amber-100 to-orange-100">
                                        <tr>
                                            <th className="text-left px-6 py-4 font-semibold text-amber-900">Order #</th>
                                            <th className="text-left px-6 py-4 font-semibold text-amber-900">Customer</th>
                                            <th className="text-left px-6 py-4 font-semibold text-amber-900">Items</th>
                                            <th className="text-left px-6 py-4 font-semibold text-amber-900">Total</th>
                                            <th className="text-left px-6 py-4 font-semibold text-amber-900">Status</th>
                                            <th className="text-left px-6 py-4 font-semibold text-amber-900">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-amber-100">
                                        {orders.map((order, index) => (
                                            <tr key={order.id} className="hover:bg-amber-50/50 transition-colors duration-150">
                                                <td className="px-6 py-4 font-medium text-amber-900">{order.id}</td>
                                                <td className="px-6 py-4 text-amber-800">{order.customer}</td>
                                                <td className="px-6 py-4 text-amber-700">
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
                                                <td className="px-6 py-4 font-semibold text-amber-900">{order.total}</td>
                                                <td className="px-6 py-4">
                                                    <span className={getStatusStyle(order.status)}>{order.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-amber-700">{order.date}</td>
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