import { NextResponse } from 'next/server';
import { getTestCodeState } from '@/lib/testCodes';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { testCode } = body;

        if (!testCode) {
            return NextResponse.json({ error: 'TestCode is required' }, { status: 400 });
        }

        const state = await getTestCodeState(testCode);

        if (!state || state.status === 'not_invited') {
            return NextResponse.json({ status: 'not_invited' });
        }

        // Return the state so the frontend can route/render appropriately
        return NextResponse.json({
            status: 'ok',
            testCode: state.testCode,
            durationHours: state.durationHours,
            startTime: state.startTime,
            problemPdfId: state.problemPdfId,
            formUrlTemplate: state.formUrlTemplate,
        });
    } catch (error) {
        console.error('Lookup API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
