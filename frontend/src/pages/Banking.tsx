export default function Banking() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Banking</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Connect Bank Account
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Bank Feeds</h2>
          <p className="text-gray-500">
            No bank accounts connected. Connect your bank account to automatically import transactions.
          </p>
        </div>
      </div>
    </div>
  );
}
