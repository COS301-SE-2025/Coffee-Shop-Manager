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
    const [filter, setFilter] = useState('Today');
    const [orders, setOrders] = useState<Order[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showOrder, setShowOrders] = useState(false);




    useEffect(() => {
        async function fetchOrders() {
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
        <main
            className="h-full" // Changed from min-h-screen
            style={{ backgroundColor: 'var(--primary-4)' }}
        >

            {!showOrder && (
                <div className="p-8">
                    <button
                        onClick={() => setShowOrders(true)}
                        className="w-full sm:w-auto px-6 py-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border border-[var(--primary-3)] text-left flex items-center gap-4"
                    >
                        <div className="text-3xl">📋</div>
                        <div>
                            <h2 className="text-xl font-bold text-[var(--primary-3)]">View Orders</h2>
                            <p className="text-sm text-[var(--primary-1)]">Click to view your past orders.</p>
                        </div>
                    </button>
                </div>
            )}


            {showOrder && (
                <div className="p-8">
                    {(
                        <>

                            {/* Orders Section */}
                            <section
                                className="backdrop-blur-sm rounded-2xl shadow-xl"
                                style={{
                                    backgroundColor: 'var(--primary-2)',
                                    border: '1px solid var(--primary-3)',
                                }}
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
                                                style={{ color: 'var(--primary-3)' }}
                                            >
                                                Recent Orders
                                            </h2>

                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <select
                                                className={dateInputStyle}
                                                style={{
                                                    borderColor: 'var(--primary-3)',
                                                    color: 'var(--primary-3)',
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
                                                            borderColor: 'var(--primary-3)',
                                                            color: 'var(--primary-3)',
                                                            boxShadow: '0 0 0 0 transparent',
                                                        }}
                                                    />
                                                    <span
                                                        className="flex items-center font-medium"
                                                        style={{ color: 'var(--primary-3)' }}
                                                    >
                                                        to
                                                    </span>
                                                    <input
                                                        type="date"
                                                        className={dateInputStyle}
                                                        value={endDate}
                                                        onChange={e => setEndDate(e.target.value)}
                                                        style={{
                                                            borderColor: 'var(--primary-3)',
                                                            color: 'var(--primary-3)',
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

                                        <tbody className="divide-y text-[var(--primary-3)]" style={{ borderColor: 'var(--primary-3)' }}>
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

        </main>
    );
}