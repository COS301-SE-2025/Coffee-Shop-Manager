'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const summaryCards = [
  { title: 'Top Product', value: 'Cappuccino', icon: '☕' },
  { title: 'Busiest Day', value: 'Saturday', icon: '📈' },
  { title: 'Total Sales', value: 'R12,500', icon: '💰' },
  { title: 'Orders Today', value: '68', icon: '🛒' },
];

const salesData = [
  { day: 'Mon', sales: 800 },
  { day: 'Tue', sales: 1200 },
  { day: 'Wed', sales: 1100 },
  { day: 'Thu', sales: 1600 },
  { day: 'Fri', sales: 2000 },
  { day: 'Sat', sales: 2400 },
  { day: 'Sun', sales: 1800 },
];

const highlights = [
  { id: 'R1001', note: 'Highest single order', amount: 'R450', customer: 'Zara' },
  { id: 'R1007', note: 'Repeat customer', amount: 'R320', customer: 'Musa' },
  { id: 'R1012', note: 'Large group', amount: 'R610', customer: 'Group Booking' },
];

export default function QuickReport() {
  return (
    <main className="min-h-screen px-6 py-4 bg-amber-50 text-amber-900">
      <h1 className="text-2xl font-bold mb-4">Quick Report</h1>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map(({ title, value, icon }) => (
          <div
            key={title}
            className="rounded-2xl p-4 shadow-md bg-amber-100 hover:bg-amber-200 transition"
          >
            <div className="text-xl font-semibold flex items-center gap-2">
              <span className="text-2xl">{icon}</span> {title}
            </div>
            <p className="text-amber-800 mt-1 text-lg">{value}</p>
          </div>
        ))}
      </section>

      {/* Chart + Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-semibold mb-2">Weekly Sales</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#D97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Highlights */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-semibold mb-2">Highlights</h2>
          <table className="w-full text-sm text-left text-amber-900">
            <thead className="text-xs bg-amber-200">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Note</th>
                <th className="px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {highlights.map(({ id, note, customer, amount }) => (
                <tr
                  key={id}
                  className="border-t border-amber-100 hover:bg-amber-50 transition-colors"
                >
                  <td className="px-4 py-2 font-semibold">{id}</td>
                  <td className="px-4 py-2">{customer}</td>
                  <td className="px-4 py-2">{note}</td>
                  <td className="px-4 py-2">{amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
