
import { getTestCodeState, hasSubmitted } from '@/lib/testCodes';
import PreStartScreen from '@/components/PreStartScreen';
import RunningScreen from '@/components/RunningScreen';
import SubmissionForm from '@/components/SubmissionForm';

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
                </div>
            </main>
        );
    }

    // Not submitted yet
    return (
        <SubmissionForm testCode={state.testCode} />
    );
}
