'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart
} from 'recharts';
import { useState } from 'react';

const summaryCards = [
  { title: 'Top Product', value: 'Cappuccino', icon: '☕', trend: '+12%', trendColor: 'text-green-600' },
  { title: 'Busiest Day', value: 'Saturday', icon: '📈', trend: '2.4k orders', trendColor: 'text-blue-600' },
  { title: 'Total Sales', value: 'R12,500', icon: '💰', trend: '+8.5%', trendColor: 'text-green-600' },
  { title: 'Orders Today', value: '68', icon: '🛒', trend: '+15%', trendColor: 'text-green-600' },
];

const salesData = [
  { day: 'Mon', sales: 800, orders: 45, profit: 320 },
  { day: 'Tue', sales: 1200, orders: 62, profit: 480 },
  { day: 'Wed', sales: 1100, orders: 58, profit: 440 },
  { day: 'Thu', sales: 1600, orders: 78, profit: 640 },
  { day: 'Fri', sales: 2000, orders: 95, profit: 800 },
  { day: 'Sat', sales: 2400, orders: 120, profit: 960 },
  { day: 'Sun', sales: 1800, orders: 89, profit: 720 },
];

const productData = [
  { name: 'Cappuccino', value: 35, color: '#D97706' },
  { name: 'Latte', value: 25, color: '#F59E0B' },
  { name: 'Espresso', value: 20, color: '#FBBF24' },
  { name: 'Americano', value: 12, color: '#FCD34D' },
  { name: 'Others', value: 8, color: '#FEF3C7' },
];

const highlights = [
  { id: 'R1001', note: 'Highest single order', amount: 'R450', customer: 'Zara M.', time: '14:30', status: 'completed' },
  { id: 'R1007', note: 'Repeat customer (5th visit)', amount: 'R320', customer: 'Musa K.', time: '09:15', status: 'completed' },
  { id: 'R1012', note: 'Large corporate order', amount: 'R610', customer: 'TechCorp Ltd.', time: '11:45', status: 'completed' },
  { id: 'R1018', note: 'Peak hour rush', amount: 'R280', customer: 'Sarah L.', time: '08:30', status: 'completed' },
];

const timeSlots = [
  { time: '06:00', orders: 12, revenue: 240 },
  { time: '08:00', orders: 45, revenue: 900 },
  { time: '10:00', orders: 38, revenue: 760 },
  { time: '12:00', orders: 52, revenue: 1040 },
  { time: '14:00', orders: 35, revenue: 700 },
  { time: '16:00', orders: 28, revenue: 560 },
  { time: '18:00', orders: 22, revenue: 440 },
  { time: '20:00', orders: 15, revenue: 300 },
];

export default function QuickReport() {
  const [selectedMetric, setSelectedMetric] = useState('sales');
  const [timeRange, setTimeRange] = useState('week');

  const getChartData = () => {
    switch (selectedMetric) {
      case 'orders': return salesData.map(d => ({ ...d, value: d.orders }));
      case 'profit': return salesData.map(d => ({ ...d, value: d.profit }));
      default: return salesData.map(d => ({ ...d, value: d.sales }));
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'orders': return 'Orders';
      case 'profit': return 'Profit (R)';
      default: return 'Sales (R)';
    }
  };

  return (
    <main className="min-h-screen px-6 py-4 bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">📊</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Analytics Dashboard</h1>
              <p className="text-amber-700">Real-time insights and performance metrics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white border border-amber-300 rounded-lg text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map(({ title, value, icon, trend, trendColor }) => (
          <div
            key={title}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl transform group-hover:scale-110 transition-transform duration-200">
                {icon}
              </div>
              <div className={`text-sm font-semibold ${trendColor} bg-gray-100 px-2 py-1 rounded-full`}>
                {trend}
              </div>
            </div>
            <h3 className="text-sm font-medium text-amber-700 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-amber-900">{value}</p>
            <div className="mt-3 h-1 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full opacity-60"></div>
          </div>
        ))}
      </section>

      {/* Main Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-6 border-b border-amber-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Weekly Performance
              </h2>
              <div className="flex gap-2">
                {['sales', 'orders', 'profit'].map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      selectedMetric === metric
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                        : 'text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getChartData()}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #F3F4F6', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  fill="url(#colorGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Distribution */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-6 border-b border-amber-100">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span className="text-2xl">🥧</span>
              Product Mix
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {productData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-amber-800">{item.name}</span>
                  </div>
                  <span className="font-semibold text-amber-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Hourly Trends */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-6 border-b border-amber-100">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span className="text-2xl">⏰</span>
              Hourly Trends
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeSlots}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Highlights */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-6 border-b border-amber-100">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              Notable Orders
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {highlights.map(({ id, note, customer, amount, time, status }) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-amber-900">{id}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {status}
                      </span>
                    </div>
                    <p className="text-sm text-amber-700 mb-1">{note}</p>
                    <div className="flex items-center gap-3 text-xs text-amber-600">
                      <span>👤 {customer}</span>
                      <span>🕐 {time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-900">{amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
        <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { action: 'Generate Daily Report', icon: '📄', color: 'from-blue-500 to-blue-600' },
            { action: 'Export Sales Data', icon: '📊', color: 'from-green-500 to-green-600' },
            { action: 'Inventory Alert', icon: '📦', color: 'from-orange-500 to-orange-600' },
            { action: 'Customer Insights', icon: '👥', color: 'from-purple-500 to-purple-600' },
          ].map(({ action, icon, color }) => (
            <button
              key={action}
              className={`bg-gradient-to-r ${color} text-white p-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-3`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="font-semibold text-sm">{action}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}