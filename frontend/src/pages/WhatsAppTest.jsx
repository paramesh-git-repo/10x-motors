import { useState } from 'react';
import { sendWhatsAppTest, getWhatsAppStatus } from '../utils/api';

function WhatsAppTest() {
  const [number, setNumber] = useState('919360726026');
  const [message, setMessage] = useState('Test message from CRM browser interface!');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);

  const checkStatus = async () => {
    try {
      const response = await getWhatsAppStatus();
      setStatus(response);
    } catch (error) {
      setStatus({ error: error.message });
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await sendWhatsAppTest(number, message);
      setResult({ success: true, message: response.message });
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            WhatsApp Test Interface
          </h1>

          {/* Status Check */}
          <div className="mb-6">
            <button
              onClick={checkStatus}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Check WhatsApp Status
            </button>
            {status && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <pre className="text-sm">{JSON.stringify(status, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Test Form */}
          <form onSubmit={sendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (with country code, no +)
              </label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="919360726026"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Format: [country code][number] e.g., 919360726026 for India
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send WhatsApp Message'}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className={`mt-6 p-4 rounded ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {result.success ? (
                <p className="text-green-800">✅ {result.message}</p>
              ) : (
                <p className="text-red-800">❌ {result.error}</p>
              )}
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> WhatsApp must be enabled and connected for this to work.
              Check status above to verify connection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppTest;

