'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [testCode, setTestCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/testcode/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCode }),
      });

      const data = await res.json();

      if (data.status === 'ok') {
        router.push(`/test/${data.testCode}`);
      } else if (data.status === 'not_invited') {
        setError('You are not yet invited to the test.');
      } else if (data.error) {
        setError(data.error);
      } else {
        setError('Unknown error occurred.');
      }
    } catch (err) {
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 text-gray-900">
      <div className="z-10 max-w-md w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">{process.env.NEXT_PUBLIC_TITLE || 'TestCode Timer'}</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="testCode">
              Enter your TestCode
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="testCode"
              type="text"
              placeholder="TEST123"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs italic mt-4 text-center">{error}</p>}
        </form>
      </div>
    </main>
  );
}
