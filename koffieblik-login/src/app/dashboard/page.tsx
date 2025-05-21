export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-sm text-black mb-1">Total Sales Today</h2>
<p className="text-2xl font-semibold text-black">R1,540</p>

        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-sm text-black mb-1">Orders Completed</h2>
          <p className="text-2xl font-semibold text-black">42</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-sm text-black mb-1">Top-Selling Item</h2>
          <p className="text-2xl font-semibold text-black">Cappuccino</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-sm text-gray-500 mb-1">Stock Alerts</h2>
          <p className="text-2xl font-semibold text-red-500">Milk Low</p>
        </div>
      </div>

      {/* Recent Orders */}
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Orders</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="pb-2">Order #</th>
              <th className="pb-2">Customer</th>
              <th className="pb-2">Item</th>
              <th className="pb-2">Total</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-2">#1001</td>
              <td>Thando M.</td>
              <td>Latte x2</td>
              <td>R70</td>
              <td><span className="text-green-600 font-medium">Completed</span></td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-2">#1002</td>
              <td>Nomsa L.</td>
              <td>Espresso</td>
              <td>R25</td>
              <td><span className="text-yellow-600 font-medium">Pending</span></td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
