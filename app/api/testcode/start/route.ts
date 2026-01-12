import { NextResponse } from 'next/server';
import { setStartTime, getTestCodeState } from '@/lib/testCodes';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { testCode } = body;

        if (!testCode) {
            return NextResponse.json({ error: 'TestCode is required' }, { status: 400 });
        }

        // Verify validity again
        const state = await getTestCodeState(testCode);
        if (!state || state.status === 'not_invited') {
            return NextResponse.json({ error: 'Invalid test code' }, { status: 403 });
        }

        if (state.startTime) {
            return NextResponse.json({ status: 'already_started', startTime: state.startTime });
        }

        const now = new Date().toISOString();
        await setStartTime(testCode, now);

        return NextResponse.json({ status: 'started', startTime: now });

    } catch (error) {
        console.error('Start API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
