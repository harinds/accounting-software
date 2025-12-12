export default function Transactions() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          New Transaction
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500">No transactions yet. Create your first transaction to get started.</p>
        </div>
      </div>
    </div>
  );
}
