export default function Tax() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tax</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">GST Collected</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">$0.00</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">GST Paid</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">$0.00</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Net GST</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">$0.00</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Tax Returns</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              New BAS Return
            </button>
          </div>
          <p className="text-gray-500">No tax returns yet.</p>
        </div>
      </div>
    </div>
  );
}
