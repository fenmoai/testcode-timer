import { NextResponse } from 'next/server';
import { hasSubmitted, getTestCodeState } from '@/lib/testCodes';
import { uploadFile } from '@/lib/googleDrive';
import { appendRow } from '@/lib/googleSheets';

const FORM_RESPONSES_SHEET = process.env.FORM_RESPONSES_SHEET_NAME || 'FormResponses';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const testCode = formData.get('testCode') as string;
        const link1 = formData.get('link1') as string;
        const link2 = formData.get('link2') as string;
        const file = formData.get('file') as File | null;

        if (!testCode || !file || !link1) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Validation
        const state = await getTestCodeState(testCode);
        if (!state || state.status === 'not_invited') {
            return NextResponse.json({ error: 'Invalid TestCode' }, { status: 403 });
        }

        const alreadySubmitted = await hasSubmitted(testCode);
        if (alreadySubmitted) {
            return NextResponse.json({ error: 'Already submitted' }, { status: 409 });
        }

        // 2. Upload File to Drive
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${testCode}_${file.name}`; // Prefix with TestCode for safety

        // Upload
        const driveLink = await uploadFile(fileName, file.type, buffer);

        // 3. Append to Sheets
        // Columns: Timestamp, Public GitHub Repo, Live Deployment, Screenshot (Drive Link), TestCode
        const now = new Date().toISOString();
        const rowValues = [now, link1 || '', link2 || '', driveLink, testCode];

        await appendRow(FORM_RESPONSES_SHEET, rowValues);

        return NextResponse.json({ status: 'ok' });

    } catch (error: any) {
        console.error('Submission API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
