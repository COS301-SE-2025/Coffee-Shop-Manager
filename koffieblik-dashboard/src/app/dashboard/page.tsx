export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-amber-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-amber-900">Dashboard</h1>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-inner-lg">
          <h2 className="text-sm text-amber-900 mb-1">Total Sales Today</h2>
          <p className="text-2xl font-semibold text-amber-600">R1,540</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-inner-lg">
          <h2 className="text-sm text-amber-900 mb-1">Orders Completed</h2>
          <p className="text-2xl font-semibold text-amber-600">42</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-inner-lg">
          <h2 className="text-sm text-amber-900 mb-1">Top-Selling Item</h2>
          <p className="text-2xl font-semibold text-amber-600">Cappuccino</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-inner-lg">
          <h2 className="text-sm text-amber-900 mb-1">Stock Alerts</h2>
          <p className="text-2xl font-semibold text-red-600">Milk Low</p>
        </div>
      </div>

      {/* Recent Orders */}
      {/* <section className="bg-white rounded-2xl shadow p-6"> */}
      {/* <h2 className="text-xl font-bold mb-4 text-amber-900">Recent Orders</h2> */}
      <section className="bg-white rounded-2xl shadow p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold mb-4 text-amber-900">Recent Orders</h2>

          <div className="flex gap-2 flex-wrap">
            <select className="p-2 border rounded text-sm text-amber-900">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>Custom Range</option>
            </select>

            {/* Optional: Custom range inputs (visible when 'Custom Range' is selected) */}
            <input type="date" className="p-2 border rounded text-sm text-amber-900" />
            <span className="text-amber-900 text-sm self-center">to</span>
            <input type="date" className="p-2 border rounded text-sm text-amber-900" />
          </div>
        </div>
        <table className="w-full text-left text-sm text-amber-600 bg-white rounded-xl overflow-hidden">
          <thead>
            <tr className="text-amber-900 border-b">
              <th className="pb-2">Order #</th>
              <th className="pb-2">Customer</th>
              <th className="pb-2">Item</th>
              <th className="pb-2">Total</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-amber-50">
              <td className="py-2">#1001</td>
              <td>Thando M.</td>
              <td>Latte x2</td>
              <td>R70</td>
              <td><span className="text-green-700 font-medium">Completed</span></td>
            </tr>
            <tr className="border-b hover:bg-amber-50">
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
