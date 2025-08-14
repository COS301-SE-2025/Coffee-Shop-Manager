'use client';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTabs } from '@/constants/tabs';
import Loader from '../loaders/loader';



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
    const [filter, setFilter] = useState('Today');
    const [orders, setOrders] = useState<Order[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showOrder, setShowOrders] = useState(false);
    const [showPoints, setShowPoints] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'user') {
            router.replace('/login');
        }
    }, [router]);


    async function fetchOrders() {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/get_orders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setOrders(data.orders);
            } else {
                console.warn('⚠️ Failed to fetch orders:', data.error || 'Unknown error');
            }
        } catch (error) {
            console.error('❌ Network or server error:', error);
        } finally {
            setLoading(false);
        }
    }









    const dateInputStyle =
        'p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200';


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


    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed': return 'text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium';
            case 'Pending': return 'text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium';
            case 'Cancelled': return 'text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium';
            default: return 'text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium';
        }
    };




    return (

        <main className="relative min-h-full bg-transparent">
            {/* <div className="absolute inset-0 bg-black opacity-60 z-0"></div> */}
            {/* <div className="relative z-10"> */}
            {!showOrder && !showPoints && (
                <div className="p-8 flex flex-col items-center justify-center min-h-full w-full">
                    <div className="flex flex-row gap-6">
                        <button
                            onClick={() => {
                                setShowOrders(true);
                                fetchOrders();
                            }}
                            className="select-none w-full sm:w-auto px-6 py-4 bg-black/45 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border border-[var(--primary-4)] text-left flex items-center gap-4 text-[var(--primary-2)]"

                        >
                            <div className="text-3xl">📋</div>
                            <div>
                                <h2 className="text-xl font-bold text-[var(--primary-2)]">View Orders</h2>
                                <p className="text-sm text-[var(--primary-4)]">Click to view your past orders.</p>
                            </div>
                        </button>

                        <button
                            className="select-none w-full sm:w-auto px-6 py-4 bg-black/45 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border border-[var(--primary-4)] text-left flex items-center gap-4 text-[var(--primary-2)]"
                            onClick={() => {
                                setShowPoints(true);
                            }}>

                            <div className="text-3xl">🎯</div>
                            <div>
                                <h2 className="text-xl font-bold text-[var(--primary-2)]">See Points</h2>
                                <p className="text-sm text-[var(--primary-4)]">Check your rewards or loyalty points.</p>
                            </div>
                        </button>
                    </div>

                    {/* Spacer Content */}
                    <div className="mt-12 text-center flex flex-col items-center gap-4 opacity-80">
                        <p className="text-lg italic text-white max-w-md">
                            “Good coffee is a pleasure. Good friends are a treasure.”
                        </p>

                        {/* <img
                            src="/assets/close-up-view-dark-fresh-roasted-coffee-beans-coffee-beans-background.jpg"
                            alt="Coffee cup illustration"
                            className="w-48 h-auto opacity-70"
                        /> */}

                    </div>
                </div>
            )}




            {showOrder && (
                <div className="p-8">

                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            <button
                                className="select-none backdrop-blur-sm bg-black/45 border border-[var(--primary-4)] rounded-xl shadow-md px-4 py-2 inline-block text-[var(--primary-2)] text-xl font-semibold leading-none"
                                onClick={() => setShowOrders(false)}
                            >
                                ←
                            </button>





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


                </div>
            )}

            {showPoints && (
                <div className="p-8">
                    <button
                        className="select-none backdrop-blur-sm bg-black/45 border border-[var(--primary-4)] rounded-xl shadow-md px-4 py-2 inline-block text-[var(--primary-2)] text-xl font-semibold leading-none"
                        onClick={() => setShowPoints(false)}
                    >
                        ←
                    </button>

                    <div className="backdrop-blur-sm bg-black/45 border border-[var(--primary-4)] rounded-2xl shadow-xl p-6 space-y-6 text-[var(--primary-2)]">

                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--primary-4)]">🎯 Your Loyalty Points</h2>

                        </div>

                        {/* Points Overview */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4 shadow-inner border" style={{ borderColor: 'var(--primary-4)' }}>
                                <p className="text-sm opacity-70">Total Points</p>
                                <p className="text-3xl font-bold text-green-400">1,250</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur rounded-xl p-4 shadow-inner border" style={{ borderColor: 'var(--primary-4)' }}>
                                <p className="text-sm opacity-70">Points This Month</p>
                                <p className="text-2xl font-semibold text-yellow-300">300</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur rounded-xl p-4 shadow-inner border" style={{ borderColor: 'var(--primary-4)' }}>
                                <p className="text-sm opacity-70">Redeemed Points</p>
                                <p className="text-2xl font-semibold text-red-300">150</p>
                            </div>
                        </div>


                        {/* Recent Activity */}
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--primary-4)] mb-3">📅 Recent Activity</h3>
                            <ul className="space-y-2 text-lg">
                                <li className="bg-white/5 px-4 py-2 rounded-lg flex justify-between items-center">
                                    <span>+100 points — Latte Purchase</span>
                                    <span className="opacity-70">2025-07-29</span>
                                </li>
                                <li className="bg-white/5 px-4 py-2 rounded-lg flex justify-between items-center">
                                    <span>+200 points — Referral Bonus</span>
                                    <span className="opacity-70">2025-07-27</span>
                                </li>
                                <li className="bg-white/5 px-4 py-2 rounded-lg flex justify-between items-center">
                                    <span>-150 points — Free Cappuccino</span>
                                    <span className="opacity-70">2025-07-24</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            )}



            {/* </div> */}
        </main>
    );
}