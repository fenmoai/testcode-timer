
import { getTestCodeState, hasSubmitted } from '@/lib/testCodes';
import PreStartScreen from '@/components/PreStartScreen';
import RunningScreen from '@/components/RunningScreen';

// We disable caching for this page to ensure fresh state on reload
export const dynamic = 'force-dynamic';

export default async function TestPage({ params }: { params: Promise<{ testCode: string }> }) {
    const { testCode } = await params;
    const state = await getTestCodeState(testCode);

    if (!state || state.status === 'not_invited' || !state.durationHours) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-24 text-gray-900">
                <h1 className="text-2xl font-bold text-red-600">You are not yet invited to the test.</h1>
            </main>
        );
    }

    // Phase 1: Not started
    if (!state.startTime) {
        return (
            <PreStartScreen
                testCode={state.testCode}
                durationHours={state.durationHours}
            />
        );
    }

    // Check time
    const start = new Date(state.startTime).getTime();
    const now = Date.now();
    const durationMs = state.durationHours * 3600 * 1000;
    const end = start + durationMs;
    const remaining = end - now;

    // Phase 2: Running
    if (remaining > 0) {
        return (
            <RunningScreen
                startTime={state.startTime}
                durationHours={state.durationHours}
                problemPdfId={state.problemPdfId}
            />
        );
    }

    // Phase 3: Ended
    // Check submission
    const submitted = await hasSubmitted(state.testCode);

    if (submitted) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-24 text-gray-900 bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-lg text-center">
                    <h1 className="text-3xl font-bold text-green-600 mb-4">Test Completed</h1>
                    <p className="text-lg text-gray-700">Your responses have already been submitted. Thank you.</p>
                    <div className="mt-8 border-t pt-8">
                        <p className="text-sm text-gray-500 mb-2">Reference Problem:</p>
                        <div className="h-64 overflow-hidden border">
                            <iframe
                                src={`https://docs.google.com/viewer?srcid=${state.problemPdfId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`}
                                className="w-full h-full border rounded"
                                title="Problem Statement"
                            />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // Not submitted yet
    const formUrl = state.formUrlTemplate.replace('__TESTCODE__', state.testCode);

    return (
        <main className="flex flex-col h-screen text-gray-900 bg-gray-50">
            <div className="bg-yellow-50 p-4 border-b border-yellow-200 text-center shadow-sm z-10">
                <h1 className="text-xl font-bold text-red-600 mb-2">The test time is over. Please submit your answers now.</h1>
                <a
                    href={formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded"
                >
                    Open submission form
                </a>
            </div>
            <div className="flex-1 p-4">
                <iframe
                    src={`https://docs.google.com/viewer?srcid=${state.problemPdfId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`}
                    className="w-full h-full border rounded"
                    title="Problem Statement"
                />
            </div>
        </main>
    );
}
