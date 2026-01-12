'use client';

import { useEffect, useState } from 'react';

interface CountdownProps {
    startTime: string; // ISO
    durationHours: number;
    onEnd: () => void;
}

export default function Countdown({ startTime, durationHours, onEnd }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const start = new Date(startTime).getTime();
        const end = start + durationHours * 3600 * 1000;

        const tick = () => {
            const now = Date.now();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('00:00:00');
                onEnd();
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(
                `${hours.toString().padStart(2, '0')}:${minutes
                    .toString()
                    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        tick();
        const timer = setInterval(tick, 1000);

        return () => clearInterval(timer);
    }, [startTime, durationHours, onEnd]);

    return (
        <div className="text-4xl font-mono font-bold text-center my-4">
            Time remaining: {timeLeft}
        </div>
    );
}
