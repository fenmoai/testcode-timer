'use client';

import { useRouter } from 'next/navigation';
import Countdown from './Countdown';
import PdfViewer from './PdfViewer';

interface RunningScreenProps {
    startTime: string;
    durationHours: number;
    problemPdfId: string;
}

export default function RunningScreen({ startTime, durationHours, problemPdfId }: RunningScreenProps) {
    const router = useRouter();

    return (
        <main className="flex flex-col h-screen text-gray-900 bg-gray-50">
            <div className="bg-white shadow p-4 z-10">
                <Countdown
                    startTime={startTime}
                    durationHours={durationHours}
                    onEnd={() => router.refresh()}
                />
            </div>
            <div className="flex-1 p-4 overflow-hidden">
                <PdfViewer fileId={problemPdfId} />
            </div>
        </main>
    );
}
