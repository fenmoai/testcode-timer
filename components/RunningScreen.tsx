'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Countdown from './Countdown';
import PdfViewer from './PdfViewer';
import SubmissionForm from './SubmissionForm';

interface RunningScreenProps {
    testCode: string;
    startTime: string;
    durationHours: number;
    problemPdfId: string;
}

export default function RunningScreen({ testCode, startTime, durationHours, problemPdfId }: RunningScreenProps) {
    const router = useRouter();
    const [isFinished, setIsFinished] = useState(false);

    if (isFinished) {
        return <SubmissionForm testCode={testCode} />;
    }

    return (
        <main className="flex flex-col h-screen text-gray-900 bg-gray-50">
            <div className="bg-white shadow p-4 z-10 flex flex-col md:flex-row items-center justify-between">
                <Countdown
                    startTime={startTime}
                    durationHours={durationHours}
                    onEnd={() => router.refresh()}
                />
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to finish the test early? You cannot go back.')) {
                            setIsFinished(true);
                        }
                    }}
                    className="mt-2 md:mt-0 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
                >
                    Finish Test Early
                </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
                <PdfViewer fileId={problemPdfId} />
            </div>
        </main>
    );
}
