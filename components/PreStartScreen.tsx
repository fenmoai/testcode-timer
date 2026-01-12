'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PreStartScreenProps {
    testCode: string;
    durationHours: number;
}

export default function PreStartScreen({ testCode, durationHours }: PreStartScreenProps) {
    const [acknowledged, setAcknowledged] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleStart = async () => {
        if (!acknowledged) return;
        setLoading(true);

        try {
            const res = await fetch('/api/testcode/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testCode }),
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to start test. Please try again.');
            }
        } catch (e) {
            alert('Error connecting to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 text-gray-900">
            <div className="max-w-xl w-full bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold mb-6 text-center">Test Readiness</h1>

                <div className="prose mb-8">
                    <p className="text-lg mb-4">
                        This test has a duration of <strong>{durationHours} hours</strong> from the moment you start it.
                    </p>
                    <p className="text-gray-600">
                        Ensure you have a stable internet connection and are ready to focus for the entire duration.
                        The timer will continue running even if you close the window.
                    </p>
                </div>

                <div className="mb-8 flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="ack"
                        className="mt-1 h-5 w-5"
                        checked={acknowledged}
                        onChange={(e) => setAcknowledged(e.target.checked)}
                    />
                    <label htmlFor="ack" className="text-sm text-gray-700 cursor-pointer select-none">
                        I understand that once I start, the timer will run continuously for {durationHours} hours.
                    </label>
                </div>

                <button
                    onClick={handleStart}
                    disabled={!acknowledged || loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                    {loading ? 'Starting...' : 'Start Test'}
                </button>
            </div>
        </main>
    );
}
